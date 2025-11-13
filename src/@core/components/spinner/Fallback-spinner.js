// ** Logo
import logo from '@src/assets/images/logo/logo.png'
import Logo from '@src/assets/images/pages/Logo.jpeg'; // ✅ correct import path


const SpinnerComponent = () => {
  return (
    <div className='fallback-spinner app-loader'>
      <img className='fallback-logo ' src={Logo} alt='logo' style={{ width: '50px' }}/>
      <div className='loading'>
        <div className='effect-1 effects'></div>
        <div className='effect-2 effects'></div>
        <div className='effect-3 effects'></div>
      </div>
    </div>
  )
}

export default SpinnerComponent
