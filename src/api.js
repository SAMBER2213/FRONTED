export const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export function getUsuario() {
  try {
    const u = localStorage.getItem('usuario')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

export function getHeaders() {
  const usuario = getUsuario()
  return {
    'Content-Type': 'application/json',
    'X-Usuario-Id': usuario?.id || '',
  }
}

export function cerrarSesion(navigate) {
  localStorage.removeItem('usuario')
  navigate('/login')
}