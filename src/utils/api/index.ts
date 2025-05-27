import ApiWrapper from './axiosInstance'
const baseUrl = import.meta.env.VITE_APP_BACKURL

const loginHeader = {
  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  'Access-Control-Allow-Origin': '*',
}
const apiWithAuthorization = new ApiWrapper(baseUrl, true)
const apiWithoutAuthorization = new ApiWrapper(baseUrl, false, loginHeader)

export const jwtDecode = async (token: string) => {
  const base64Url = token.split('.')
  if (base64Url.length > 1) {
    const base64 = base64Url[1].replace(/-/g, '+').replace(/_/g, '/')
    const binaryData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const jsonPayload = new TextDecoder().decode(binaryData)
    return JSON.parse(jsonPayload)
  } else {
    return null
  }
}

export const AuthApiService = {
  // 유저 로그인
  async getLoginToken(username: string, password: string) {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    params.append('force_logout', 'Y')
    return await apiWithoutAuthorization.axiosCaller('post', '/api/v2/auth/token', params)
  },
  async logout() {
    return await apiWithAuthorization.axiosCaller('post', '/api/v2/logout')
  },
}

export const CustomerService = {
  async getCustomers(cust_id: number) {
    return apiWithAuthorization.axiosCaller('get', `/api/v2/customers/${cust_id}`)
  },
}

export const UserService = {
  async getUsers(cust_id: number) {
    return apiWithAuthorization.axiosCaller('get', `/api/v2/customers/${cust_id}/users`)
  },
}

export const DevicesService = {
  async getDevices(cust_id: number) {
    return apiWithAuthorization.axiosCaller('get', `/api/v2/customers/${cust_id}/devices`, {
      skip: 0,
      limit: 1000,
    })
  },
  async getDeviceInfo(cust_id: number, dvc_id: string) {
    return apiWithAuthorization.axiosCaller('get', `/api/v2/customers/${cust_id}/devices/${dvc_id}`)
  },
  async getDevicesCoverage(cust_id: number, params: any) {
    // const params = {start_date, end_date, sw_lng, sw_lat, ne_lng, ne_lat, rgn_cd}
    return apiWithAuthorization.axiosCaller(
      'get',
      `/api/v2/customers/${cust_id}/devices/coverage`,
      params,
    )
  },
  async getDevicesCoverageById(cust_id: number, dvc_id: string, params: any) {
    // const params = {start_date, end_date, sw_lng, sw_lat, ne_lng, ne_lat, rgn_cd}
    return apiWithAuthorization.axiosCaller(
      'get',
      `/api/v2/customers/${cust_id}/devices/${dvc_id}/coverage`,
      params,
    )
  },
}

export const RoadHazardsService = {
  async getRoadHazards(cust_id: number, params: any) {
    // const params = {rgn_cd, start_date, end_date, hazard_type_id, hazard_types, hazard_grd, dvc_id, road_nm, link_id, hazard_dpcn_cnt, hazard_cnt, whol_addr, limit, skip}
    return apiWithAuthorization.axiosCaller(
      'get',
      `/api/v2/customers/${cust_id}/roadhazards`,
      params,
    )
  },
}
