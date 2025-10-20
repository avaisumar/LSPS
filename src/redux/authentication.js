// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** UseJWT import to get config
import useJwt from '@src/auth/jwt/useJwt'

const config = useJwt.jwtConfig

const initialUser = () => {
  const item = window.localStorage.getItem('userData')
  //** Parse stored json or if none return initialValue
  return item ? JSON.parse(item) : {}
}

const initialToken = () => {
  return window.localStorage.getItem('accessToken') || null
}

export const authSlice = createSlice({
  name: 'authentication',
  initialState: {
    userData: initialUser(),
     accessToken: initialToken()
  },
  reducers: {
    handleLogin: (state, action) => {
      state.userData = action.payload
      console.log("state.userData",action.payload)
      state.token = JSON.stringify(action.payload.accessToken)
      state[config.storageTokenKeyName] = action.payload[config.storageTokenKeyName]
      state[config.storageRefreshTokenKeyName] = action.payload[config.storageRefreshTokenKeyName]
      localStorage.setItem('userData', JSON.stringify(action.payload))
      localStorage.setItem(config.storageTokenKeyName, JSON.stringify(action.payload.accessToken))
      localStorage.setItem(config.storageRefreshTokenKeyName, JSON.stringify(action.payload.refreshToken))
    },
    handleLogout: state => {
      state.userData = {}
      state[config.storageTokenKeyName] = null
      state[config.storageRefreshTokenKeyName] = null
      // ** Remove user, accessToken & refreshToken from localStorage
      localStorage.removeItem('userData')
      localStorage.removeItem(config.storageTokenKeyName)
      localStorage.removeItem(config.storageRefreshTokenKeyName)
      localStorage.clear()
    }
  }
})

export const { handleLogin, handleLogout } = authSlice.actions

export default authSlice.reducer
