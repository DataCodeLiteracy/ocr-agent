export interface OCRResult {
  text: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface OCRResponse {
  success: boolean
  data?: {
    text: string
    results: OCRResult[]
  }
  error?: string
}

export interface UploadedImage {
  id: string
  file: File
  preview: string
  uploadedAt: Date
}

export interface User {
  // Firebase Auth 정보 (필수)
  uid: string
  email: string
  displayName: string
  emailVerified: boolean
  
  // Firebase Auth 정보 (선택)
  photoURL?: string | null
  phoneNumber?: string | null
  
  // Firestore 사용자 관리 필드 (필수)
  is_premium: boolean
  createdAt: Date
  updatedAt: Date
  
  // Firestore 사용자 관리 필드 (선택)
  approvedAt?: Date | null
  approvedBy?: string | null
  
  // 사용량 관리 (필수)
  dailyUsage: number
  lastUsageDate: string
  totalUsage: number
  
  // 추가 정보 (필수)
  lastLoginAt: Date
  isActive: boolean
  role: 'user' | 'admin'
}
