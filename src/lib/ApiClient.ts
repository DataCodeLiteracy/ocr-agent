import { OCRResponse } from "@/types"

export class ApiClient {
  private static instance: ApiClient
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  async post<T = unknown>(
    endpoint: string,
    data?: FormData | object,
    authToken?: string
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const options: RequestInit = {
        method: "POST",
      }

      // 인증 토큰 추가
      if (authToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authToken}`,
        }
      }

      if (data instanceof FormData) {
        options.body = data
      } else if (data) {
        options.headers = {
          ...options.headers,
          "Content-Type": "application/json",
        }
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  async get<T = unknown>(endpoint: string, authToken?: string): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const options: RequestInit = {
        method: "GET",
      }

      // 인증 토큰 추가
      if (authToken) {
        options.headers = {
          Authorization: `Bearer ${authToken}`,
        }
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  async uploadFile<T = unknown>(
    endpoint: string,
    file: File,
    fieldName: string = "file",
    authToken?: string
  ): Promise<T> {
    try {
      const formData = new FormData()
      formData.append(fieldName, file)

      return await this.post<T>(endpoint, formData, authToken)
    } catch (error) {
      console.error(`Upload Error (${endpoint}):`, error)
      throw error
    }
  }
}
