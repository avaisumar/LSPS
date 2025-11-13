import React, { Suspense, useContext, useEffect, useState } from 'react'

// ** Router Import
import Router from './router/Router'


// ** ACL / Ability Import
import { AbilityContext } from '@src/utility/context/Can'
import useJwt from './@core/auth/jwt/useJwt'
import { Spinner } from 'reactstrap'

const App = () => {
  const ability = useContext(AbilityContext)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // 1️⃣ Restore user from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'))
    const token = localStorage.getItem('accessToken')

    // 2️⃣ Set token for axios requests
    // if (token) {
    //   useJwt.setToken(token)
    // }

    // 3️⃣ Restore ability in AbilityContext
    if (userData && ability && typeof ability.update === 'function') {
      // Use ability from stored userData or provide default full access
      const userAbility = userData.ability || [{ action: 'manage', subject: 'all' }]
      ability.update(userAbility)
    }
     setIsReady(true)
  }, [ability])

  if (!isReady) {
    return <Spinner className='content-loader' /> // or null
  }
  return (
    <Suspense fallback={null}>
      <Router />
    </Suspense>
  )
}

export default App
