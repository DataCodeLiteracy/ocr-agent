"use client"

import { useState, useEffect } from "react"
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { User } from "@/types"

// undefined와 null 값을 제거하는 함수
function removeUndefinedValues(obj: any): any {
  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = removeUndefinedValues(value)
      } else {
        cleaned[key] = value
      }
    }
  }
  return cleaned
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        console.log("Firebase Auth 상태 변경:", firebaseUser?.uid)
        
        if (firebaseUser) {
          try {
            console.log("Firestore 연결 시도...")
            
            // Firestore에서 사용자 정보 가져오기
            const userDocRef = doc(db, "users", firebaseUser.uid)
            const userDoc = await getDoc(userDocRef)
            console.log("Firestore 문서 존재:", userDoc.exists())

            if (userDoc.exists()) {
              console.log("기존 사용자 발견")
              // 기존 사용자 정보 업데이트
              const existingUser = userDoc.data() as User
              const updatedUser: User = {
                ...existingUser,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              }
              
              // Firestore 업데이트 (undefined 값 제거)
              const updateData = removeUndefinedValues({
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              })
              
              await updateDoc(userDocRef, updateData)
              
              setUser(updatedUser)
              console.log("기존 사용자 업데이트 완료")
            } else {
              console.log("새 사용자 생성 시작")
              // 새 사용자 생성
              const newUser: User = {
                // Firebase Auth 정보
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                photoURL: firebaseUser.photoURL || null,
                emailVerified: firebaseUser.emailVerified,
                phoneNumber: firebaseUser.phoneNumber || null,
                
                // Firestore 사용자 관리 필드
                is_premium: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                
                // 사용량 관리
                dailyUsage: 0,
                lastUsageDate: new Date().toISOString().split("T")[0],
                totalUsage: 0,
                
                // 추가 정보
                lastLoginAt: new Date(),
                isActive: true,
                role: 'user',
              }

              console.log("새 사용자 데이터:", newUser)
              
              // Firestore에 저장할 데이터에서 undefined 값 제거
              const cleanUserData = removeUndefinedValues(newUser)
              console.log("정리된 사용자 데이터:", cleanUserData)
              
              await setDoc(userDocRef, cleanUserData)
              setUser(newUser)
              console.log("새 사용자 생성 완료")
            }
          } catch (error) {
            console.error("Firestore 오류 상세:", error)
            console.error("오류 타입:", typeof error)
            console.error("오류 메시지:", error instanceof Error ? error.message : error)
            
            // 오류가 발생해도 기본 사용자 정보는 설정
            const fallbackUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || null,
              emailVerified: firebaseUser.emailVerified,
              phoneNumber: firebaseUser.phoneNumber || null,
              is_premium: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              dailyUsage: 0,
              lastUsageDate: new Date().toISOString().split("T")[0],
              totalUsage: 0,
              lastLoginAt: new Date(),
              isActive: true,
              role: 'user',
            }
            setUser(fallbackUser)
            console.log("fallback 사용자 설정됨")
          }
        } else {
          console.log("사용자 로그아웃 - 상태 초기화")
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      console.log("Google 로그인 시도...")
      await signInWithPopup(auth, provider)
      console.log("Google 로그인 성공")
    } catch (error) {
      console.error("Google 로그인 오류:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log("로그아웃 시도...")
      await signOut(auth)
      console.log("로그아웃 성공")
    } catch (error) {
      console.error("로그아웃 오류:", error)
      throw error
    }
  }

  const updateUserUsage = async (userId: string) => {
    const today = new Date().toISOString().split("T")[0]
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data() as User

      if (userData.lastUsageDate === today) {
        // 오늘 이미 사용한 경우
        await updateDoc(userRef, removeUndefinedValues({
          dailyUsage: userData.dailyUsage + 1,
          totalUsage: userData.totalUsage + 1,
          updatedAt: new Date(),
        }))
      } else {
        // 새로운 날짜인 경우
        await updateDoc(userRef, removeUndefinedValues({
          dailyUsage: 1,
          lastUsageDate: today,
          totalUsage: userData.totalUsage + 1,
          updatedAt: new Date(),
        }))
      }
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    updateUserUsage,
  }
}
