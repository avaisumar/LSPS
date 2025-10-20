// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { store } from '@store/store'
import { getUser, deleteUser } from '../store'

// ** Icons Imports
import { Slack, User, Settings, Database, Edit2, MoreVertical, FileText, Trash2, Archive } from 'react-feather'

// ** Reactstrap Imports
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

// ** Renders Client Columns
const renderClient = row => {
  if (row.avatar?.length) {
    return <Avatar className='me-1' img={row.avatar} width='32' height='32' />
  } else {
    return (
      <Avatar
        initials
        className='me-1'
        color={row.avatarColor || 'light-primary'}
        content={row.first_name || 'John Doe'}
      />
    )
  }
}

// ** Renders Role Columns
const renderRole = row => {
  const roleObj = {
    subscriber: {
      class: 'text-primary',
      icon: User
    },
    maintainer: {
      class: 'text-success',
      icon: Database
    },
    editor: {
      class: 'text-info',
      icon: Edit2
    },
    author: {
      class: 'text-warning',
      icon: Settings
    },
    admin: {
      class: 'text-danger',
      icon: Slack
    }
  }

  const Icon = roleObj[row.role] ? roleObj[row.role].icon : Edit2

  return (
    <span className='text-truncate text-capitalize align-middle'>
      <Icon size={18} className={`${roleObj[row.role] ? roleObj[row.role].class : ''} me-50`} />
      {row.role}
    </span>
  )
}

const statusObj = {
  pending: 'light-warning',
  active: 'light-success',
  inactive: 'light-secondary'
}

export const Usercolumns = [
  
  // {
  //   name: 'Role',
  //   sortable: true,
  //   minWidth: '172px',
  //   sortField: 'role',
  //   selector: row => row.role,
  //   cell: row => renderRole(row)
  // },
  {
      name: 'S.No',
      sortable: false,
      maxWidth: '100px',
      cell: (row, index, column, id) => index + 1 // This works for local data
    },
  {
    name: 'First Name',
    minWidth: '138px',
    sortable: true,
    sortField: 'currentPlan',
    selector: row => row.first_name,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <Link
            to={`/apps/user/view/${row.id}`}
            className='user_name text-truncate text-body'
            onClick={() => store.dispatch(getUser(row.id))}
          >
            <span className='fw-bolder'>{row.first_name}</span>
          </Link>
          <small className='text-truncate text-muted mb-0'>{row.first_name}</small>
        </div>
      </div>
    )
  },
  {
    name: 'Last Name',
    minWidth: '230px',
    sortable: true,
    sortField: 'billing',
    selector: row => row.last_name,
    cell: row => <span className='text-capitalize'>{row.last_name}</span>
  },
  {
    name: 'Designation',
    minWidth: '230px',
    sortable: true,
    sortField: 'designation',
    selector: row => row.designation.name,
    cell: row => <span className='text-capitalize'>{row.designation?.name}</span>
  },
  {
    name: 'Email',
    sortable: true,
    minWidth: '300px',
    sortField: 'fullName',
    selector: row => row.fullName,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <Link
            to={`/apps/user/view/${row.id}`}
            className='user_name text-truncate text-body'
            onClick={() => store.dispatch(getUser(row.id))}
          >
            <span className='fw-bolder'>{row.first_name}</span>
          </Link>
          <small className='text-truncate text-muted mb-0'>{row.email}</small>
        </div>
      </div>
    )
  },
  // {
  //   name: 'Status',
  //   minWidth: '138px',
  //   sortable: true,
  //   sortField: 'status',
  //   selector: row => row.status,
  //   cell: row => (
  //     <Badge className='text-capitalize' color={statusObj[row.status]} pill>
  //       {row.status}
  //     </Badge>
  //   )
  // },
  
  // {
  //   name: 'Actions',
  //   minWidth: '100px',
  //   cell: row => (
  //     <div className='column-action'>
  //       <UncontrolledDropdown>
  //         <DropdownToggle tag='div' className='btn btn-sm'>
  //           <MoreVertical size={14} className='cursor-pointer' />
  //         </DropdownToggle>
  //         <DropdownMenu>
  //           <DropdownItem
  //             tag={Link}
  //             className='w-100'
  //             to={`/apps/user/view/${row.id}`}
  //             onClick={() => store.dispatch(getUser(row.id))}
  //           >
  //             <FileText size={14} className='me-50' />
  //             <span className='align-middle'>Details</span>
  //           </DropdownItem>
  //           <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
  //             <Archive size={14} className='me-50' />
  //             <span className='align-middle'>Edit</span>
  //           </DropdownItem>
  //           <DropdownItem
  //             tag='a'
  //             href='/'
  //             className='w-100'
  //             onClick={e => {
  //               e.preventDefault()
  //               store.dispatch(deleteUser(row.id))
  //             }}
  //           >
  //             <Trash2 size={14} className='me-50' />
  //             <span className='align-middle'>Delete</span>
  //           </DropdownItem>
  //         </DropdownMenu>
  //       </UncontrolledDropdown>
  //     </div>
  //   )
  // }
]
const designationColumns = [
  {
      name: 'S.No',
      sortable: false,
      maxWidth: '500px',
      cell: (row, index, column, id) => index + 1 // This works for local data
    },,
  {
    name: 'Designation Name',
    sortable: true,
    minWidth: '200px',
    selector: row => row.name,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <Link
            to={`/apps/designation/view/${row.id}`}
            className='user_name text-truncate text-body'
            onClick={() => store.dispatch(getUser(row.id))}
          >
            <span className='fw-bolder'>{row.name}</span>
          </Link>
          <small className='text-truncate text-muted mb-0'>{row.name}</small>
        </div>
      </div>
    )
  }
]
export const getColumns = tabtype => {
  return tabtype === 'designation' ? designationColumns : Usercolumns
}