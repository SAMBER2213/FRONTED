// Hoy.jsx — Vista kanban con tres columnas: Vencidas, Hoy, Próximas
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'
import { BarraCarga } from './BarraCarga'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Hoy() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const fechaDisplay = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/hoy/`, { headers: getHeaders() })
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('No se pudo cargar. Verifica tu conexión.')
    }
    setCargando(false)
  }

  const vencidas = data?.vencidas || []
  const paraHoy  = data?.hoy      || []
  const proximas = data?.proximas  || []
  const total    = vencidas.length + paraHoy.length + proximas.length

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="hoy" />
      <main style={mainStyle}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={tituloPagina}>¿Qué tienes para hoy?</h2>
          <p style={subtituloPagina}>{fechaDisplay}</p>
        </div>

        {/* Barra de carga — siempre visible, se auto-carga */}
        <div style={{ width: '100%', maxWidth: 960 }}>
          <BarraCarga horasDelDia={data?.carga_hoy_horas} />
        </div>

        {cargando && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#8b8a9a', fontSize: '0.95rem' }}>
            Cargando tareas...
          </div>
        )}

        {!cargando && error && (
          <div style={{ maxWidth: 480, margin: '0 auto', background: 'rgba(240,74,74,0.08)', border: '1px solid #f04a4a', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#f07070', marginBottom: 14, fontSize: '0.95rem', fontWeight: 600 }}>⚠️ {error}</p>
            <button onClick={cargar} style={{ padding: '9px 22px', background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 600 }}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && total === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0eff5', marginBottom: 8 }}>No tienes tareas pendientes</p>
            <p style={{ fontSize: '0.88rem', color: '#8b8a9a', marginBottom: 28 }}>¡Todo al día! Crea una actividad para empezar.</p>
            <button onClick={() => navigate('/crear')} style={{ padding: '12px 28px', background: '#a78bfa', border: 'none', borderRadius: 12, color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              ✏️ Crear actividad
            </button>
          </div>
        )}

        {!cargando && !error && total > 0 && (
          <div style={kanbanGrid}>
            <Columna titulo="Vencidas" color="#f04a4a" bgColor="rgba(240,74,74,0.07)" borderColor="rgba(240,74,74,0.25)" items={vencidas} chip="Vencida" navigate={navigate} vacioMsg="Sin tareas vencidas" />
            <Columna titulo="Hoy" color="#f0a500" bgColor="rgba(240,165,0,0.07)" borderColor="rgba(240,165,0,0.25)" items={paraHoy} chip="Hoy" navigate={navigate} vacioMsg="Sin tareas para hoy" />
            <Columna titulo="Próximas" color="#60a5fa" bgColor="rgba(96,165,250,0.07)" borderColor="rgba(96,165,250,0.25)" items={proximas} chip="Próxima" navigate={navigate} vacioMsg="Sin tareas próximas" />
          </div>
        )}
      </main>
    </div>
  )
}

function Columna({ titulo, color, bgColor, borderColor, items, chip, navigate, vacioMsg }) {
  return (
    <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '18px 14px', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>{titulo}</p>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: `${color}22`, color, padding: '2px 9px', borderRadius: 20 }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#555465', textAlign: 'center' }}>{vacioMsg} ✓</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(s => <TarjetaKanban key={s.id} sub={s} color={color} chip={chip} navigate={navigate} />)}
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
      style={{ background: '#1a1a24', border: '1px solid #2a2a38', borderLeft: `3px solid ${color}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#21212e'}
      onMouseLeave={e => e.currentTarget.style.background = '#1a1a24'}
    >
      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f0eff5', marginBottom: 4, lineHeight: 1.4 }}>{sub.nombre}</p>
      <p style={{ fontSize: '0.74rem', color: '#8b8a9a', marginBottom: 8 }}>{sub.actividadTitulo} · {sub.actividadCurso}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: `${color}22`, color, padding: '2px 8px', borderRadius: 20 }}>{chip}</span>
          {sub.estado === 'pospuesto' && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(240,165,0,0.15)', color: '#f0a500', padding: '2px 8px', borderRadius: 20 }}>Pospuesto</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {sub.hora && <span style={{ fontSize: '0.72rem', color, fontWeight: 700 }}>{formatHora12(sub.hora)}</span>}
          {sub.horas && <span style={{ fontSize: '0.74rem', color: '#8b8a9a', fontWeight: 600 }}>{sub.horas}h</span>}
        </div>
      </div>
    </div>
  )
}

const layoutBase = { display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f15', color: '#f0eff5' }
const mainStyle = { marginLeft: '220px', flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }
const kanbanGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, width: '100%', maxWidth: 960 }
const tituloPagina = { fontSize: '1.6rem', fontWeight: 800, color: '#f0eff5', marginBottom: 6, letterSpacing: '-0.02em' }
const subtituloPagina = { fontSize: '0.88rem', color: '#8b8a9a', textTransform: 'capitalize' }