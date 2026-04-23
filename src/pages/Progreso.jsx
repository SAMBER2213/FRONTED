// Progreso.jsx — Avance global de actividades
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Progreso() {
  const navigate = useNavigate()
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/`, { headers: getHeaders() })
      if (!res.ok) throw new Error()
      setActividades(await res.json())
    } catch {
      setError('No se pudo cargar el progreso. Verifica tu conexión e intenta de nuevo.')
    }
    setCargando(false)
  }

  const totalSubtareas = actividades.reduce((a, act) => a + (act.subtareas || []).length, 0)
  const totalHechas = actividades.reduce((a, act) => a + (act.subtareas || []).filter(s => s.estado === 'hecho').length, 0)
  const progresoGlobal = totalSubtareas > 0 ? Math.round((totalHechas / totalSubtareas) * 100) : 0

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="progreso" />
      <main style={mainStyle}>
        {/* Encabezado */}
        <div style={{ width: '100%', maxWidth: 720, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={tituloPagina}>📊 Progreso</h2>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>✏️ Nueva actividad</button>
          </div>
          <p style={subtituloPagina}>Avance global de todas tus actividades evaluativas</p>
        </div>

        {cargando && <div style={estadoCentro}>Cargando progreso...</div>}

        {error && (
          <div style={tarjetaError}>
            <p style={{ color: '#f07070', marginBottom: 14, fontWeight: 600 }}>⚠️ {error}</p>
            <button onClick={cargar} style={btnError}>Reintentar</button>
          </div>
        )}

        {/* Sin actividades — botón centrado */}
        {!cargando && !error && actividades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
            <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f0eff5', marginBottom: 8 }}>No tienes actividades aún</p>
            <p style={{ fontSize: '0.88rem', color: '#8b8a9a', marginBottom: 28 }}>Crea una actividad para ver tu progreso aquí</p>
            <button onClick={() => navigate('/crear')} style={btnPrimario}>✏️ Crear actividad</button>
          </div>
        )}

        {!cargando && !error && actividades.length > 0 && (
          <div style={{ width: '100%', maxWidth: 720 }}>
            {/* Resumen global */}
            <div style={tarjetaResumen}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: '0.78rem', color: '#8b8a9a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Progreso global</p>
                <p style={{ fontSize: '2.8rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.03em' }}>{progresoGlobal}%</p>
              </div>
              <div style={{ height: 8, background: '#2a2a38', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ width: `${progresoGlobal}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', borderRadius: 10, transition: 'width 0.5s' }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#8b8a9a', textAlign: 'center', fontWeight: 500 }}>
                {totalHechas} de {totalSubtareas} subtareas completadas
              </p>
            </div>

            <p style={labelSeccion}>📁 Por actividad</p>

            {actividades.map(act => {
              const subs = act.subtareas || []
              const hechas = subs.filter(s => s.estado === 'hecho').length
              const total = subs.length
              const pct = total > 0 ? Math.round((hechas / total) * 100) : 0
              const color = pct === 100 ? '#3bbfa3' : pct >= 50 ? '#a78bfa' : '#f0a500'
              const hoyStr = new Date().toISOString().split('T')[0]
              const vencida = act.fechaLimite && act.fechaLimite < hoyStr && pct < 100

              return (
                <div key={act.id} onClick={() => navigate(`/actividad/${act.id}`)}
                  style={tarjetaAct(vencida)}
                  onMouseEnter={e => { e.currentTarget.style.background = '#21212e'; e.currentTarget.style.borderColor = vencida ? 'rgba(240,74,74,0.5)' : '#3a3a50' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1a1a24'; e.currentTarget.style.borderColor = vencida ? 'rgba(240,74,74,0.35)' : '#2a2a38' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0eff5' }}>{act.titulo}</p>
                        {vencida && <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(240,74,74,0.15)', color: '#f07070', padding: '2px 9px', borderRadius: 20, textTransform: 'uppercase' }}>VENCIDA</span>}
                        {pct === 100 && <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(59,191,163,0.15)', color: '#3bbfa3', padding: '2px 9px', borderRadius: 20, textTransform: 'uppercase' }}>✓ COMPLETADA</span>}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#8b8a9a', fontWeight: 500 }}>{act.tipo} · {act.curso}{act.fechaLimite ? ` · Vence ${act.fechaLimite}` : ''}</p>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color, minWidth: 46, textAlign: 'right' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#2a2a38', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
                    <p style={{ fontSize: '0.75rem', color: '#8b8a9a', fontWeight: 500 }}>{total === 0 ? 'Sin subtareas' : `${hechas}/${total} completadas`}</p>
                    <p style={{ fontSize: '0.75rem', color: '#555465' }}>ver detalle →</p>
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
const estadoCentro = { textAlign: 'center', padding: '64px', color: '#8b8a9a', fontSize: '0.95rem' }
const labelSeccion = { fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b8a9a', marginBottom: 12, marginTop: 4 }

const tarjetaResumen = {
  background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(96,165,250,0.08))',
  border: '1px solid rgba(167,139,250,0.25)',
  borderRadius: 16,
  padding: '24px 28px',
  marginBottom: 28,
}

const tarjetaAct = (vencida) => ({
  background: '#1a1a24',
  border: `1px solid ${vencida ? 'rgba(240,74,74,0.35)' : '#2a2a38'}`,
  borderRadius: 14,
  padding: '16px 20px',
  marginBottom: 10,
  cursor: 'pointer',
  transition: 'all 0.15s',
})

const tarjetaError = {
  maxWidth: 480,
  width: '100%',
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.3)',
  borderRadius: 14,
  padding: '24px',
  textAlign: 'center',
  fontSize: '0.92rem',
}

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