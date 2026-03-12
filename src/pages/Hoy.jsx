import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'
const LIMITE_HORAS = 6

export default function Hoy() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState({ vencidas: [], hoy: [], proximas: [], carga_hoy_horas: 0, regla: '' })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      const res = await fetch(`${BASE_URL}/api/hoy/`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': usuario.id || ''
        }
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setDatos(json)
    } catch {
      setError('No se pudo cargar. Verifica tu conexión.')
    }
    setCargando(false)
  }

  const { vencidas, hoy: paraHoy, proximas, carga_hoy_horas: cargaHoy, regla } = datos
  const totalSubtareas = vencidas.length + paraHoy.length + proximas.length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} actual="hoy" />
      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>¿Qué tienes para hoy?</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>{fecha}</p>

        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>Carga del día</span>
          <div style={{ flex: 1, height: 6, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((cargaHoy / LIMITE_HORAS) * 100, 100)}%`, height: '100%', background: cargaHoy >= LIMITE_HORAS ? '#f04a4a' : '#7c6dfa', borderRadius: 10 }}></div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>{cargaHoy}h / {LIMITE_HORAS}h</span>
        </div>

        {regla && (
          <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 10, padding: '10px 16px', marginBottom: 24, fontSize: '0.78rem', color: '#6b6a7a' }}>
            📌 <strong style={{ color: '#f0eff5' }}>Regla de prioridad:</strong> {regla}
          </div>
        )}

        {cargando && <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>Cargando tareas...</div>}

        {error && (
          <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#f04a4a', marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargar} style={{ padding: '8px 20px', background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && totalSubtareas === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>🎉 No tienes tareas pendientes</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Crea una actividad para empezar</p>
            <button onClick={() => navigate('/crear')} style={{ padding: '10px 24px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Crear actividad</button>
          </div>
        )}

        {!cargando && vencidas.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={seccionLabel}>🔴 Vencidas ({vencidas.length})</p>
            {vencidas.map(s => <Tarjeta key={s.id} sub={s} color="#f04a4a" chip="Vencida" navigate={navigate} />)}
          </div>
        )}

        {!cargando && paraHoy.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={seccionLabel}>🟡 Hacer hoy ({paraHoy.length})</p>
            {paraHoy.map(s => <Tarjeta key={s.id} sub={s} color="#f0a500" chip="Hoy" navigate={navigate} />)}
          </div>
        )}

        {!cargando && proximas.length > 0 && (
          <div>
            <p style={seccionLabel}>🔵 Próximas ({proximas.length})</p>
            {proximas.map(s => <Tarjeta key={s.id} sub={s} color="#3bbfa3" chip="Próxima" navigate={navigate} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function Tarjeta({ sub, color, chip, navigate }) {
  return (
    <div onClick={() => navigate(`/actividad/${sub.actividadId}`)}
      style={{ background: '#1a1a1f', borderLeft: `3px solid ${color}`, border: '1px solid #2a2a32', borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>{sub.nombre}</div>
        <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 3 }}>{sub.actividadTitulo} · {sub.actividadCurso}</div>
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: `${color}22`, color }}>{chip}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: '#6b6a7a' }}>{sub.horas ? `${sub.horas}h` : '—'}</span>
    </div>
  )
}

export function Sidebar({ navigate, actual }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const nombre = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario'
  const correo = usuario.correo || ''

  function cerrarSesion() {
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <aside style={{ background: '#1a1a1f', borderRight: '1px solid #2a2a32', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: 8 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7c6dfa' }}>📚 Planificador</div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0eff5', marginTop: 4 }}>{nombre}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b6a7a', marginTop: 1 }}>{correo}</div>
      </div>
      <button onClick={() => navigate('/crear')} style={nav(actual === 'crear')}>➕ Crear actividad</button>
      <button onClick={() => navigate('/hoy')} style={nav(actual === 'hoy')}>📅 Hoy</button>
      <button onClick={() => navigate('/actividades')} style={nav(actual === 'actividades')}>📋 Actividades</button>
      <button onClick={() => navigate('/progreso')} style={nav(actual === 'progreso')}>📊 Progreso</button>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a32' }}>
        <button onClick={cerrarSesion}
          style={{ width: '100%', padding: '8px 12px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          ↩ Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

const nav = (activo) => ({ padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem', color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, background: activo ? 'rgba(124,109,250,0.12)' : 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400 })
const seccionLabel = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 10 }