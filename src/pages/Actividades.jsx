// Actividades.jsx — Lista todas las actividades guardadas en MongoDB
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export default function Actividades() {
  const navigate = useNavigate()
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(null) // Guarda el id que se está eliminando

  useEffect(() => { cargar() }, [])

  // Obtiene todas las actividades del backend
  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/`)
      if (!res.ok) throw new Error()
      setActividades(await res.json())
    } catch {
      setError('No se pudo cargar las actividades. Intenta de nuevo.')
    }
    setCargando(false)
  }

  // Elimina una actividad por id tras confirmar con el usuario
  async function eliminar(id) {
    if (!confirm('¿Seguro que deseas eliminar esta actividad?')) return
    setEliminando(id)
    try {
      await fetch(`${BASE_URL}/api/actividades/${id}/`, { method: 'DELETE' })
      // Actualiza la lista sin volver a llamar al backend
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
          {/* Acceso rápido a crear nueva actividad */}
          <button onClick={() => navigate('/crear')} style={{ padding: '9px 20px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            + Nueva actividad
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>Todas tus actividades evaluativas</p>

        {/* Estado: cargando */}
        {cargando && <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>Cargando actividades...</div>}

        {/* Estado: error */}
        {error && (
          <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#f04a4a', marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargar} style={{ padding: '8px 20px', background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reintentar</button>
          </div>
        )}

        {/* Estado: sin actividades */}
        {!cargando && !error && actividades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No tienes actividades aún</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Crea tu primera actividad evaluativa</p>
            <button onClick={() => navigate('/crear')} style={{ padding: '10px 24px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Crear actividad</button>
          </div>
        )}

        {/* Lista de actividades */}
        {!cargando && !error && actividades.map(act => {
          const subs = act.subtareas || []
          const hechas = subs.filter(s => s.estado === 'hecho').length
          const pct = subs.length > 0 ? Math.round((hechas / subs.length) * 100) : 0
          const hoy = new Date().toISOString().split('T')[0]
          // Actividad vencida si la fecha límite pasó y no está completada
          const vencida = act.fechaLimite && act.fechaLimite < hoy && pct < 100
          // Color de la barra según el progreso
          const color = pct === 100 ? '#3bbfa3' : pct >= 50 ? '#7c6dfa' : '#f0a500'

          return (
            <div key={act.id} style={{ background: '#1a1a1f', border: `1px solid ${vencida ? '#f04a4a' : '#2a2a32'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                {/* Título y metadatos — clic navega al detalle */}
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/actividad/${act.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{act.titulo}</p>
                    {/* Chips de estado */}
                    {vencida && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(240,74,74,0.15)', color: '#f04a4a', padding: '2px 8px', borderRadius: 20 }}>VENCIDA</span>}
                    {pct === 100 && <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(59,191,163,0.15)', color: '#3bbfa3', padding: '2px 8px', borderRadius: 20 }}>✓ COMPLETADA</span>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6b6a7a' }}>{act.tipo} · {act.curso} {act.fechaLimite ? `· Vence ${act.fechaLimite}` : ''}</p>
                </div>
                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                  <button onClick={() => navigate(`/actividad/${act.id}`)} style={{ background: 'none', border: '1px solid #2a2a32', borderRadius: 8, color: '#6b6a7a', fontSize: '0.78rem', padding: '4px 12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Ver detalle</button>
                  <button onClick={() => eliminar(act.id)} disabled={eliminando === act.id} style={{ background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', fontSize: '0.78rem', padding: '4px 12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: eliminando === act.id ? 0.5 : 1 }}>
                    {eliminando === act.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
              {/* Barra de progreso de subtareas */}
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

function Sidebar({ navigate, actual }) {
  return (
    <aside style={{ background: '#1a1a1f', borderRight: '1px solid #2a2a32', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: 8 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7c6dfa' }}>📚 Planificador</div>
        <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 2 }}>Demo · demo@univalle.edu.co</div>
      </div>
      <button onClick={() => navigate('/hoy')} style={nav(actual === 'hoy')}>📅 Hoy</button>
      <button onClick={() => navigate('/actividades')} style={nav(actual === 'actividades')}>📋 Actividades</button>
      <button onClick={() => navigate('/crear')} style={nav(actual === 'crear')}>➕ Crear actividad</button>
      <button onClick={() => navigate('/progreso')} style={nav(actual === 'progreso')}>📊 Progreso</button>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a32' }}>
        <button onClick={() => { localStorage.removeItem('demo_logged'); navigate('/login') }}
          style={{ width: '100%', padding: '8px 12px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          ↩ Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

const nav = (activo) => ({ padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem', color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, background: activo ? 'rgba(124,109,250,0.12)' : 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400 })