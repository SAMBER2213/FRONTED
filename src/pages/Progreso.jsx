import { useNavigate } from 'react-router-dom'

const actividadesDemo = [
  { id: 1, titulo: 'Parcial de Cálculo', tipo: 'Examen', curso: 'Cálculo Diferencial', fechaLimite: '2026-03-10', subtareas: [{ estado: 'hecho' }, { estado: 'hecho' }, { estado: 'pendiente' }] },
  { id: 2, titulo: 'Taller de Estructuras', tipo: 'Taller', curso: 'Estructuras de Datos', fechaLimite: '2026-03-05', subtareas: [{ estado: 'hecho' }, { estado: 'pendiente' }, { estado: 'pendiente' }, { estado: 'pendiente' }] },
  { id: 3, titulo: 'Exposición Bases de Datos', tipo: 'Proyecto', curso: 'Bases de Datos', fechaLimite: '2026-03-15', subtareas: [{ estado: 'pendiente' }, { estado: 'pendiente' }] },
]

export default function Progreso() {
  const navigate = useNavigate()

  const totalSubtareas = actividadesDemo.reduce((a, act) => a + act.subtareas.length, 0)
  const totalHechas = actividadesDemo.reduce((a, act) => a + act.subtareas.filter(s => s.estado === 'hecho').length, 0)
  const progresoGlobal = Math.round((totalHechas / totalSubtareas) * 100)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} actual="progreso" />

      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Progreso</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>Vista de avance global de todas tus actividades</p>

        {/* Resumen global */}
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

        {/* Lista por actividad */}
        <p style={labelSeccion}>Por actividad</p>
        {actividadesDemo.map(act => {
          const hechas = act.subtareas.filter(s => s.estado === 'hecho').length
          const total = act.subtareas.length
          const pct = Math.round((hechas / total) * 100)
          const color = pct === 100 ? '#3bbfa3' : pct >= 50 ? '#7c6dfa' : '#f0a500'

          return (
            <div key={act.id} onClick={() => navigate(`/actividad/${act.id}`)}
              style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 12, padding: '16px 20px', marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a45'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a32'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{act.titulo}</p>
                  <p style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 2 }}>{act.tipo} · {act.curso} · Vence {act.fechaLimite}</p>
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1rem', fontWeight: 700, color }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 5, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10 }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b6a7a', marginTop: 6 }}>{hechas}/{total} subtareas · click para ver detalle</p>
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
      <button onClick={() => navigate('/crear')} style={nav(actual === 'actividades')}>📋 Actividades</button>
      <button onClick={() => navigate('/progreso')} style={nav(actual === 'progreso')}>📊 Progreso</button>
    </aside>
  )
}

const nav = (activo) => ({ padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem', color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, background: activo ? 'rgba(124,109,250,0.12)' : 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400 })
const labelSeccion = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 10 }