// Sidebar.jsx — Componente compartido de navegación
export function Sidebar({ navigate, actual }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const nombre = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario'
  const correo = usuario.correo || ''

  function cerrarSesion() {
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <aside style={{ background: '#1a1a1f', borderRight: '1px solid #2a2a32', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: 8 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7c6dfa' }}>📚 Planificador</div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0eff5', marginTop: 4 }}>{nombre}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b6a7a', marginTop: 1 }}>{correo}</div>
      </div>
      <button onClick={() => navigate('/hoy')} style={nav(actual === 'hoy')}>📅 Hoy</button>
      <button onClick={() => navigate('/actividades')} style={nav(actual === 'actividades')}>📋 Actividades</button>
      <button onClick={() => navigate('/progreso')} style={nav(actual === 'progreso')}>📊 Progreso</button>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a32' }}>
        <button onClick={cerrarSesion}
          style={{ width: '100%', padding: '8px 12px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          ↩ Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export function getHeaders() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  return {
    'Content-Type': 'application/json',
    'X-Usuario-Id': usuario.id || ''
  }
}

export const nav = (activo) => ({ padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem', color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, background: activo ? 'rgba(124,109,250,0.12)' : 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400 })