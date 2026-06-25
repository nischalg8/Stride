
import { Routes, Route } from 'react-router-dom';
import './App.css'
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {


  return (
    <>
      <Routes>
        <Route path='/' element = {<LandingPage/>} />
        <Route path ='/login' element ={<LoginPage/>}/>
        <Route  path ='/signup' element ={<SignUpPage/>}/>
        <Route path='/dashboard' element= {<Dashboard/>} />
      </Routes>
    </>
  )
}

export default App
