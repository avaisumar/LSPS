// ** React Imports
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Store & Actions
import { useDispatch, useSelector } from 'react-redux'
import { handleLogout } from '@store/authentication'

// ** Third Party Components
import { Power } from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'
import axios from 'axios'

const UserDropdown = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [userData, setUserData] = useState(null)
  const token = useSelector(state => state.auth.accessToken)

  const handleUserLogout = async () => {
    try {
      await axios.post(
        'https://lspschoolerp.pythonanywhere.com/erp-api/user/logout/',
        {},
        { headers: { Authorization: `Token ${token}` } }
      )
    } catch (err) {
      console.error('Logout API failed:', err)
    } finally {
      dispatch(handleLogout())
      navigate('/login')
    }
  }

  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])

  console.log("1", userData)

  // ** Build correct image URL
  const BASE_URL = "https://lspschoolerp.pythonanywhere.com"

  const userAvatar =
    userData?.image
      ? `${BASE_URL}${userData.image}`   // prepend base URL
      : defaultAvatar

  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      <DropdownToggle
        href='/'
        tag='a'
        className='nav-link dropdown-user-link'
        onClick={e => e.preventDefault()}
      >
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name fw-bold'>
            {userData?.first_name || 'John Doe'}
          </span>
          <span className='user-status'>
            {userData?.designation?.name || 'Admin'}
          </span>
        </div>
        <Avatar img={userAvatar} imgHeight='40' imgWidth='40' status='online' />
      </DropdownToggle>

      <DropdownMenu end>
        <DropdownItem tag={Link} to='/login' onClick={handleUserLogout}>
          <Power size={14} className='me-75' />
          <span className='align-middle'>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown
