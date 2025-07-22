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
