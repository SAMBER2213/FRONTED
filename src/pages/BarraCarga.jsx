// BarraCarga.jsx — Barra de límite diario compartida + modal de conflicto + configuración
import { useState, useEffect } from 'react'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

function getHeaders() {
  const u = JSON.parse(localStorage.getItem('usuario') || '{}')
  return { 'Content-Type': 'application/json', 'X-Usuario-Id': u.id || '' }
}

// ─── Componente principal ────────────────────────────────────────────────────
export function BarraCarga({ horasDelDia }) {
  const [limite, setLimite] = useState(6)
  const [horasFetch, setHorasFetch] = useState(null)
  const [configurando, setConfigurando] = useState(false)
  const [nuevoLimite, setNuevoLimite] = useState('')
  const [errorInput, setErrorInput] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  const hoy = new Date().toISOString().slice(0, 10)

  useEffect(() => { fetchCarga() }, [])

  async function fetchCarga() {
    try {
      const res = await fetch(`${BASE_URL}/api/carga/${hoy}/`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setHorasFetch(data.horasPlanificadas)
        setLimite(data.limiteDiario)
      }
    } catch { /* silencioso */ }
  }

  async function guardarLimite() {
    const val = parseFloat(nuevoLimite)
    if (!nuevoLimite || isNaN(val)) { setErrorInput('Ingresa un número válido'); return }
    if (val < 1 || val > 16) { setErrorInput('Debe estar entre 1 y 16 horas'); return }
    setGuardando(true)
    setErrorInput('')
    try {
      const res = await fetch(`${BASE_URL}/api/limite/`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ limiteDiario: val })
      })
      if (res.ok) {
        setLimite(val)
        setHorasFetch(prev => prev) // reuse fetched value
        setOk(true)
        setTimeout(() => { setOk(false); setConfigurando(false); setNuevoLimite('') }, 1200)
      } else {
        const d = await res.json()
        setErrorInput(d.campos?.limiteDiario || 'Error al guardar')
      }
    } catch { setErrorInput('No se pudo guardar. Revisa tu conexión.') }
    setGuardando(false)
  }

  // Usa el prop si lo pasan (Hoy.jsx ya tiene los datos), sino usa el fetch propio
  const horas = horasDelDia ?? horasFetch ?? 0
  const porcentaje = Math.min((horas / limite) * 100, 100)
  const excede = horas > limite
  const casiLleno = !excede && (limite - horas) <= 1.5
  const color = excede ? '#f04a4a' : casiLleno ? '#f0a500' : '#3bbfa3'

  return (
    <>
      <div style={{ background: '#1a1a24', border: `1px solid ${excede ? 'rgba(240,74,74,0.4)' : '#2a2a32'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9998a8' }}>
              Carga de hoy
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color }}>
              {horas}h / {limite}h
            </span>
            {excede && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(240,74,74,0.15)', color: '#f04a4a', padding: '2px 8px', borderRadius: 20 }}>
                ⚠ Sobrecargado
              </span>
            )}
          </div>
          <button
            onClick={() => { setConfigurando(true); setNuevoLimite(String(limite)); setErrorInput(''); setOk(false) }}
            title="Configurar límite diario"
            style={btnEngranaje}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9998a8'; e.currentTarget.style.borderColor = '#2a2a38' }}
          >
            <IconEngranaje size={13} />
            Configurar límite diario
          </button>
        </div>

        <div style={{ background: '#0f0f15', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${porcentaje}%`, background: color, borderRadius: 99, transition: 'width 0.4s ease, background 0.3s' }} />
        </div>

        {excede && (
          <p style={{ fontSize: '0.78rem', color: '#f07070', marginTop: 8, fontWeight: 500 }}>
            Tienes {horas}h planificadas hoy, {(horas - limite).toFixed(1)}h por encima de tu límite de {limite}h.
          </p>
        )}
      </div>

      {/* Modal configurar límite */}
      {configurando && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#f0eff5', marginBottom: 6 }}>Configurar límite diario</p>
            <p style={{ fontSize: '0.82rem', color: '#8b8a9a', marginBottom: 20, lineHeight: 1.5 }}>
              Define cuántas horas al día quieres dedicar como máximo. El sistema te avisará si lo superas al planificar.
            </p>
            <label style={lbl}>Horas por día (entre 1 y 16)</label>
            <input
              type="number" min="1" max="16" step="0.5"
              value={nuevoLimite}
              onChange={e => { setNuevoLimite(e.target.value); setErrorInput('') }}
              onKeyDown={e => e.key === 'Enter' && guardarLimite()}
              autoFocus
              style={{ ...inp, borderColor: errorInput ? '#f04a4a' : '#2a2a38', marginBottom: errorInput ? 6 : 18 }}
            />
            {errorInput && <p style={{ fontSize: '0.78rem', color: '#f07070', marginBottom: 14 }}>{errorInput}</p>}
            {ok && <p style={{ fontSize: '0.82rem', color: '#3bbfa3', marginBottom: 14, fontWeight: 600 }}>✓ Límite actualizado</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setConfigurando(false); setNuevoLimite(''); setErrorInput('') }}
                style={btnSec}>Cancelar</button>
              <button onClick={guardarLimite} disabled={guardando}
                style={{ ...btnPri, opacity: guardando ? 0.7 : 1 }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Modal de conflicto flotante (se usa desde Actividad.jsx) ────────────────
export function ModalConflicto({ conflicto, nuevasHoras, onElgirFecha, onAjustarHoras, onGuardarIgual }) {
  if (!conflicto) return null
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, borderColor: 'rgba(240,74,74,0.5)', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#f04a4a' }}>Ese día quedaría sobrecargado</p>
        </div>
        <div style={{ background: 'rgba(240,74,74,0.08)', border: '1px solid rgba(240,74,74,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: '0.9rem', color: '#f0eff5', fontWeight: 600, marginBottom: 4 }}>
            Quedarías con <span style={{ color: '#f04a4a' }}>{conflicto.total}h planificadas</span> (límite {conflicto.limite}h)
          </p>
          <p style={{ fontSize: '0.8rem', color: '#9998a8' }}>
            Ya tienes {conflicto.horasActuales}h en ese día · Esta tarea suma {nuevasHoras}h más
          </p>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#9998a8', marginBottom: 16 }}>¿Qué quieres hacer?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onElgirFecha} style={btnOpcion('#a78bfa', 'rgba(167,139,250,0.12)', 'rgba(167,139,250,0.4)')}>
            📅 Mover a otro día
          </button>
          <button onClick={onAjustarHoras} style={btnOpcion('#60a5fa', 'rgba(96,165,250,0.1)', 'rgba(96,165,250,0.3)')}>
            ✏️ Reducir las horas
          </button>
          <button onClick={onGuardarIgual} style={btnOpcion('#f07070', 'rgba(240,74,74,0.08)', 'rgba(240,74,74,0.3)')}>
            🚀 Guardar igual
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Función utilitaria para verificar conflicto ────────────────────────────
export async function verificarConflicto(fecha, horasSubtarea, excluirSubtareaId = '') {
  const u = JSON.parse(localStorage.getItem('usuario') || '{}')
  const headers = { 'Content-Type': 'application/json', 'X-Usuario-Id': u.id || '' }
  try {
    const params = excluirSubtareaId ? `?excluir_subtarea=${excluirSubtareaId}` : ''
    const res = await fetch(`${BASE_URL}/api/carga/${fecha}/${params}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    const totalConNueva = Math.round((data.horasPlanificadas + parseFloat(horasSubtarea)) * 100) / 100
    return {
      horasActuales: data.horasPlanificadas,
      limiteDiario: data.limiteDiario,
      totalConNueva,
      hayConflicto: totalConNueva > data.limiteDiario,
    }
  } catch { return null }
}

// ─── Estilos compartidos ─────────────────────────────────────────────────────
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' }
const modalStyle = { background: '#1a1a24', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 18, padding: '28px', width: '90%', maxWidth: 380, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }
const btnEngranaje = { background: 'none', border: '1px solid #2a2a38', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#9998a8', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }
const lbl = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9998a8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }
const inp = { width: '100%', background: '#0f0f15', border: '1px solid #2a2a38', borderRadius: 10, padding: '11px 14px', color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }
const btnPri = { flex: 1, padding: '10px', background: '#a78bfa', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 700 }
const btnSec = { flex: 1, padding: '10px', background: 'none', border: '1px solid #2a2a38', borderRadius: 10, color: '#9998a8', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 600 }
const btnOpcion = (color, bg, border) => ({ width: '100%', padding: '12px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 10, color, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', transition: 'opacity 0.15s' })

function IconEngranaje({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}