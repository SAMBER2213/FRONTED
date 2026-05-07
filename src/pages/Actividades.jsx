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
  const [actividadAEliminar, setActividadAEliminar] = useState(null)
  const [mensajeExito, setMensajeExito] = useState('')
  const [mensajeAccionError, setMensajeAccionError] = useState('')

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

  function pedirConfirmacionEliminar(actividad) {
    setActividadAEliminar(actividad)
    setMensajeAccionError('')
  }

  function cerrarConfirmacionEliminar() {
    if (eliminando) return
    setActividadAEliminar(null)
    setMensajeAccionError('')
  }

  async function confirmarEliminarActividad() {
    if (!actividadAEliminar) return

    setEliminando(actividadAEliminar.id)
    setMensajeAccionError('')

    try {
      const res = await fetch(`${BASE_URL}/api/actividades/${actividadAEliminar.id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (!res.ok) throw new Error()

      setActividades(actividades.filter(a => a.id !== actividadAEliminar.id))
      setActividadAEliminar(null)
      setMensajeExito('Actividad eliminada correctamente.')
      setTimeout(() => setMensajeExito(''), 3200)
    } catch {
      setMensajeAccionError('No se pudo eliminar la actividad. Intenta de nuevo.')
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="actividades" />

      <main style={mainStyle}>
        <div style={{ width: '100%', maxWidth: 720, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={tituloPagina}>Actividades</h2>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>
              Nueva actividad
            </button>
          </div>
          <p style={subtituloPagina}>Todas tus actividades evaluativas</p>
        </div>

        <div style={{ width: '100%', maxWidth: 720 }}>
          <BarraCarga horasDelDia={cargaHoy} />
        </div>

        {cargando && <SpinnerCarga texto="Cargando actividades..." />}

        {error && (
          <div style={tarjetaError}>
            <p style={{ color: '#f07070', marginBottom: 14, fontSize: '0.95rem', fontWeight: 600 }}>
              {error}
            </p>
            <button onClick={cargar} style={btnError}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && actividades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0eff5', marginBottom: 8 }}>
              No tienes actividades aún
            </p>
            <p style={{ fontSize: '0.88rem', color: '#8b8a9a', marginBottom: 28 }}>
              Crea tu primera actividad evaluativa
            </p>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>
              Crear actividad
            </button>
          </div>
        )}

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
                        {pct === 100 && <Chip texto="COMPLETADA" color="#3bbfa3" />}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#8b8a9a', fontWeight: 500 }}>
                        {act.tipo} · {act.curso}{act.fechaLimite ? ` · Vence ${act.fechaLimite}` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => pedirConfirmacionEliminar(act)}
                      disabled={eliminando === act.id}
                      style={btnEliminar}
                      aria-label={`Eliminar actividad ${act.titulo}`}
                      title="Eliminar actividad"
                    >
                      {eliminando === act.id ? '...' : '🗑'}
                    </button>
                  </div>

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

      {mensajeExito && <Toast texto={mensajeExito} />}

      {actividadAEliminar && (
        <ModalConfirmacionEliminar
          titulo="Eliminar actividad"
          descripcion={
            <>
              Vas a eliminar <strong>{actividadAEliminar.titulo}</strong>. Esta acción también eliminará todas sus subtareas y no se puede deshacer.
            </>
          }
          error={mensajeAccionError}
          cargando={eliminando === actividadAEliminar.id}
          textoConfirmar="Sí, eliminar"
          onCancelar={cerrarConfirmacionEliminar}
          onConfirmar={confirmarEliminarActividad}
        />
      )}
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

function ModalConfirmacionEliminar({ titulo, descripcion, error, cargando, textoConfirmar, onCancelar, onConfirmar }) {
  return (
    <div style={overlayModal} role="dialog" aria-modal="true" aria-labelledby="modal-eliminar-titulo">
      <div style={modalConfirmacion}>
        <div style={iconoAdvertencia}>!</div>
        <h3 id="modal-eliminar-titulo" style={tituloModal}>{titulo}</h3>
        <p style={textoModal}>{descripcion}</p>

        {error && <p style={textoErrorModal}>⚠️ {error}</p>}

        <div style={accionesModal}>
          <button type="button" onClick={onCancelar} disabled={cargando} style={btnCancelarModal}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar} disabled={cargando} style={btnConfirmarEliminar}>
            {cargando ? 'Eliminando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ texto }) {
  return (
    <div style={toast} role="status" aria-live="polite">
      <span>✅</span>
      <span>{texto}</span>
    </div>
  )
}

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
  textAlign: 'center',
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

const overlayModal = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.72)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
}

const modalConfirmacion = {
  width: '100%',
  maxWidth: 440,
  background: '#1a1a24',
  border: '1px solid #2a2a38',
  borderRadius: 18,
  padding: '28px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
}

const iconoAdvertencia = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  background: 'rgba(240,74,74,0.12)',
  border: '1px solid rgba(240,74,74,0.35)',
  color: '#f07070',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.35rem',
  fontWeight: 900,
  marginBottom: 14,
}

const tituloModal = {
  fontSize: '1.2rem',
  fontWeight: 800,
  color: '#f0eff5',
  marginBottom: 10,
}

const textoModal = {
  fontSize: '0.9rem',
  lineHeight: 1.6,
  color: '#b9b8c8',
  marginBottom: 18,
}

const textoErrorModal = {
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.28)',
  color: '#f07070',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: '0.82rem',
  fontWeight: 600,
  marginBottom: 16,
}

const accionesModal = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
}

const btnCancelarModal = {
  padding: '10px 18px',
  background: 'none',
  border: '1px solid #3a3a50',
  borderRadius: 10,
  color: '#d0cfdf',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnConfirmarEliminar = {
  padding: '10px 18px',
  background: '#f04a4a',
  border: '1px solid #f04a4a',
  borderRadius: 10,
  color: 'white',
  fontSize: '0.88rem',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const toast = {
  position: 'fixed',
  right: 28,
  bottom: 28,
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  maxWidth: 360,
  background: 'rgba(59,191,163,0.12)',
  border: '1px solid rgba(59,191,163,0.38)',
  color: '#3bbfa3',
  borderRadius: 14,
  padding: '13px 16px',
  fontSize: '0.88rem',
  fontWeight: 700,
  boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
}