// Hoy.jsx — Vista principal que muestra las tareas del día ordenadas por prioridad
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'
const LIMITE_HORAS = 6 // Límite de horas diarias configurado

export default function Hoy() {
  const navigate = useNavigate()
  const [subtareas, setSubtareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Fecha de hoy en formato YYYY-MM-DD para comparar con fechas de subtareas
  const hoy = new Date().toISOString().split('T')[0]
  const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Carga las tareas al montar el componente
  useEffect(() => { cargar() }, [])

  // Llama al backend, obtiene todas las actividades y aplana las subtareas pendientes
  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/`)
      if (!res.ok) throw new Error()
      const actividades = await res.json()

      // Filtra subtareas no hechas y les agrega info de la actividad padre
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

  // Clasifica cada subtarea según su fecha comparada con hoy
  function grupo(sub) {
    if (!sub.fecha) return 'proximas'
    if (sub.fecha < hoy) return 'vencidas'
    if (sub.fecha === hoy) return 'hoy'
    return 'proximas'
  }

  // Regla de prioridad: vencidas primero (más antiguas arriba), luego hoy (menor esfuerzo primero), luego próximas por fecha
  const vencidas = subtareas.filter(s => grupo(s) === 'vencidas').sort((a, b) => a.fecha > b.fecha ? 1 : -1)
  const paraHoy = subtareas.filter(s => grupo(s) === 'hoy').sort((a, b) => a.horas - b.horas)
  const proximas = subtareas.filter(s => grupo(s) === 'proximas').sort((a, b) => a.fecha > b.fecha ? 1 : -1)

  // Suma de horas de las subtareas programadas para hoy
  const cargaHoy = paraHoy.reduce((acc, s) => acc + Number(s.horas || 0), 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} actual="hoy" />
      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>¿Qué tienes para hoy?</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>{fecha}</p>

        {/* Barra de carga del día — se pone roja si supera el límite */}
        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>Carga del día</span>
          <div style={{ flex: 1, height: 6, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((cargaHoy / LIMITE_HORAS) * 100, 100)}%`, height: '100%', background: cargaHoy >= LIMITE_HORAS ? '#f04a4a' : '#7c6dfa', borderRadius: 10 }}></div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>{cargaHoy}h / {LIMITE_HORAS}h</span>
        </div>

        {/* Explicación de la regla de prioridad para el usuario */}
        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 10, padding: '10px 16px', marginBottom: 24, fontSize: '0.78rem', color: '#6b6a7a' }}>
          📌 <strong style={{ color: '#f0eff5' }}>Regla de prioridad:</strong> Vencidas primero → Para hoy → Próximas por fecha. En empate, menor esfuerzo primero.
        </div>

        {/* Estado: cargando */}
        {cargando && <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>Cargando tareas...</div>}

        {/* Estado: error de conexión con botón reintentar */}
        {error && (
          <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#f04a4a', marginBottom: 12 }}>⚠️ {error}</p>
            <button onClick={cargar} style={{ padding: '8px 20px', background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reintentar</button>
          </div>
        )}

        {/* Estado: sin tareas pendientes */}
        {!cargando && !error && subtareas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b6a7a' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>🎉 No tienes tareas pendientes</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Crea una actividad para empezar</p>
            <button onClick={() => navigate('/crear')} style={{ padding: '10px 24px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Crear actividad</button>
          </div>
        )}

        {/* Sección: tareas vencidas */}
        {!cargando && vencidas.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={seccionLabel}>🔴 Vencidas</p>
            {vencidas.map(s => <Tarjeta key={s.id} sub={s} color="#f04a4a" chip="Vencida" navigate={navigate} />)}
          </div>
        )}

        {/* Sección: tareas para hoy */}
        {!cargando && paraHoy.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={seccionLabel}>🟡 Hacer hoy</p>
            {paraHoy.map(s => <Tarjeta key={s.id} sub={s} color="#f0a500" chip="Hoy" navigate={navigate} />)}
          </div>
        )}

        {/* Sección: tareas próximas */}
        {!cargando && proximas.length > 0 && (
          <div>
            <p style={seccionLabel}>🔵 Próximas</p>
            {proximas.map(s => <Tarjeta key={s.id} sub={s} color="#3bbfa3" chip="Próxima" navigate={navigate} />)}
          </div>
        )}
      </main>
    </div>
  )
}

// Tarjeta de subtarea — al hacer click navega al detalle de la actividad
function Tarjeta({ sub, color, chip, navigate }) {
  return (
    <div onClick={() => navigate(`/actividad/${sub.actividadId}`)}
      style={{ background: '#1a1a1f', borderLeft: `3px solid ${color}`, border: '1px solid #2a2a32', borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>{sub.nombre}</div>
        <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 3 }}>{sub.actividadTitulo} · {sub.actividadCurso}</div>
      </div>
      {/* Chip de estado con color según prioridad */}
      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: `${color}22`, color }}>{chip}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: '#6b6a7a' }}>{sub.horas ? `${sub.horas}h` : '—'}</span>
    </div>
  )
}

// Sidebar compartido con navegación principal y botón cerrar sesión
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
        {/* Cerrar sesión — borra el flag de localStorage y redirige al login */}
        <button onClick={() => { localStorage.removeItem('demo_logged'); navigate('/login') }}
          style={{ width: '100%', padding: '8px 12px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          ↩ Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

const nav = (activo) => ({ padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem', color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, background: activo ? 'rgba(124,109,250,0.12)' : 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400 })
const seccionLabel = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 10 }