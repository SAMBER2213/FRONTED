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
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: 12 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconGrid color="#a78bfa" size={18} />
          Planificador
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0eff5' }}>{nombre}</div>
        <div style={{ fontSize: '0.75rem', color: '#8b8a9a', marginTop: 2 }}>{correo}</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <NavBtn icon={<IconCalendar color="#f0a500" size={17} />} label="Hoy" active={actual === 'hoy'} onClick={() => navigate('/hoy')} color="#f0a500" />
        <NavBtn icon={<IconList color="#3bbfa3" size={17} />} label="Actividades" active={actual === 'actividades'} onClick={() => navigate('/actividades')} color="#3bbfa3" />
        <NavBtn icon={<IconPlus color="#a78bfa" size={17} />} label="Crear actividad" active={actual === 'crear'} onClick={() => navigate('/crear')} color="#a78bfa" />
        <NavBtn icon={<IconChart color="#60a5fa" size={17} />} label="Progreso" active={actual === 'progreso'} onClick={() => navigate('/progreso')} color="#60a5fa" />
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #2a2a32' }}>
        <button onClick={cerrarSesion} style={logoutStyle}>
          <IconLogout color="#f07070" size={16} />
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
      {icon}
      {label}
    </button>
  )
}

function IconCalendar({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function IconList({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function IconPlus({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
}

function IconChart({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}

function IconGrid({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconLogout({ color, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
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