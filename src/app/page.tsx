"use client"

import { useState } from "react"
import {
  Camera,
  FileText,
  Smartphone,
  BookOpen,
  Info,
  Copy,
  Check,
} from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import Button from "@/components/Button"
import LoadingSpinner from "@/components/LoadingSpinner"
import OCRResult from "@/components/OCRResult"
import { OCRService, BatchOCRResult } from "@/lib/OCRService"
import { OCRResponse } from "@/types"

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchResult, setBatchResult] = useState<BatchOCRResult | null>(null)
  const [error, setError] = useState<string>("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [allTextCopied, setAllTextCopied] = useState(false)

  const ocrService = new OCRService()

  const handleImageSelect = (files: File[]) => {
    setSelectedImages(files)
    setBatchResult(null)
    setError("")
  }

  const handleClearImages = () => {
    setSelectedImages([])
    setBatchResult(null)
    setError("")
  }

  const handlePerformOCR = async () => {
    if (selectedImages.length === 0) return

    setIsProcessing(true)
    setError("")

    try {
      const result = await ocrService.performBatchOCR(selectedImages)
      setBatchResult(result)

      if (!result.success) {
        setError("모든 이미지에서 텍스트 추출에 실패했습니다")
      }
    } catch (error) {
      setError("예상치 못한 오류가 발생했습니다")
      console.error("OCR Error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      if (index !== undefined) {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      } else {
        setAllTextCopied(true)
        setTimeout(() => setAllTextCopied(false), 2000)
      }
    } catch (error) {
      console.error("복사 실패:", error)
    }
  }

  const getAllText = () => {
    if (!batchResult) return ""
    return batchResult.results
      .filter((result) => result.success && result.data?.text)
      .map((result) => result.data?.text)
      .join("\n\n---\n\n")
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-3'>
              <BookOpen className='h-8 w-8 text-blue-600' />
              <h1 className='text-2xl font-bold text-gray-900'>OCR 에이전트</h1>
            </div>
            <div className='flex items-center space-x-4 text-sm text-gray-500'>
              <div className='flex items-center space-x-1'>
                <Smartphone className='h-4 w-4' />
                <span>모바일 친화적</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4'>
            책 페이지에서 텍스트 추출하기
          </h2>
          <p className='text-base sm:text-lg text-gray-600 max-w-2xl mx-auto'>
            핸드폰으로 책 페이지를 촬영하거나 이미지를 업로드하여 고급 OCR
            기술로 텍스트를 추출하세요.
          </p>
        </div>

        {/* Features */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4'>
              <Camera className='h-6 w-6 text-blue-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              쉬운 촬영
            </h3>
            <p className='text-gray-600'>
              핸드폰 카메라로 직접 촬영하거나 기존 이미지를 업로드하세요.
            </p>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4'>
              <FileText className='h-6 w-6 text-green-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              스마트 OCR
            </h3>
            <p className='text-gray-600'>
              Google Vision API로 구동되는 고급 텍스트 인식 기술.
            </p>
          </div>

          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4'>
              <BookOpen className='h-6 w-6 text-purple-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              책 최적화
            </h3>
            <p className='text-gray-600'>
              책 페이지와 문서에 특화된 텍스트 추출 기능.
            </p>
          </div>
        </div>

        {/* API Info */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <div className='flex items-start space-x-3'>
            <Info className='h-5 w-5 text-blue-600 mt-0.5' />
            <div className='text-sm text-blue-800'>
              <p className='font-medium mb-1'>Google Vision API 사용 안내</p>
              <ul className='space-y-1 text-xs'>
                <li>• 월 1,000회 무료 OCR 처리</li>
                <li>• 최대 파일 크기: 10MB</li>
                <li>• 지원 형식: JPEG, PNG, GIF, BMP, WEBP</li>
                <li>• 최대 해상도: 20MP (메가픽셀)</li>
                <li>• 여러 이미지 동시 처리 가능</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h3 className='text-xl font-semibold text-gray-900 mb-4'>
            이미지 업로드
          </h3>

          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImages={selectedImages}
            onClearImages={handleClearImages}
            maxSize={10}
          />

          {selectedImages.length > 0 && (
            <div className='mt-6'>
              <Button
                onClick={handlePerformOCR}
                loading={isProcessing}
                disabled={isProcessing}
                className='w-full'
                size='lg'
              >
                {isProcessing
                  ? "처리 중..."
                  : `${selectedImages.length}개 이미지 텍스트 추출`}
              </Button>
            </div>
          )}

          {error && (
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-600'>{error}</p>
            </div>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
            <LoadingSpinner
              size='lg'
              text='이미지에서 텍스트를 추출하고 있습니다...'
            />
          </div>
        )}

        {/* OCR Results */}
        {batchResult && (
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                텍스트 추출 결과
              </h3>
              <div className='flex items-center space-x-4'>
                <div className='text-sm text-gray-600'>
                  성공:{" "}
                  <span className='font-medium text-green-600'>
                    {batchResult.totalSuccess}
                  </span>{" "}
                  / 실패:{" "}
                  <span className='font-medium text-red-600'>
                    {batchResult.totalFailed}
                  </span>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => copyToClipboard(getAllText())}
                  className='flex items-center space-x-2'
                >
                  {allTextCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{allTextCopied ? "복사됨" : "전체 복사"}</span>
                </Button>
              </div>
            </div>

            <div className='space-y-6 max-h-[72rem] overflow-y-auto'>
              {batchResult.results.map((result, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-4'
                >
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-medium text-gray-900'>
                      이미지 {index + 1}
                    </h4>
                    {result.success && result.data?.text && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          copyToClipboard(result.data!.text, index)
                        }
                        className='flex items-center space-x-2'
                      >
                        {copiedIndex === index ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                        <span>{copiedIndex === index ? "복사됨" : "복사"}</span>
                      </Button>
                    )}
                  </div>
                  <OCRResult result={result} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center text-gray-500'>
            <p>&copy; 2024 OCR 에이전트. Google Vision API로 구동됩니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
