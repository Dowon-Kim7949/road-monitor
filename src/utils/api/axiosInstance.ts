import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { getLocalToken } from '@/utils/storage'

const commonHeader = {
  'Content-Type': 'application/json;charset=UTF-8',
  'Access-Control-Allow-Origin': '*',
  Accept: 'application/json',
}

class ApiWrapper {
  private axiosInstance: AxiosInstance
  constructor(baseURL: string, withCredentials: boolean, loginHeader?: any) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: loginHeader ? { ...loginHeader } : { ...commonHeader },
      withCredentials,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token: string | null = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => Promise.reject(error),
    )
  }

  async axiosCaller(method: string, url: string, params: any = null, customHeaders: any = null) {
    const requestData: any = {
      method,
      url,
    }

    if (method === 'get') {
      requestData.params = params
    } else if (method === 'post' || method === 'put' || method === 'patch') {
      requestData.data = params
    }

    if (customHeaders) {
      requestData.headers = { ...requestData.headers, ...customHeaders }
    }

    const response = await this.axiosInstance.request(requestData)
    return response
  }
}

export default ApiWrapper
