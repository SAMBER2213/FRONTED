import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Hoy from './pages/Hoy'
import Crear from './pages/Crear'
import Actividad from './pages/Actividad'
import Progreso from './pages/Progreso'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hoy />} />
        <Route path="/hoy" element={<Hoy />} />
        <Route path="/crear" element={<Crear />} />
        <Route path="/actividad/:id" element={<Actividad />} />
        <Route path="/progreso" element={<Progreso />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App