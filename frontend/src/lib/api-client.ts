import axios from 'axios'
import { getCookie, saveTokens } from './cookies'
import {
  AdminApi,
  AuthenticationApi,
  DocumentApi,
  FiltersApi,
  SearchApi,
  UserApi,
} from './axios-client'

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '/'

export const AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
})

AxiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getCookie('accessToken')
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

const unauthenticatedAuthenticationApi = new AuthenticationApi(
  undefined,
  undefined,
  AxiosInstance,
)

AxiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401) {
      const refreshToken = getCookie('refreshToken')

      if (!refreshToken) {
        return Promise.reject(error)
      }

      try {
        const response =
          await unauthenticatedAuthenticationApi.authenticationControllerRefreshTokens(
            { refreshToken },
          )

        saveTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        })

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`

        return await axios.request(error.originalRequest)
      } catch (refreshError) {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

const authApi = new AuthenticationApi(undefined, undefined, AxiosInstance)
const userApi = new UserApi(undefined, undefined, AxiosInstance)
const searchApi: SearchApi = new SearchApi(undefined, undefined, AxiosInstance)
const adminApi: AdminApi = new AdminApi(undefined, undefined, AxiosInstance)

const documentApi: DocumentApi = new DocumentApi(
  undefined,
  undefined,
  AxiosInstance,
)
const filterApi: FiltersApi = new FiltersApi(
  undefined,
  undefined,
  AxiosInstance,
)
export const ApiClient = {
  auth: authApi,
  user: userApi,
  search: searchApi,
  filters: filterApi,
  document: documentApi,
  admin: adminApi,
}

export default AxiosInstance
