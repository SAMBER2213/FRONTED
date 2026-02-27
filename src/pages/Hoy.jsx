import { useNavigate } from 'react-router-dom'

export default function Hoy() {
  const navigate = useNavigate()
  const fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside style={{ background: '#1a1a1f', borderRight: '1px solid #2a2a32', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: '8px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7c6dfa' }}>📚 Planificador</div>
          <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: '2px' }}>
            <span style={{ width: 6, height: 6, background: '#f0a500', borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
            Prototipo· prototipo@univalle.edu.co
          </div>
        </div>

        <button onClick={() => navigate('/hoy')} style={navStyle(true)}>📅 Hoy</button>
        <button onClick={() => navigate('/actividad/1')} style={navStyle(false)}>📋 Actividades</button>
        <button onClick={() => navigate('/progreso')} style={navStyle(false)}>📊 Progreso</button>

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a32' }}>
          <button style={{ width: '100%', padding: '8px 12px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            ↩ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>¿Qué tienes para hoy?</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>{fecha}</p>

        {/* Barra de carga */}
        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>Carga del día</span>
          <div style={{ flex: 1, height: 6, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: '58%', height: '100%', background: '#7c6dfa', borderRadius: 10 }}></div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: '#6b6a7a', whiteSpace: 'nowrap' }}>3.5h / 6h</span>
        </div>

        {/* Urgente */}
        <div style={{ marginBottom: 24 }}>
          <p style={seccionLabel}>🔴 Urgente</p>
          <div style={{ ...tareaCard, borderLeft: '3px solid #f04a4a' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>Revisar notas del parcial</div>
              <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 3 }}>Parcial Cálculo · ¡Vence hoy!</div>
            </div>
            <span style={{ ...chip, background: 'rgba(240,74,74,0.15)', color: '#f04a4a' }}>Urgente</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: '#6b6a7a' }}>1.5h</span>
          </div>
        </div>

        {/* Hacer hoy */}
        <div style={{ marginBottom: 24 }}>
          <p style={seccionLabel}>🟡 Hacer hoy</p>
          <div style={{ ...tareaCard, borderLeft: '3px solid #f0a500' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>Leer capítulo 4 — Algoritmos</div>
              <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 3 }}>Tarea Estructuras · Vence en 2 días</div>
            </div>
            <span style={{ ...chip, background: 'rgba(240,165,0,0.15)', color: '#f0a500' }}>Hoy</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: '#6b6a7a' }}>2h</span>
          </div>
        </div>

        {/* Próximas */}
        <div>
          <p style={seccionLabel}>🔵 Próximas</p>
          <div style={{ ...tareaCard, borderLeft: '3px solid #3bbfa3' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>Preparar diapositivas exposición</div>
              <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 3 }}>Exposición Bases de Datos · Vence en 3 días</div>
            </div>
            <span style={{ ...chip, background: 'rgba(59,191,163,0.15)', color: '#3bbfa3' }}>Próxima</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: '#6b6a7a' }}>—</span>
          </div>
        </div>
      </main>
    </div>
  )
}

const navStyle = (activo) => ({
  padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem',
  color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 9,
  background: activo ? 'rgba(124,109,250,0.12)' : 'none',
  border: 'none', width: '100%', textAlign: 'left',
  fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400
})

const seccionLabel = {
  fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 10
}

const tareaCard = {
  background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 12,
  padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14
}

const chip = {
  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.05em', padding: '3px 9px', borderRadius: 20
}