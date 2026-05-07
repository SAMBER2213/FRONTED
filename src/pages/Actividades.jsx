// Actividades.jsx — Lista todas las actividades guardadas
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'
import { BarraCarga } from './BarraCarga'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Actividades() {
  const navigate = useNavigate()
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [cargaHoy, setCargaHoy] = useState(null)

  useEffect(() => {
    cargar()
    fetch(`${BASE_URL}/api/hoy/`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCargaHoy(d.carga_hoy_horas) })
      .catch(() => {})
  }, [])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/`, { headers: getHeaders() })
      if (!res.ok) throw new Error()
      setActividades(await res.json())
    } catch {
      setError('No se pudo cargar las actividades. Intenta de nuevo.')
    }
    setCargando(false)
  }

  async function eliminar(id) {
    if (!confirm('¿Seguro que deseas eliminar esta actividad?')) return
    setEliminando(id)
    try {
      await fetch(`${BASE_URL}/api/actividades/${id}/`, { method: 'DELETE', headers: getHeaders() })
      setActividades(actividades.filter(a => a.id !== id))
    } catch {
      alert('Error al eliminar. Intenta de nuevo.')
    }
    setEliminando(null)
  }

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="actividades" />
      <main style={mainStyle}>
        {/* Encabezado */}
        <div style={{ width: '100%', maxWidth: 720, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={tituloPagina}>Actividades</h2>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>
              ✏️ Nueva actividad
            </button>
          </div>
          <p style={subtituloPagina}>Todas tus actividades evaluativas</p>
        </div>

        {/* Barra de carga diaria — misma que en la vista Hoy */}
        <div style={{ width: '100%', maxWidth: 720 }}>
          <BarraCarga horasDelDia={cargaHoy} />
        </div>

        {/* Estado: cargando */}
        {cargando && <SpinnerCarga texto="Cargando actividades..." />}

        {/* Estado: error */}
        {error && (
          <div style={tarjetaError}>
            <p style={{ color: '#f07070', marginBottom: 14, fontSize: '0.95rem', fontWeight: 600 }}>⚠️ {error}</p>
            <button onClick={cargar} style={btnError}>Reintentar</button>
          </div>
        )}

        {/* Sin actividades — botón centrado */}
        {!cargando && !error && actividades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0eff5', marginBottom: 8 }}>No tienes actividades aún</p>
            <p style={{ fontSize: '0.88rem', color: '#8b8a9a', marginBottom: 28 }}>Crea tu primera actividad evaluativa</p>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>
              ✏️ Crear actividad
            </button>
          </div>
        )}

        {/* Lista de actividades */}
        {!cargando && !error && actividades.length > 0 && (
          <div style={{ width: '100%', maxWidth: 720 }}>
            {actividades.map(act => {
              const subs = act.subtareas || []
              const hechas = subs.filter(s => s.estado === 'hecho').length
              const pct = subs.length > 0 ? Math.round((hechas / subs.length) * 100) : 0
              const hoyStr = new Date().toISOString().split('T')[0]
              const vencida = act.fechaLimite && act.fechaLimite < hoyStr && pct < 100
              const color = pct === 100 ? '#3bbfa3' : pct >= 50 ? '#a78bfa' : '#f0a500'

              return (
                <div key={act.id} style={tarjetaActividad(vencida)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/actividad/${act.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#f0eff5' }}>{act.titulo}</p>
                        {vencida && <Chip texto="VENCIDA" color="#f04a4a" />}
                        {pct === 100 && <Chip texto="✓ COMPLETADA" color="#3bbfa3" />}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#8b8a9a', fontWeight: 500 }}>
                        {act.tipo} · {act.curso}{act.fechaLimite ? ` · Vence ${act.fechaLimite}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => eliminar(act.id)}
                      disabled={eliminando === act.id}
                      style={btnEliminar}
                    >
                      {eliminando === act.id ? '...' : '🗑'}
                    </button>
                  </div>

                  {/* Barra progreso */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 5, background: '#2a2a38', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#8b8a9a', fontWeight: 600, minWidth: 44 }}>
                      {hechas}/{subs.length} · {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

function Chip({ texto, color }) {
  return (
    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: `${color}22`, color, padding: '2px 9px', borderRadius: 20, textTransform: 'uppercase' }}>
      {texto}
    </span>
  )
}

function SpinnerCarga({ texto }) {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-ring {
          width: 44px; height: 44px;
          border: 4px solid rgba(167,139,250,0.15);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 16 }}>
        <div className="spinner-ring" />
        <p style={{ color: '#8b8a9a', fontSize: '0.88rem', fontWeight: 500 }}>{texto}</p>
      </div>
    </>
  )
}

// ─── Estilos ─────────────────────────────────────────────────
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

const tituloPagina = { fontSize: '1.6rem', fontWeight: 800, color: '#f0eff5', letterSpacing: '-0.02em' }
const subtituloPagina = { fontSize: '0.88rem', color: '#8b8a9a' }

const tarjetaError = {
  maxWidth: 480,
  width: '100%',
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.3)',
  borderRadius: 14,
  padding: '24px',
  textAlign: 'center'
}

const btnError = {
  padding: '9px 22px',
  background: 'none',
  border: '1px solid #f04a4a',
  borderRadius: 8,
  color: '#f07070',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.88rem',
  fontWeight: 600,
}

const tarjetaActividad = (vencida) => ({
  background: '#1a1a24',
  border: `1px solid ${vencida ? 'rgba(240,74,74,0.4)' : '#2a2a38'}`,
  borderRadius: 14,
  padding: '18px 22px',
  marginBottom: 12,
})

const btnPrimario = {
  padding: '10px 22px',
  background: '#a78bfa',
  border: 'none',
  borderRadius: 10,
  color: 'white',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnEliminar = {
  padding: '6px 10px',
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.2)',
  borderRadius: 8,
  color: '#f07070',
  cursor: 'pointer',
  fontSize: '0.88rem',
  flexShrink: 0,
}