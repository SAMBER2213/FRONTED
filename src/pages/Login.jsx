import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DEMO_USER = { email: 'demo@univalle.edu.co', password: 'demo123' }

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  function iniciarSesion() {
    setError(null)
    if (!form.email.trim() || !form.password.trim()) {
      setError('Completa todos los campos')
      return
    }
    setCargando(true)
    setTimeout(() => {
      if (form.email === DEMO_USER.email && form.password === DEMO_USER.password) {
        localStorage.setItem('demo_logged', 'true')
        navigate('/hoy')
      } else {
        setError('Credenciales inválidas. Usa el usuario demo.')
        setCargando(false)
      }
    }, 800)
  }

  function entrarComoDemo() {
    setForm({ email: DEMO_USER.email, password: DEMO_USER.password })
    setCargando(true)
    setTimeout(() => {
      localStorage.setItem('demo_logged', 'true')
      navigate('/hoy')
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f11',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      color: '#f0eff5',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo centrado */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>📚</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#7c6dfa', marginBottom: 6 }}>Planificador</h1>
          <p style={{ fontSize: '0.88rem', color: '#6b6a7a' }}>Organiza tus actividades evaluativas</p>
        </div>

        {/* Card centrada */}
        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 16, padding: '36px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Iniciar sesión</h2>

          {error && (
            <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#f04a4a', fontSize: '0.85rem', textAlign: 'center' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 6 }}>Correo</label>
            <input
              type="email"
              placeholder="demo@univalle.edu.co"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 26 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
              style={inputStyle}
            />
          </div>

          <button
            onClick={iniciarSesion}
            disabled={cargando}
            style={{ width: '100%', padding: '13px', background: cargando ? '#4a4060' : '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: cargando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 14 }}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: '#2a2a32' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b6a7a' }}>o</span>
            <div style={{ flex: 1, height: 1, background: '#2a2a32' }} />
          </div>

          <button
            onClick={entrarComoDemo}
            disabled={cargando}
            style={{ width: '100%', padding: '13px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Entrar como usuario demo
          </button>
        </div>

        {/* Credenciales demo centradas */}
        <div style={{ marginTop: 16, background: 'rgba(124,109,250,0.08)', border: '1px solid rgba(124,109,250,0.2)', borderRadius: 10, padding: '14px 16px', fontSize: '0.78rem', color: '#6b6a7a', textAlign: 'center' }}>
          <strong style={{ color: '#7c6dfa' }}>Usuario demo</strong><br />
          📧 demo@univalle.edu.co &nbsp;·&nbsp; 🔑 demo123
        </div>
      </div>
    </div>
  )
<div style={{ width: 380, margin: '0 auto' }}>

const inputStyle = {
  width: '100%', background: '#0f0f11', border: '1px solid #2a2a32',
  borderRadius: 10, padding: '11px 14px', color: '#f0eff5',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box'
}<div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>