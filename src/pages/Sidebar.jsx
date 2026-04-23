// Sidebar.jsx — Barra lateral fija con navegación principal
export function Sidebar({ navigate, actual }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const nombre = usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Usuario'
  const correo = usuario.correo || ''

  function cerrarSesion() {
    localStorage.removeItem('usuario')
    localStorage.removeItem('demo_logged')
    navigate('/login')
  }

  return (
    <aside style={sidebarStyle}>
      {/* Logo y usuario */}
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: 12 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em', marginBottom: 10 }}>
          🗂️ Planificador
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0eff5' }}>{nombre}</div>
        <div style={{ fontSize: '0.75rem', color: '#8b8a9a', marginTop: 2 }}>{correo}</div>
      </div>

      {/* Navegación */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <NavBtn icon="📅" label="Hoy" active={actual === 'hoy'} onClick={() => navigate('/hoy')} color="#f0a500" />
        <NavBtn icon="📋" label="Actividades" active={actual === 'actividades'} onClick={() => navigate('/actividades')} color="#3bbfa3" />
        <NavBtn icon="✏️" label="Crear actividad" active={actual === 'crear'} onClick={() => navigate('/crear')} color="#a78bfa" />
        <NavBtn icon="📊" label="Progreso" active={actual === 'progreso'} onClick={() => navigate('/progreso')} color="#60a5fa" />
      </nav>

      {/* Cerrar sesión al fondo */}
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a32' }}>
        <button onClick={cerrarSesion} style={logoutStyle}>
          <span style={{ fontSize: '1rem' }}>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

function NavBtn({ icon, label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 12px',
      borderRadius: 10,
      fontSize: '0.9rem',
      fontWeight: active ? 700 : 500,
      color: active ? color : '#9998a8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: active ? `${color}18` : 'transparent',
      border: active ? `1px solid ${color}40` : '1px solid transparent',
      width: '100%',
      textAlign: 'left',
      fontFamily: 'DM Sans, sans-serif',
      transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
    </button>
  )
}

const sidebarStyle = {
  background: '#13131a',
  borderRight: '1px solid #2a2a32',
  padding: '24px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: '220px',
  overflowY: 'auto',
  zIndex: 100,
  boxSizing: 'border-box',
}

const logoutStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.25)',
  borderRadius: 10,
  color: '#f07070',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

export function getHeaders() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  return {
    'Content-Type': 'application/json',
    'X-Usuario-Id': usuario.id || ''
  }
}

export const nav = (activo) => ({
  padding: '10px 12px',
  borderRadius: 10,
  fontSize: '0.9rem',
  color: activo ? '#a78bfa' : '#9998a8',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  background: activo ? 'rgba(167,139,250,0.12)' : 'none',
  border: activo ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: activo ? 700 : 500
})