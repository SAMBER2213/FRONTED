// BarraCarga.jsx — Barra de límite diario con configuración y conflicto
import { useState, useEffect } from 'react'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

function getHeaders() {
  const u = JSON.parse(localStorage.getItem('usuario') || '{}')
  return { 'Content-Type': 'application/json', 'X-Usuario-Id': u.id || '' }
}

export function BarraCarga({ fecha, horasDelDia }) {
  const [limite, setLimite] = useState(6)
  const [horasFetch, setHorasFetch] = useState(null)
  const [configurando, setConfigurando] = useState(false)
  const [nuevoLimite, setNuevoLimite] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  const fechaEfectiva = fecha || new Date().toISOString().slice(0, 10)

  useEffect(() => { cargarLimite() }, [])
  useEffect(() => {
    // Si horasDelDia no viene como prop, las buscamos
    if (horasDelDia === undefined || horasDelDia === null) {
      fetchCarga()
    }
  }, [fechaEfectiva, horasDelDia])

  async function cargarLimite() {
    try {
      const res = await fetch(`${BASE_URL}/api/limite/`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setLimite(data.limiteDiario)
      }
    } catch { /* silencioso */ }
  }

  async function fetchCarga() {
    try {
      const res = await fetch(`${BASE_URL}/api/carga/${fechaEfectiva}/`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setHorasFetch(data.horasPlanificadas)
        setLimite(data.limiteDiario)
      }
    } catch { /* silencioso */ }
  }

  async function guardarLimite() {
    const val = parseFloat(nuevoLimite)
    if (!nuevoLimite || isNaN(val)) { setError('Ingresa un número'); return }
    if (val < 1 || val > 16) { setError('Debe estar entre 1 y 16 horas'); return }
    setGuardando(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/api/limite/`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ limiteDiario: val })
      })
      if (res.ok) {
        setLimite(val)
        setOk(true)
        setTimeout(() => { setOk(false); setConfigurando(false); setNuevoLimite('') }, 1200)
      } else {
        const d = await res.json()
        setError(d.campos?.limiteDiario || 'Error al guardar')
      }
    } catch { setError('No se pudo guardar. Revisa tu conexión.') }
    setGuardando(false)
  }

  const horas = horasDelDia ?? horasFetch ?? 0
  const porcentaje = Math.min((horas / limite) * 100, 100)
  const excede = horas > limite
  const sobrasPoco = !excede && (limite - horas) <= 1.5
  const color = excede ? '#f04a4a' : sobrasPoco ? '#f0a500' : '#3bbfa3'
  const labelFecha = fecha ? formatearFecha(fecha) : 'hoy'

  return (
    <div style={{ background: '#1a1a24', border: `1px solid ${excede ? 'rgba(240,74,74,0.4)' : '#2a2a32'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9998a8' }}>
            Carga de {labelFecha}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>
            {horas}h / {limite}h
          </span>
          {excede && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(240,74,74,0.15)', color: '#f04a4a', padding: '2px 8px', borderRadius: 20 }}>
              ⚠ Sobrecargado
            </span>
          )}
        </div>
        {/* Botón engranaje */}
        <button
          title="Configurar límite diario"
          onClick={() => { setConfigurando(true); setNuevoLimite(String(limite)); setError(''); setOk(false) }}
          style={{ background: 'none', border: '1px solid #2a2a38', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#9998a8', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9998a8'; e.currentTarget.style.borderColor = '#2a2a38' }}
        >
          <IconEngranaje size={14} />
          Configurar límite diario
        </button>
      </div>

      {/* Barra de progreso */}
      <div style={{ background: '#0f0f15', borderRadius: 99, height: 8, overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', width: `${porcentaje}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease, background 0.3s' }} />
        {excede && (
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${Math.min(((horas - limite) / limite) * 100, 30)}%`, background: 'rgba(240,74,74,0.35)', borderRadius: '0 99px 99px 0' }} />
        )}
      </div>

      {excede && (
        <p style={{ fontSize: '0.78rem', color: '#f07070', marginTop: 8, fontWeight: 600 }}>
          Tienes {horas}h planificadas pero tu límite es {limite}h. Considera mover o reducir alguna tarea.
        </p>
      )}

      {/* Modal configurar límite */}
      {configurando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a24', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 18, padding: '28px', width: 360, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#f0eff5', marginBottom: 6 }}>Configurar límite diario</p>
            <p style={{ fontSize: '0.82rem', color: '#8b8a9a', marginBottom: 20 }}>
              Cuántas horas al día quieres dedicar como máximo a tus tareas. El sistema te avisará si lo superas.
            </p>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9998a8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Horas por día (1–16)
            </label>
            <input
              type="number" min="1" max="16" step="0.5"
              value={nuevoLimite}
              onChange={e => { setNuevoLimite(e.target.value); setError('') }}
              style={{ width: '100%', background: '#0f0f15', border: `1px solid ${error ? '#f04a4a' : '#2a2a38'}`, borderRadius: 10, padding: '11px 14px', color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: error ? 6 : 18 }}
              onKeyDown={e => e.key === 'Enter' && guardarLimite()}
              autoFocus
            />
            {error && <p style={{ fontSize: '0.78rem', color: '#f07070', marginBottom: 14 }}>{error}</p>}
            {ok && <p style={{ fontSize: '0.82rem', color: '#3bbfa3', marginBottom: 14, fontWeight: 600 }}>✓ Límite actualizado correctamente</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfigurando(false); setNuevoLimite(''); setError('') }}
                style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid #2a2a38', borderRadius: 10, color: '#9998a8', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={guardarLimite} disabled={guardando}
                style={{ flex: 1, padding: '10px', background: '#a78bfa', border: 'none', borderRadius: 10, color: 'white', cursor: guardando ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 700, opacity: guardando ? 0.7 : 1 }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para obtener límite y carga de una fecha específica (usado al reprogramar)
export async function verificarConflicto(fecha, horasSubtarea, excluirSubtareaId = '') {
  const u = JSON.parse(localStorage.getItem('usuario') || '{}')
  const headers = { 'Content-Type': 'application/json', 'X-Usuario-Id': u.id || '' }
  try {
    const params = excluirSubtareaId ? `?excluir_subtarea=${excluirSubtareaId}` : ''
    const res = await fetch(`${BASE_URL}/api/carga/${fecha}/${params}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    const totalConNueva = data.horasPlanificadas + parseFloat(horasSubtarea)
    return {
      horasActuales: data.horasPlanificadas,
      limiteDiario: data.limiteDiario,
      totalConNueva: Math.round(totalConNueva * 100) / 100,
      hayConflicto: totalConNueva > data.limiteDiario,
      subtareasExistentes: data.subtareas,
    }
  } catch { return null }
}

function formatearFecha(fecha) {
  const hoy = new Date().toISOString().slice(0, 10)
  if (fecha === hoy) return 'hoy'
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function IconEngranaje({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}