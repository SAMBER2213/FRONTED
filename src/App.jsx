// App.jsx — Configuración de rutas de la aplicación
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Hoy from './pages/Hoy'
import Actividades from './pages/Actividades'
import Crear from './pages/Crear'
import Actividad from './pages/Actividad'
import Progreso from './pages/Progreso'
import Login from './pages/Login'

// Verifica si el usuario demo está logueado revisando localStorage
function estaLogueado() {
  return localStorage.getItem('demo_logged') === 'true'
}

// Componente que protege rutas — si no está logueado redirige al login
function Privada({ children }) {
  return estaLogueado() ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública — login */}
        <Route path="/login" element={<Login />} />

        {/* Redirige la raíz a /hoy */}
        <Route path="/" element={<Navigate to="/hoy" />} />

        {/* Rutas protegidas — requieren login */}
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