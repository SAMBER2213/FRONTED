// Hoy.jsx — Vista kanban con tres columnas: Vencidas, Hoy, Próximas
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Hoy() {
  const navigate = useNavigate()
  const [subtareas, setSubtareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const hoy = new Date().toISOString().split('T')[0]
  const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/`, { headers: getHeaders() })
      if (!res.ok) throw new Error()
      const actividades = await res.json()
      const todas = actividades.flatMap(act =>
        (act.subtareas || []).filter(s => s.estado !== 'hecho').map(sub => ({
          ...sub,
          actividadId: act.id,
          actividadTitulo: act.titulo,
          actividadCurso: act.curso
        }))
      )
      setSubtareas(todas)
    } catch {
      setError('No se pudo cargar. Verifica tu conexión.')
    }
    setCargando(false)
  }

  function grupo(sub) {
    if (!sub.fecha) return 'proximas'
    if (sub.fecha < hoy) return 'vencidas'
    if (sub.fecha === hoy) return 'hoy'
    return 'proximas'
  }

  const vencidas = subtareas.filter(s => grupo(s) === 'vencidas').sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha > b.fecha ? 1 : -1
    if (a.hora && b.hora) return a.hora > b.hora ? 1 : -1
    return 0
  })
  const paraHoy = subtareas.filter(s => grupo(s) === 'hoy').sort((a, b) => {
    if (a.hora && b.hora) return a.hora > b.hora ? 1 : -1
    if (a.hora) return -1
    if (b.hora) return 1
    return a.horas - b.horas
  })
  const proximas = subtareas.filter(s => grupo(s) === 'proximas').sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha > b.fecha ? 1 : -1
    if (a.hora && b.hora) return a.hora > b.hora ? 1 : -1
    return 0
  })
  const totalSubtareas = subtareas.length

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="hoy" />
      <main style={mainStyle}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={tituloPagina}>¿Qué tienes para hoy?</h2>
          <p style={subtituloPagina}>{fecha}</p>
        </div>

        {/* Estado: cargando */}
        {cargando && (
          <div style={{ textAlign: 'center', padding: '64px', color: '#8b8a9a', fontSize: '0.95rem' }}>
            Cargando tareas...
          </div>
        )}

        {/* Estado: error */}
        {error && (
          <div style={{ maxWidth: 480, margin: '0 auto', background: 'rgba(240,74,74,0.08)', border: '1px solid #f04a4a', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#f07070', marginBottom: 14, fontSize: '0.95rem', fontWeight: 600 }}>⚠️ {error}</p>
            <button onClick={cargar} style={btnSecundario('#f04a4a')}>Reintentar</button>
          </div>
        )}

        {/* Sin tareas: botón centrado */}
        {!cargando && !error && totalSubtareas === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0eff5', marginBottom: 8 }}>No tienes tareas pendientes</p>
            <p style={{ fontSize: '0.88rem', color: '#8b8a9a', marginBottom: 28 }}>¡Todo al día! Crea una actividad para empezar</p>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>
              ✏️ Crear actividad
            </button>
          </div>
        )}

        {/* Kanban 3 columnas */}
        {!cargando && !error && totalSubtareas > 0 && (
          <div style={kanbanGrid}>
            <Columna
              titulo="🔴 Vencidas"
              color="#f04a4a"
              bgColor="rgba(240,74,74,0.07)"
              borderColor="rgba(240,74,74,0.25)"
              items={vencidas}
              chip="Vencida"
              navigate={navigate}
              vacioMsg="Sin tareas vencidas"
            />
            <Columna
              titulo="🟡 Hoy"
              color="#f0a500"
              bgColor="rgba(240,165,0,0.07)"
              borderColor="rgba(240,165,0,0.25)"
              items={paraHoy}
              chip="Hoy"
              navigate={navigate}
              vacioMsg="Sin tareas para hoy"
            />
            <Columna
              titulo="🔵 Próximas"
              color="#60a5fa"
              bgColor="rgba(96,165,250,0.07)"
              borderColor="rgba(96,165,250,0.25)"
              items={proximas}
              chip="Próxima"
              navigate={navigate}
              vacioMsg="Sin tareas próximas"
            />
          </div>
        )}
      </main>
    </div>
  )
}

function Columna({ titulo, color, bgColor, borderColor, items, chip, navigate, vacioMsg }) {
  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 16,
      padding: '18px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      minHeight: 320,
    }}>
      {/* Encabezado columna */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>
          {titulo}
        </p>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: `${color}22`, color, padding: '2px 9px', borderRadius: 20 }}>
          {items.length}
        </span>
      </div>

      {/* Tarjetas */}
      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#555465', textAlign: 'center' }}>{vacioMsg} ✓</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(s => (
            <TarjetaKanban key={s.id} sub={s} color={color} chip={chip} navigate={navigate} />
          ))}
        </div>
      )}
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

function TarjetaKanban({ sub, color, chip, navigate }) {
  return (
    <div
      onClick={() => navigate(`/actividad/${sub.actividadId}`)}
      style={{
        background: '#1a1a24',
        border: `1px solid #2a2a38`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#21212e'}
      onMouseLeave={e => e.currentTarget.style.background = '#1a1a24'}
    >
      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0eff5', marginBottom: 4, lineHeight: 1.4 }}>{sub.nombre}</p>
      <p style={{ fontSize: '0.74rem', color: '#8b8a9a', marginBottom: 8 }}>{sub.actividadTitulo} · {sub.actividadCurso}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: `${color}22`, color, padding: '2px 8px', borderRadius: 20 }}>{chip}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {sub.hora && <span style={{ fontSize: '0.72rem', color, fontWeight: 700 }}>{formatHora12(sub.hora)}</span>}
          {sub.horas && <span style={{ fontSize: '0.74rem', color: '#8b8a9a', fontWeight: 600 }}>{sub.horas}h</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Estilos base ───────────────────────────────────────────
const layoutBase = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: 'DM Sans, sans-serif',
  background: '#0f0f15',
  color: '#f0eff5',
}

const mainStyle = {
  marginLeft: '220px',
  flex: 1,
  padding: '40px 32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const kanbanGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 18,
  width: '100%',
  maxWidth: 960,
}

const tituloPagina = {
  fontSize: '1.6rem',
  fontWeight: 800,
  color: '#f0eff5',
  marginBottom: 6,
  letterSpacing: '-0.02em',
}

const subtituloPagina = {
  fontSize: '0.88rem',
  color: '#8b8a9a',
  textTransform: 'capitalize',
}

const btnPrimario = {
  padding: '12px 28px',
  background: '#a78bfa',
  border: 'none',
  borderRadius: 12,
  color: 'white',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnSecundario = (color) => ({
  padding: '9px 22px',
  background: 'none',
  border: `1px solid ${color}`,
  borderRadius: 8,
  color,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.88rem',
  fontWeight: 600,
})