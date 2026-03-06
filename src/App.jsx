import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Hoy from './pages/Hoy'
import Crear from './pages/Crear'
import Actividad from './pages/Actividad'
import Progreso from './pages/Progreso'
import Login from './pages/Login'

// Verifica si el usuario demo está logueado
function estaLogueado() {
  return localStorage.getItem('demo_logged') === 'true'
}

// Ruta protegida — si no está logueado manda al login
function Privada({ children }) {
  return estaLogueado() ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/hoy" />} />
        <Route path="/hoy" element={<Privada><Hoy /></Privada>} />
        <Route path="/crear" element={<Privada><Crear /></Privada>} />
        <Route path="/actividad/:id" element={<Privada><Actividad /></Privada>} />
        <Route path="/progreso" element={<Privada><Progreso /></Privada>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App