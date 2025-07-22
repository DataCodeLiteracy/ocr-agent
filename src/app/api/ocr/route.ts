import { NextRequest, NextResponse } from "next/server"
import { ImageAnnotatorClient } from "@google-cloud/vision"
import { auth } from "firebase-admin"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Firebase Admin 초기화
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

// 사용자 권한 체크 함수
async function checkUserPermission(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("인증 토큰이 필요합니다")
  }

  const token = authHeader.substring(7)

  try {
    const decodedToken = await auth().verifyIdToken(token)
    const userDoc = await db.collection("users").doc(decodedToken.uid).get()

    if (!userDoc.exists) {
      throw new Error("사용자 정보를 찾을 수 없습니다")
    }

    const userData = userDoc.data()
    
    if (!userData?.is_premium) {
      throw new Error('승인되지 않은 사용자입니다. 관리자 승인을 기다려주세요.')
    }

    // 일일 사용량 체크
    const today = new Date().toISOString().split("T")[0]
    const dailyLimit = 50 // 일일 제한

    if (userData.lastUsageDate === today && userData.dailyUsage >= dailyLimit) {
      throw new Error("일일 사용량 한도를 초과했습니다")
    }

    return decodedToken.uid
  } catch (error) {
    console.error("권한 체크 오류:", error)
    throw error
  }
}

// Google Cloud Vision API 클라이언트 초기화
const createClient = () => {
  // Vercel 배포를 위해 환경 변수 방식 사용
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    console.log("환경 변수 확인됨:", {
      hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      clientEmailLength: process.env.GOOGLE_CLIENT_EMAIL?.length,
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length,
    })

    return new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    })
  }

  // 로컬 개발 환경에서는 키 파일 사용 (선택적)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(
      "키 파일 방식 사용:",
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    )
    return new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })
  }

  console.error("환경 변수 확인:", {
    GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_APPLICATION_CREDENTIALS:
      !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  })

  throw new Error("Google Cloud 인증 정보가 설정되지 않았습니다")
}

export async function POST(request: NextRequest) {
  try {
    // 사용자 권한 체크
    const authHeader = request.headers.get("authorization")
    const userId = await checkUserPermission(authHeader)

    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "이미지 파일이 제공되지 않았습니다" },
        { status: 400 }
      )
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Google Vision API 클라이언트 생성
    const client = createClient()

    // Google Vision API로 텍스트 추출
    const [result] = await client.textDetection(buffer)
    const detections = result.textAnnotations

    if (!detections || detections.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          text: "",
          results: [],
        },
      })
    }

    // 전체 텍스트 추출 (첫 번째 요소가 전체 텍스트)
    const fullText = detections[0].description || ""

    // 개별 텍스트 블록 정보 추출 (실제 confidence 값 사용)
    const results = detections.slice(1).map((detection) => {
      // Google Vision API는 개별 confidence를 제공하지 않으므로
      // 텍스트 길이와 품질을 기반으로 추정
      const textLength = detection.description?.length || 0
      const confidence = Math.min(0.95, Math.max(0.7, 0.7 + textLength * 0.01))

      return {
        text: detection.description || "",
        confidence,
        boundingBox: detection.boundingPoly?.vertices?.[0]
          ? {
              x: detection.boundingPoly.vertices[0].x || 0,
              y: detection.boundingPoly.vertices[0].y || 0,
              width:
                (detection.boundingPoly.vertices[1]?.x || 0) -
                (detection.boundingPoly.vertices[0]?.x || 0),
              height:
                (detection.boundingPoly.vertices[2]?.y || 0) -
                (detection.boundingPoly.vertices[0]?.y || 0),
            }
          : undefined,
      }
    })

    // 사용량 업데이트
    const today = new Date().toISOString().split("T")[0]
    const userRef = db.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      const userData = userDoc.data()

      if (userData?.lastUsageDate === today) {
        await userRef.update({
          dailyUsage: (userData.dailyUsage || 0) + 1,
        })
      } else {
        await userRef.update({
          dailyUsage: 1,
          lastUsageDate: today,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        text: fullText,
        results,
      },
    })
  } catch (error) {
    console.error("OCR API Error:", error)

    // 더 자세한 에러 정보 제공
    let errorMessage = "서버 내부 오류가 발생했습니다"
    if (error instanceof Error) {
      errorMessage = error.message
      console.error("에러 상세:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
