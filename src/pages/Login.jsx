// Login.jsx — Pantalla de inicio de sesión y registro
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Login() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', clave: '', confirmarClave: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [showClave, setShowClave] = useState(false)

  function update(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (errores[campo]) setErrores(e => ({ ...e, [campo]: null }))
  }

  async function handleLogin() {
    const e = {}
    if (!form.correo.trim()) e.correo = 'El correo es obligatorio'
    if (!form.clave) e.clave = 'La clave es obligatoria'
    if (Object.keys(e).length > 0) { setErrores(e); return }

    setCargando(true)
    setErrorGeneral(null)
    try {
      const res = await fetch(`${BASE_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: form.correo.trim().toLowerCase(), clave: form.clave })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorGeneral(data.error || 'Correo o clave incorrectos')
        setCargando(false)
        return
      }
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      localStorage.setItem('demo_logged', 'true')
      navigate('/hoy')
    } catch {
      setErrorGeneral('Error de conexión. Verifica tu internet.')
    }
    setCargando(false)
  }

  async function handleRegistro() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!form.correo.trim()) e.correo = 'El correo es obligatorio'
    if (!form.clave) e.clave = 'La clave es obligatoria'
    else if (form.clave.length < 6) e.clave = 'Mínimo 6 caracteres'
    if (form.clave !== form.confirmarClave) e.confirmarClave = 'Las claves no coinciden'
    if (Object.keys(e).length > 0) { setErrores(e); return }

    setCargando(true)
    setErrorGeneral(null)
    try {
      const res = await fetch(`${BASE_URL}/api/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, apellido: form.apellido, correo: form.correo.trim().toLowerCase(), clave: form.clave, confirmarClave: form.confirmarClave })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrores(data.campos || {})
        setErrorGeneral(data.error || 'Error al registrarse')
        setCargando(false)
        return
      }
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      localStorage.setItem('demo_logged', 'true')
      navigate('/hoy')
    } catch {
      setErrorGeneral('Error de conexión. Verifica tu internet.')
    }
    setCargando(false)
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🗂️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0eff5', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Planificador
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#8b8a9a' }}>Organiza tus actividades evaluativas</p>
        </div>

        {/* Tabs */}
        <div style={tabsContainer}>
          <button onClick={() => { setModo('login'); setErrores({}); setErrorGeneral(null) }}
            style={tabBtn(modo === 'login')}>
            Iniciar sesión
          </button>
          <button onClick={() => { setModo('registro'); setErrores({}); setErrorGeneral(null) }}
            style={tabBtn(modo === 'registro')}>
            Registrarse
          </button>
        </div>

        {/* Error general */}
        {errorGeneral && (
          <div style={alertaError}>⚠️ {errorGeneral}</div>
        )}

        {/* Formulario Login */}
        {modo === 'login' && (
          <div>
            <Campo label="📧 Correo electrónico" error={errores.correo}>
              <input
                type="email"
                style={inputStyle(errores.correo)}
                placeholder="tu@correo.com"
                value={form.correo}
                onChange={e => update('correo', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </Campo>
            <Campo label="🔑 Contraseña" error={errores.clave}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showClave ? 'text' : 'password'}
                  style={{ ...inputStyle(errores.clave), paddingRight: 44 }}
                  placeholder="••••••••"
                  value={form.clave}
                  onChange={e => update('clave', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowClave(!showClave)}
                  style={ojito}
                >
                  {showClave ? '🙈' : '👁️'}
                </button>
              </div>
            </Campo>
            <button onClick={handleLogin} disabled={cargando} style={btnSubmit(cargando)}>
              {cargando ? 'Verificando...' : '→ Entrar'}
            </button>
          </div>
        )}

        {/* Formulario Registro */}
        {modo === 'registro' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Campo label="👤 Nombre" error={errores.nombre}>
                <input style={inputStyle(errores.nombre)} placeholder="Juan"
                  value={form.nombre} onChange={e => update('nombre', e.target.value)} />
              </Campo>
              <Campo label="👤 Apellido" error={errores.apellido}>
                <input style={inputStyle(errores.apellido)} placeholder="Pérez"
                  value={form.apellido} onChange={e => update('apellido', e.target.value)} />
              </Campo>
            </div>
            <Campo label="📧 Correo electrónico" error={errores.correo}>
              <input type="email" style={inputStyle(errores.correo)} placeholder="tu@correo.com"
                value={form.correo} onChange={e => update('correo', e.target.value)} />
            </Campo>
            <Campo label="🔑 Contraseña" error={errores.clave}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showClave ? 'text' : 'password'}
                  style={{ ...inputStyle(errores.clave), paddingRight: 44 }}
                  placeholder="Mínimo 6 caracteres"
                  value={form.clave}
                  onChange={e => update('clave', e.target.value)}
                />
                <button type="button" onClick={() => setShowClave(!showClave)} style={ojito}>
                  {showClave ? '🙈' : '👁️'}
                </button>
              </div>
            </Campo>
            <Campo label="🔑 Confirmar contraseña" error={errores.confirmarClave}>
              <input
                type="password"
                style={inputStyle(errores.confirmarClave)}
                placeholder="Repite tu contraseña"
                value={form.confirmarClave}
                onChange={e => update('confirmarClave', e.target.value)}
              />
            </Campo>
            <button onClick={handleRegistro} disabled={cargando} style={btnSubmit(cargando)}>
              {cargando ? 'Creando cuenta...' : '✨ Crear cuenta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: '0.82rem', color: '#8b8a9a', fontWeight: 700, marginBottom: 6 }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#f07070', marginTop: 4, fontWeight: 600 }}>{error}</p>}
    </div>
  )
}

// ─── Estilos ─────────────────────────────────────────────────
const pageStyle = {
  minHeight: '100vh',
  background: '#0f0f15',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'DM Sans, sans-serif',
  padding: '24px',
}

const cardStyle = {
  background: '#1a1a24',
  border: '1px solid #2a2a38',
  borderRadius: 20,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 440,
}

const tabsContainer = {
  display: 'flex',
  background: '#0f0f15',
  borderRadius: 12,
  padding: 4,
  marginBottom: 24,
  gap: 4,
}

const tabBtn = (activo) => ({
  flex: 1,
  padding: '9px 16px',
  background: activo ? '#a78bfa' : 'transparent',
  border: 'none',
  borderRadius: 9,
  color: activo ? 'white' : '#8b8a9a',
  fontSize: '0.88rem',
  fontWeight: activo ? 700 : 600,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'all 0.15s',
})

const inputStyle = (error) => ({
  width: '100%',
  background: '#0f0f15',
  border: `1px solid ${error ? '#f04a4a' : '#2a2a38'}`,
  borderRadius: 10,
  padding: '11px 14px',
  color: '#f0eff5',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.92rem',
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
})

const ojito = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: 0,
  lineHeight: 1,
}

const alertaError = {
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.35)',
  borderRadius: 10,
  padding: '11px 14px',
  color: '#f07070',
  fontSize: '0.88rem',
  fontWeight: 600,
  marginBottom: 18,
}

const btnSubmit = (disabled) => ({
  width: '100%',
  padding: '13px',
  background: disabled ? '#4a4060' : '#a78bfa',
  border: 'none',
  borderRadius: 12,
  color: 'white',
  fontSize: '0.95rem',
  fontWeight: 800,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  marginTop: 4,
  letterSpacing: '0.01em',
})