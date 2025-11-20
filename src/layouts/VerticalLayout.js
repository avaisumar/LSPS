// ** React Imports
import { Outlet } from 'react-router-dom'

// ** Core Layout Import
// !Do not remove the Layout import
import Layout from '@layouts/VerticalLayout'

// ** Menu Items Array
import navigation from '@src/navigation/vertical'

const VerticalLayout = props => {
  // Assuming you store user info in localStorage
  const userData = JSON.parse(localStorage.getItem('userData')) || {}

  // Filter the navigation menu based on conditions
  const filteredNavigation = navigation.filter(item => {
    // Show "Report" only if userData.is_report === true
    if (item.id === 'report' && !userData.is_report) {
      return false
    }

    // Show "Task" only if userData.is_task_create or is_task_recive is true
    if (item.id === 'task' && !(userData.is_task_create || userData.is_task_recive)) {
      return false
    }
    console.log("userData.is_superuser",userData.is_superuser)

    if ((item.id === 'users' || item.id === 'designation') && !userData.is_superuser) {
      return false
    }

    // Otherwise, keep everything else
    return true
  })

  console.log('Filtered Navigation:', filteredNavigation)

  return (
    <Layout menuData={filteredNavigation} {...props}>
      <Outlet />
    </Layout>
  )
}

export default VerticalLayout
