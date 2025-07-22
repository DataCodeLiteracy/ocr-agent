"use client"

import { useState } from "react"
import { Copy, Check, Download } from "lucide-react"
import Button from "./Button"
import { OCRResponse } from "@/types"

interface OCRResultProps {
  result: OCRResponse
  onDownload?: () => void
}

export default function OCRResult({ result, onDownload }: OCRResultProps) {
  const [copied, setCopied] = useState(false)

  if (!result.success || !result.data) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-600'>
          {result.error || "이미지에서 텍스트를 추출하는데 실패했습니다"}
        </p>
      </div>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.data!.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("텍스트 복사 실패:", error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([result.data!.text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ocr-result.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900'>추출된 텍스트</h3>
        <div className='flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleCopy}
            className='flex items-center space-x-1'
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "복사됨!" : "복사"}</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDownload}
            className='flex items-center space-x-1'
          >
            <Download size={16} />
            <span>다운로드</span>
          </Button>
        </div>
      </div>

      <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <div className='max-h-96 overflow-y-auto'>
          <pre className='whitespace-pre-wrap text-sm text-gray-800 font-mono'>
            {result.data!.text}
          </pre>
        </div>
      </div>

      {result.data!.results.length > 0 && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>
            정확도: {Math.round(result.data!.results[0].confidence * 100)}%
          </h4>
        </div>
      )}
    </div>
  )
}
