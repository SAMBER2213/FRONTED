import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Actividades() {
  const navigate = useNavigate()
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(null)

  useEffect(() => { cargar() }, [])

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
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} actual="actividades" />
      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Actividades</h2>
          <button onClick={() => navigate('/crear')} style={{ padding: '9px 20px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            + Nueva actividad
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>Todas tus actividades evaluativas</p>

        {cargando && <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>Cargando actividades...</div>}

        {error && (
          <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#f04a4a', marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargar} style={{ padding: '8px 20px', background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && actividades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No tienes actividades aún</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Crea tu primera actividad evaluativa</p>
            <button onClick={() => navigate('/crear')} style={{ padding: '10px 24px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Crear actividad</button>
          </div>
        )}

        {!cargando && !error && actividades.map(act => {
          const subs = act.subtareas || []
          const hechas = subs.filter(s => s.estado === 'hecho').length
          const pct = subs.length > 0 ? Math.round((hechas / subs.length) * 100) : 0
          const hoy = new Date().toISOString().split('T')[0]
          const vencida = act.fechaLimite && act.fechaLimite < hoy && pct < 100
          const color = pct === 100 ? '#3bbfa3' : pct >= 50 ? '#7c6dfa' : '#f0a500'

          return (
            <div key={act.id} style={{ background: '#1a1a1f', border: `1px solid ${vencida ? '#f04a4a' : '#2a2a32'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/actividad/${act.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{act.titulo}</p>
                    {vencida && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(240,74,74,0.15)', color: '#f04a4a', padding: '2px 8px', borderRadius: 20 }}>VENCIDA</span>}
                    {pct === 100 && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(59,191,163,0.15)', color: '#3bbfa3', padding: '2px 8px', borderRadius: 20 }}>✓ COMPLETADA</span>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6b6a7a' }}>{act.tipo} · {act.curso} {act.fechaLimite ? `· Vence ${act.fechaLimite}` : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                  <button onClick={() => navigate(`/actividad/${act.id}`)} style={{ background: 'none', border: '1px solid #2a2a32', borderRadius: 8, color: '#6b6a7a', fontSize: '0.78rem', padding: '4px 12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Ver detalle</button>
                  <button onClick={() => eliminar(act.id)} disabled={eliminando === act.id} style={{ background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', fontSize: '0.78rem', padding: '4px 12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: eliminando === act.id ? 0.5 : 1 }}>
                    {eliminando === act.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
              <div style={{ height: 4, background: '#2a2a32', borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10 }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b6a7a' }}>{subs.length === 0 ? 'Sin subtareas' : `${hechas}/${subs.length} subtareas · ${pct}% completado`}</p>
            </div>
          )
        })}
      </main>
    </div>
  )
}