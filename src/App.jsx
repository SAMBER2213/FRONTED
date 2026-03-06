import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Hoy from './pages/Hoy'
import Actividades from './pages/Actividades'
import Crear from './pages/Crear'
import Actividad from './pages/Actividad'
import Progreso from './pages/Progreso'
import Login from './pages/Login'
import Registro from './pages/Registro'

function estaLogueado() {
  try {
    const u = localStorage.getItem('usuario')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

function Privada({ children }) {
  return estaLogueado() ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/" element={<Navigate to="/hoy" />} />
        <Route path="/hoy" element={<Privada><Hoy /></Privada>} />
        <Route path="/actividades" element={<Privada><Actividades /></Privada>} />
        <Route path="/crear" element={<Privada><Crear /></Privada>} />
        <Route path="/actividad/:id" element={<Privada><Actividad /></Privada>} />
        <Route path="/progreso" element={<Privada><Progreso /></Privada>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App