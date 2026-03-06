import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', clave: '', confirmarClave: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [verClave, setVerClave] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [exito, setExito] = useState(false)

  function validar() {
    const e = {}
    if (!form.nombre.trim()) {
      e.nombre = 'El nombre es obligatorio'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.nombre)) {
      e.nombre = 'El nombre solo puede contener letras'
    }

    if (!form.apellido.trim()) {
      e.apellido = 'El apellido es obligatorio'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.apellido)) {
      e.apellido = 'El apellido solo puede contener letras'
    }

    if (!form.correo.trim()) {
      e.correo = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = 'El correo no es válido'
    }

    if (!form.clave) {
      e.clave = 'La clave es obligatoria'
    } else if (form.clave.length < 6) {
      e.clave = 'La clave debe tener al menos 6 caracteres'
    }

    if (!form.confirmarClave) {
      e.confirmarClave = 'Debes confirmar la clave'
    } else if (form.clave !== form.confirmarClave) {
      e.confirmarClave = 'Las claves no coinciden'
    }

    return e
  }

  async function registrar() {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }

    setCargando(true)
    setErrores({})
    setErrorGeneral(null)
    try {
      const res = await fetch(`${BASE_URL}/api/auth/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setErrores(data.campos || {})
        setErrorGeneral(data.error || 'Error al registrarse')
        setCargando(false)
        return
      }
      setExito(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setErrorGeneral('Error de conexión. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#f0eff5', padding: '24px 0' }}>
      <div style={{ width: 420, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📚</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c6dfa', marginBottom: 4 }}>Planificador</h1>
          <p style={{ fontSize: '0.85rem', color: '#6b6a7a' }}>Crea tu cuenta para empezar</p>
        </div>

        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Crear cuenta</h2>

          {exito && (
            <div style={{ background: 'rgba(59,191,163,0.15)', border: '1px solid #3bbfa3', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#3bbfa3', fontSize: '0.88rem', textAlign: 'center' }}>
              ✅ Cuenta creada exitosamente. Redirigiendo al login...
            </div>
          )}

          {errorGeneral && (
            <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#f04a4a', fontSize: '0.85rem' }}>
              ⚠️ {errorGeneral}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo label="Nombre *" error={errores.nombre}>
              <input placeholder="Juan" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                style={inputStyle(errores.nombre)} />
            </Campo>
            <Campo label="Apellido *" error={errores.apellido}>
              <input placeholder="Pérez" value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })}
                style={inputStyle(errores.apellido)} />
            </Campo>
          </div>

          <Campo label="Correo electrónico *" error={errores.correo}>
            <input type="email" placeholder="tu@correo.com" value={form.correo}
              onChange={e => setForm({ ...form, correo: e.target.value })}
              style={inputStyle(errores.correo)} />
          </Campo>

          <Campo label="Clave * (mínimo 6 caracteres)" error={errores.clave}>
            <div style={{ position: 'relative' }}>
              <input type={verClave ? 'text' : 'password'} placeholder="••••••••" value={form.clave}
                onChange={e => setForm({ ...form, clave: e.target.value })}
                style={{ ...inputStyle(errores.clave), paddingRight: 42 }} />
              <button onClick={() => setVerClave(!verClave)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6a7a', fontSize: '1rem', padding: 0 }}>
                {verClave ? '🙈' : '👁️'}
              </button>
            </div>
          </Campo>

          <Campo label="Confirmar clave *" error={errores.confirmarClave}>
            <div style={{ position: 'relative' }}>
              <input type={verConfirmar ? 'text' : 'password'} placeholder="••••••••" value={form.confirmarClave}
                onChange={e => setForm({ ...form, confirmarClave: e.target.value })}
                style={{ ...inputStyle(errores.confirmarClave), paddingRight: 42 }} />
              <button onClick={() => setVerConfirmar(!verConfirmar)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6a7a', fontSize: '1rem', padding: 0 }}>
                {verConfirmar ? '🙈' : '👁️'}
              </button>
            </div>
          </Campo>

          <button onClick={registrar} disabled={cargando || exito}
            style={{ width: '100%', padding: '12px', background: cargando ? '#4a4060' : '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: cargando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 16, marginTop: 4 }}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b6a7a' }}>
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')}
              style={{ color: '#7c6dfa', cursor: 'pointer', fontWeight: 600 }}>
              Inicia sesión
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