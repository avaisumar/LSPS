// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getUser } from '../store'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap Imports
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import UserTabs from './Tabs'
import PlanCard from './PlanCard'
import UserInfoCard from './UserInfoCard'

// ** Styles
import '@styles/react/apps/app-users.scss'

const UserView = () => {
  // ** Store Vars
  const store = useSelector(state => state.users.allData )
  const dispatch = useDispatch()

  // ** Hooks
  const { id } = useParams()
  const { tabtype } = useParams();
  const [selectedUser, setSelectedUser] = useState(null)
  

  // ** Get suer on mount
  // useEffect(() => {
  //   dispatch(getUser(parseInt(id)))
  // }, [dispatch])

  console.log("store",store,id)
   useEffect(() => {
     if (store) {
      const user = store?.find(u => u.id === parseInt(id))
      setSelectedUser(user)
    }
  }, [store.allData, id])

  const handleUserUpdated = (updatedUser) => {
  
  setSelectedUser({ ...selectedUser, ...updatedUser });
};

  const [active, setActive] = useState('2')

  const toggleTab = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  console.log("selectedUser",selectedUser)

  return selectedUser !== null && selectedUser !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='4' lg='5' xs={{ order: 1 }} md={{ order: 0, size: 5 }}>
          <UserInfoCard selectedUser={selectedUser} onUserUpdated={handleUserUpdated} />
          {/* <PlanCard /> */}
        </Col>
        {tabtype !== "designation" && (
          
          <Col xl='8' lg='7' xs={{ order: 0 }} md={{ order: 1, size: 7 }}>
          <UserTabs active={active} toggleTab={toggleTab} />
        </Col>
        )}
      </Row>
    </div>
  ) : (
    <Alert color='danger'>
      <h4 className='alert-heading'>User not found</h4>
      <div className='alert-body'>
        User with id: {id} doesn't exist. Check list of all Users: <Link to='/apps/user/list'>Users List</Link>
      </div>
    </Alert>
  )
}
export default UserView
