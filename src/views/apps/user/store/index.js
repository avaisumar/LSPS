// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

export const getAllData = createAsyncThunk(
  'appUsers/getAllData',
  async (params = {}, { getState }) => {
    const token = getState().auth?.accessToken
    console.log('🔑 Token being sent:', getState().auth)
    const endpoint = params.endpoint || 'user/' // default to user if not provided

    const response = await axios.get(`https://lspschoolerp.pythonanywhere.com/erp-api/${endpoint}`, {
      headers: {
        Authorization: token ? `Token ${token}` : undefined
      }
    })

    return response.data // returns array (users or designations)
  }
)


export const getData = createAsyncThunk('appUsers/getData', async params => {
  const response = await axios.get('/api/users/list/data', params)
  return {
    params,
    data: response.data.users,
    totalPages: response.data.total
  }
})

const createUser = async (userData) => {
  return axios.post('http://127.0.0.1:8000/user/createuser/', userData, config);
};

// Create designation API
const createDesignation = async (designationData) => {
  return axios.post('http://127.0.0.1:8000/designation/', designationData, config);
};

export const getUser = createAsyncThunk('appUsers/getUser', async id => {
  const response = await axios.get('/api/users/user', { id })
  return response.data.user
})

export const addUser = createAsyncThunk('appUsers/addUser', async (user, { dispatch, getState }) => {
  await axios.post('/apps/users/add-user', user)
  await dispatch(getData(getState().users.params))
  await dispatch(getAllData())
  return user
})

export const deleteUser = createAsyncThunk('appUsers/deleteUser', async (id, { dispatch, getState }) => {
  await axios.delete('/apps/users/delete', { id })
  await dispatch(getData(getState().users.params))
  await dispatch(getAllData())
  return id
})

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: JSON.parse(localStorage.getItem('allData')) || []  ,
    selectedUser: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllData.fulfilled, (state, action) => {
        state.allData = action.payload
        localStorage.setItem('allData', JSON.stringify(action.payload))
      })
      .addCase(getData.fulfilled, (state, action) => {
        state.data = action.payload.data
        state.params = action.payload.params
         state.data = action.payload       // ✅ important
        state.allData = action.payload
        state.total = action.payload.totalPages
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload
      })
  }
})

export default appUsersSlice.reducer
