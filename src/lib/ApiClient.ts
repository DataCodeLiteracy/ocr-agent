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
    data?: FormData | object
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const options: RequestInit = {
        method: "POST",
      }

      if (data instanceof FormData) {
        options.body = data
      } else if (data) {
        options.headers = {
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

  async get<T = unknown>(endpoint: string): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        method: "GET",
      })

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
    fieldName: string = "file"
  ): Promise<T> {
    try {
      const formData = new FormData()
      formData.append(fieldName, file)

      return await this.post<T>(endpoint, formData)
    } catch (error) {
      console.error(`Upload Error (${endpoint}):`, error)
      throw error
    }
  }
}
