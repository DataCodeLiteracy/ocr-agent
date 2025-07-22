import { ApiClient } from "./ApiClient"
import { OCRResponse } from "@/types"

export interface BatchOCRResult {
  success: boolean
  results: OCRResponse[]
  totalProcessed: number
  totalSuccess: number
  totalFailed: number
}

export class OCRService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = ApiClient.getInstance()
  }

  async performOCR(imageFile: File): Promise<OCRResponse> {
    try {
      const result = await this.apiClient.uploadFile<OCRResponse>(
        "/ocr",
        imageFile,
        "image"
      )
      return result
    } catch (error) {
      console.error("OCR 서비스 오류:", error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      }
    }
  }

  async performBatchOCR(imageFiles: File[]): Promise<BatchOCRResult> {
    const results: OCRResponse[] = []
    let totalSuccess = 0
    let totalFailed = 0

    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const result = await this.performOCR(imageFiles[i])
        results.push(result)

        if (result.success) {
          totalSuccess++
        } else {
          totalFailed++
        }
      } catch (error) {
        console.error(`이미지 ${i + 1} 처리 오류:`, error)
        results.push({
          success: false,
          error: `이미지 ${i + 1} 처리 중 오류가 발생했습니다`,
        })
        totalFailed++
      }
    }

    return {
      success: totalSuccess > 0,
      results,
      totalProcessed: imageFiles.length,
      totalSuccess,
      totalFailed,
    }
  }

  async uploadImage(
    imageFile: File
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const result = await this.apiClient.uploadFile<{
        success: boolean
        url?: string
        error?: string
      }>("/upload", imageFile, "image")
      return result
    } catch (error) {
      console.error("업로드 서비스 오류:", error)
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      }
    }
  }
}
