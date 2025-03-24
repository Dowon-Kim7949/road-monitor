import ApiWrapper from './axiosInstance'
const baseUrl = import.meta.env.VITE_APP_BACKURL

const loginHeader = {
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  'Access-Control-Allow-Origin': '*',
}
const apiWithAuthorization = new ApiWrapper(baseUrl, true)
const apiWithoutAuthorization = new ApiWrapper(baseUrl, false, loginHeader)

export const AuthApiService = {
  // 유저 로그인
  async getLoginToken(username: string, password: string) {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    return await apiWithoutAuthorization.axiosCaller(
      'post',
      '/api/v2/auth/token',
      params
    )
  },
  async logout() {
    return await apiWithAuthorization.axiosCaller('post', '/api/v2/logout')
  },
}
