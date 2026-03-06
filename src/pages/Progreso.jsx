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
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} actual="progreso" />
      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Progreso</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>Avance global de todas tus actividades evaluativas</p>

        {cargando && <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>Cargando progreso...</div>}

        {error && (
          <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: 20 }}>
            <p style={{ color: '#f04a4a', marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargar} style={{ padding: '8px 20px', background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && actividades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No tienes actividades aún</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Crea una actividad para ver tu progreso aquí</p>
            <button onClick={() => navigate('/crear')} style={{ padding: '10px 24px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Crear actividad</button>
          </div>
        )}

        {!cargando && !error && actividades.length > 0 && (
          <>
            <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#6b6a7a', marginBottom: 4 }}>Progreso global</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#7c6dfa', fontFamily: 'DM Mono, monospace' }}>{progresoGlobal}%</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: '#2a2a32', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${progresoGlobal}%`, height: '100%', background: '#7c6dfa', borderRadius: 10, transition: 'width 0.4s' }}></div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#6b6a7a' }}>{totalHechas} de {totalSubtareas} subtareas completadas</p>
              </div>
            </div>

            <p style={labelSeccion}>Por actividad</p>
            {actividades.map(act => {
              const subs = act.subtareas || []
              const hechas = subs.filter(s => s.estado === 'hecho').length
              const total = subs.length
              const pct = total > 0 ? Math.round((hechas / total) * 100) : 0
              const color = pct === 100 ? '#3bbfa3' : pct >= 50 ? '#7c6dfa' : '#f0a500'
              const hoy = new Date().toISOString().split('T')[0]
              const vencida = act.fechaLimite && act.fechaLimite < hoy && pct < 100

              return (
                <div key={act.id} onClick={() => navigate(`/actividad/${act.id}`)}
                  style={{ background: '#1a1a1f', border: `1px solid ${vencida ? '#f04a4a' : '#2a2a32'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 10, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = vencida ? '#f04a4a' : '#3a3a45'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = vencida ? '#f04a4a' : '#2a2a32'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{act.titulo}</p>
                        {vencida && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(240,74,74,0.15)', color: '#f04a4a', padding: '2px 8px', borderRadius: 20 }}>VENCIDA</span>}
                        {pct === 100 && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(59,191,163,0.15)', color: '#3bbfa3', padding: '2px 8px', borderRadius: 20 }}>✓ COMPLETADA</span>}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#6b6a7a' }}>{act.tipo} · {act.curso}{act.fechaLimite ? ` · Vence ${act.fechaLimite}` : ''}</p>
                    </div>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1rem', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 0.4s' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b6a7a' }}>{total === 0 ? 'Sin subtareas' : `${hechas}/${total} subtareas completadas`}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b6a7a' }}>click para ver detalle →</p>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </main>
    </div>
  )
}

const labelSeccion = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 10 }