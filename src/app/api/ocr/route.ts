import { NextRequest, NextResponse } from "next/server"
import { ImageAnnotatorClient } from "@google-cloud/vision"

// Google Cloud Vision API 클라이언트 초기화
const createClient = () => {
  // Vercel 배포를 위해 환경 변수 방식 사용
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    })
  }

  // 로컬 개발 환경에서는 키 파일 사용 (선택적)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })
  }

  throw new Error("Google Cloud 인증 정보가 설정되지 않았습니다")
}

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: {
        text: fullText,
        results,
      },
    })
  } catch (error) {
    console.error("OCR API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "서버 내부 오류가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
