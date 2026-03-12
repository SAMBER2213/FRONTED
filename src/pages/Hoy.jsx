import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'

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
      const res = await fetch(`${BASE_URL}/api/hoy/`, { headers: getHeaders() })
      if (!res.ok) throw new Error()
      setDatos(await res.json())
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
      <main style={{ padding: '36px 40px', maxWidth: 760 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>¿Qué tienes para hoy?</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>{fecha}</p>
          </div>
          <button onClick={() => navigate('/crear')}
            style={{ padding: '9px 20px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            + Nueva actividad
          </button>
        </div>

        {/* Barra de carga */}
        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '14px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>Carga del día</span>
          <div style={{ flex: 1, height: 6, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((cargaHoy / LIMITE_HORAS) * 100, 100)}%`, height: '100%', background: cargaHoy >= LIMITE_HORAS ? '#f04a4a' : '#7c6dfa', borderRadius: 10 }}></div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>{cargaHoy}h / {LIMITE_HORAS}h</span>
        </div>

        {/* Regla */}
        {regla && (
          <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 10, padding: '10px 16px', marginBottom: 28, fontSize: '0.78rem', color: '#6b6a7a' }}>
            📌 <strong style={{ color: '#f0eff5' }}>Regla de prioridad:</strong> {regla}
          </div>
        )}

        {/* Estados */}
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
            <p style={{ fontSize: '0.85rem' }}>Agrega subtareas a tus actividades para verlas aquí</p>
          </div>
        )}

        {/* Tabla de tareas */}
        {!cargando && !error && totalSubtareas > 0 && (
          <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, overflow: 'hidden' }}>

            {/* Cabecera tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 70px 70px', padding: '10px 18px', borderBottom: '1px solid #2a2a32', background: '#141418' }}>
              <span style={thStyle}>Tarea</span>
              <span style={thStyle}>Actividad · Curso</span>
              <span style={{ ...thStyle, textAlign: 'center' }}>Fecha / Hora</span>
              <span style={{ ...thStyle, textAlign: 'center' }}>Horas</span>
            </div>

            {/* Sección Vencidas */}
            {vencidas.length > 0 && (
              <>
                <SeccionHeader color="#f04a4a" emoji="🔴" label="Vencidas" count={vencidas.length} />
                {vencidas.map((s, i) => (
                  <FilaTarea key={s.id} sub={s} color="#f04a4a" navigate={navigate} ultimo={i === vencidas.length - 1 && paraHoy.length === 0 && proximas.length === 0} />
                ))}
              </>
            )}

            {/* Sección Hoy */}
            {paraHoy.length > 0 && (
              <>
                <SeccionHeader color="#f0a500" emoji="🟡" label="Hacer hoy" count={paraHoy.length} />
                {paraHoy.map((s, i) => (
                  <FilaTarea key={s.id} sub={s} color="#f0a500" navigate={navigate} ultimo={i === paraHoy.length - 1 && proximas.length === 0} />
                ))}
              </>
            )}

            {/* Sección Próximas */}
            {proximas.length > 0 && (
              <>
                <SeccionHeader color="#3bbfa3" emoji="🔵" label="Próximas" count={proximas.length} />
                {proximas.map((s, i) => (
                  <FilaTarea key={s.id} sub={s} color="#3bbfa3" navigate={navigate} ultimo={i === proximas.length - 1} />
                ))}
              </>
            )}

          </div>
        )}
      </main>
    </div>
  )
}

function SeccionHeader({ color, emoji, label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: `${color}0f`, borderBottom: '1px solid #2a2a32', borderTop: '1px solid #2a2a32' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>{emoji} {label}</span>
      <span style={{ fontSize: '0.68rem', background: `${color}22`, color, padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>{count}</span>
    </div>
  )
}

function formatHora12(hora24) {
  if (!hora24) return ''
  const [h, m] = hora24.split(':')
  const n = parseInt(h)
  const ampm = n >= 12 ? 'PM' : 'AM'
  const h12 = n > 12 ? n - 12 : n === 0 ? 12 : n
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`
}

function FilaTarea({ sub, color, navigate, ultimo }) {
  return (
    <div onClick={() => navigate(`/actividad/${sub.actividadId}`)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 140px 90px 70px',
        padding: '12px 18px', cursor: 'pointer',
        borderBottom: ultimo ? 'none' : '1px solid #1e1e25',
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#1e1e25'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f0eff5' }}>{sub.nombre}</div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b6a7a', alignSelf: 'center', paddingRight: 8 }}>
        {sub.actividadTitulo} · {sub.actividadCurso}
      </div>
      <div style={{ textAlign: 'center', alignSelf: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: sub.fecha ? color : '#6b6a7a', fontFamily: 'DM Mono, monospace' }}>
          {sub.fecha || '—'}
        </div>
        {sub.hora && (
          <div style={{ fontSize: '0.7rem', color: '#6b6a7a', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>
            {formatHora12(sub.hora)}
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#6b6a7a', textAlign: 'center', alignSelf: 'center', fontFamily: 'DM Mono, monospace' }}>
        {sub.horas ? `${sub.horas}h` : '—'}
      </div>
    </div>
  )
}

export { Sidebar }

const thStyle = { fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6a7a' }