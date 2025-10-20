// ** Third Party Imports
import axios from 'axios'

// ** Default Config
const jwtDefaultConfig = {
  baseURL: 'https://lspschoolerp.pythonanywhere.com/erp-api/',
  loginEndpoint: 'user/login/',
  refreshEndpoint: 'user/refresh/',
  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refreshToken'
}

export default function useJwt(overrideConfig) {
  const jwtConfig = { ...jwtDefaultConfig, ...overrideConfig }

  const jwt = {
    /**
     * LOGIN FUNCTION
     * Calls your custom API endpoint and returns the response
     */
    login: (data) => {
      return axios.post(`${jwtConfig.baseURL}${jwtConfig.loginEndpoint}`, data)
    },

    /**
     * REFRESH TOKEN FUNCTION (optional)
     */
    refreshToken: () => {
      const refresh = localStorage.getItem(jwtConfig.storageRefreshTokenKeyName)
      return axios.post(`${jwtConfig.baseURL}${jwtConfig.refreshEndpoint}`, { refresh })
    },

    /**
     * SET TOKEN HEADER GLOBALLY
     */
    setToken: (token) => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    jwtConfig
  }

  return { jwt }
}
