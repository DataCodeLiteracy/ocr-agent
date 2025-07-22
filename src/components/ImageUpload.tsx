"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, Upload, X, AlertCircle } from "lucide-react"
import Button from "./Button"

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void
  selectedImages?: File[]
  onClearImages?: () => void
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
}

export default function ImageUpload({
  onImageSelect,
  selectedImages = [],
  onClearImages,
  accept = "image/*",
  maxSize = 10, // 10MB default
  multiple = true,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>("")
  const [isMobile, setIsMobile] = useState(false)

  // 모바일 디바이스 감지 (클라이언트 사이드에서만 실행)
  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    )
  }, [])

  const handleFileSelect = (files: FileList | File[]) => {
    setError("")
    const fileArray = Array.from(files)
    const validFiles: File[] = []

    for (const file of fileArray) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("올바른 이미지 파일만 선택해주세요.")
        continue
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      // 파일을 생성 시간 순으로 정렬 (오래된 것부터 - 책 페이지 순서)
      const sortedFiles = validFiles.sort((a, b) => {
        const timeA =
          a.lastModified || a.webkitRelativePath
            ? new Date(a.lastModified).getTime()
            : 0
        const timeB =
          b.lastModified || b.webkitRelativePath
            ? new Date(b.lastModified).getTime()
            : 0
        return timeA - timeB // 오래된 것부터 정렬
      })

      onImageSelect(sortedFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleCameraClick = () => {
    if (isMobile) {
      // 모바일에서는 카메라 접근 시도
      fileInputRef.current?.click()
    } else {
      // 데스크톱에서는 일반 파일 선택
      setError(
        "카메라 기능은 모바일에서만 사용 가능합니다. 이미지 업로드를 이용해주세요."
      )
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileTime = (file: File) => {
    const date = new Date(file.lastModified)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className='w-full'>
      <input
        ref={fileInputRef}
        type='file'
        accept={accept}
        onChange={handleFileInputChange}
        className='hidden'
        capture={isMobile ? "environment" : undefined}
        multiple={multiple}
      />

      {selectedImages.length > 0 ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='text-lg font-medium text-gray-900'>
              선택된 이미지 ({selectedImages.length}개)
            </h4>
            {onClearImages && (
              <Button
                variant='outline'
                size='sm'
                onClick={onClearImages}
                className='flex items-center space-x-1'
              >
                <X size={16} />
                <span>모두 지우기</span>
              </Button>
            )}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {selectedImages.map((file, index) => (
              <div key={index} className='relative bg-gray-100 rounded-lg p-3'>
                <div
                  className='text-xs text-gray-600 truncate mb-1'
                  title={file.name}
                >
                  {file.name}
                </div>
                <div className='text-xs text-gray-500 mb-1'>
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className='text-xs text-blue-600'>
                  📅 {formatFileTime(file)}
                </div>
                <div className='absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <div className='flex items-center space-x-2 text-blue-800'>
              <AlertCircle size={16} />
              <span className='text-sm'>
                📚 촬영 순서대로 정렬되었습니다 (오래된 것부터)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4'>
              <Button
                variant='outline'
                onClick={handleCameraClick}
                className='flex items-center space-x-2'
              >
                <Camera size={20} />
                <span>{isMobile ? "사진 촬영" : "카메라 (모바일)"}</span>
              </Button>
              <Button
                variant='outline'
                onClick={handleUploadClick}
                className='flex items-center space-x-2'
              >
                <Upload size={20} />
                <span>이미지 업로드</span>
              </Button>
            </div>

            {isMobile && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <div className='flex items-center space-x-2 text-blue-800'>
                  <AlertCircle size={16} />
                  <span className='text-sm'>
                    📱 모바일에서 카메라 접근 권한을 허용해주세요
                  </span>
                </div>
              </div>
            )}

            <p className='text-sm text-gray-500'>
              여기에 이미지를 드래그 앤 드롭하거나 위의 버튼을 클릭하세요
            </p>
            <p className='text-xs text-gray-400'>
              최대 파일 크기: {maxSize}MB (여러 개 선택 가능)
            </p>
            <p className='text-xs text-blue-600'>
              💡 촬영 순서대로 자동 정렬됩니다 (오래된 것부터)
            </p>
          </div>
        </div>
      )}

      {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
    </div>
  )
}
