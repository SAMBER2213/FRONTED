import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ correo: '', clave: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [verClave, setVerClave] = useState(false)

  async function iniciarSesion() {
    const e = {}
    if (!form.correo.trim()) e.correo = 'El correo es obligatorio'
    if (!form.clave.trim()) e.clave = 'La clave es obligatoria'
    if (Object.keys(e).length > 0) { setErrores(e); return }

    setCargando(true)
    setErrores({})
    setErrorGeneral(null)
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: form.correo.trim().toLowerCase(), clave: form.clave })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrores(data.campos || {})
        setErrorGeneral(data.error || 'Error al iniciar sesión')
        setCargando(false)
        return
      }
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      navigate('/hoy')
    } catch {
      setErrorGeneral('Error de conexión. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#f0eff5' }}>
      <div style={{ width: 380, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📚</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c6dfa', marginBottom: 4 }}>Planificador</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b6a7a' }}>Organiza tus actividades evaluativas</p>
        </div>

        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Iniciar sesión</h2>

          {errorGeneral && (
            <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#f04a4a', fontSize: '0.85rem' }}>
              ⚠️ {errorGeneral}
            </div>
          )}

          <Campo label="Correo electrónico" error={errores.correo}>
            <input type="email" placeholder="tu@correo.com" value={form.correo}
              onChange={e => setForm({ ...form, correo: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
              style={inputStyle(errores.correo)} />
          </Campo>

          <Campo label="Clave" error={errores.clave}>
            <div style={{ position: 'relative' }}>
              <input type={verClave ? 'text' : 'password'} placeholder="••••••••" value={form.clave}
                onChange={e => setForm({ ...form, clave: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
                style={{ ...inputStyle(errores.clave), paddingRight: 42 }} />
              <button onClick={() => setVerClave(!verClave)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6a7a', fontSize: '1rem', padding: 0 }}>
                {verClave ? '🙈' : '👁️'}
              </button>
            </div>
          </Campo>

          <button onClick={iniciarSesion} disabled={cargando}
            style={{ width: '100%', padding: '12px', background: cargando ? '#4a4060' : '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: cargando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 16, marginTop: 4 }}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b6a7a' }}>
            ¿No tienes cuenta?{' '}
            <span onClick={() => navigate('/registro')}
              style={{ color: '#7c6dfa', cursor: 'pointer', fontWeight: 600 }}>
              Regístrate
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#f04a4a', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  )
}

const inputStyle = (error) => ({
  width: '100%', background: '#0f0f11', border: `1px solid ${error ? '#f04a4a' : '#2a2a32'}`,
  borderRadius: 10, padding: '10px 14px', color: '#f0eff5',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box'
})