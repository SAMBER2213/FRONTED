// Crear.jsx — Crear nueva actividad evaluativa
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

function HoraPicker({ value, onChange }) {
  const parse = (v) => {
    if (!v) return { h: '08', m: '00', ampm: 'AM' }
    const [h, m] = v.split(':')
    const n = parseInt(h)
    return { h: String(n > 12 ? n - 12 : n === 0 ? 12 : n).padStart(2, '0'), m, ampm: n >= 12 ? 'PM' : 'AM' }
  }
  const [hora, setHora] = useState(() => parse(value))

  function emitir(next) {
    let h24 = parseInt(next.h)
    if (next.ampm === 'AM') { if (h24 === 12) h24 = 0 }
    else { if (h24 !== 12) h24 += 12 }
    onChange(`${String(h24).padStart(2, '0')}:${next.m}`)
  }

  function update(field, val) {
    const next = { ...hora, [field]: val }
    setHora(next)
    emitir(next)
  }

  const horas = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutos = ['00', '15', '30', '45']

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <select value={hora.h} onChange={e => update('h', e.target.value)} style={selStyle}>
        {horas.map(h => <option key={h}>{h}</option>)}
      </select>
      <span style={{ color: '#9998a8', fontWeight: 700 }}>:</span>
      <select value={hora.m} onChange={e => update('m', e.target.value)} style={selStyle}>
        {minutos.map(m => <option key={m}>{m}</option>)}
      </select>
      <div style={{ display: 'flex', background: '#0f0f15', border: '1px solid #2a2a38', borderRadius: 8, overflow: 'hidden' }}>
        {['AM', 'PM'].map(p => (
          <button key={p} onClick={() => update('ampm', p)} type="button"
            style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 700, background: hora.ampm === p ? '#a78bfa' : 'transparent', color: hora.ampm === p ? 'white' : '#6b6a7a', transition: 'all 0.15s' }}>
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

const selStyle = { background: '#0f0f15', border: '1px solid #2a2a38', borderRadius: 8, padding: '8px 12px', color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }

function formatHora12(hora24) {
  if (!hora24) return ''
  const [h, m] = hora24.split(':')
  const n = parseInt(h)
  const ampm = n >= 12 ? 'PM' : 'AM'
  const h12 = n > 12 ? n - 12 : n === 0 ? 12 : n
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`
}

function DateInput({ value, onChange, style }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <style>{`
        .date-custom::-webkit-calendar-picker-indicator { opacity: 0; width: 28px; cursor: pointer; position: absolute; right: 0; }
        .date-custom::-webkit-inner-spin-button { display: none; }
      `}</style>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="date-custom"
        style={{ ...style, paddingRight: 38, colorScheme: 'dark', width: '100%' }}
      />
      <span style={{ position: 'absolute', right: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
    </div>
  )
}

export default function Crear() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ titulo: '', tipo: '', curso: '', fechaLimite: '', horasEstimadas: '' })
  const [subtareas, setSubtareas] = useState([])
  const [nuevaSub, setNuevaSub] = useState({ nombre: '', fecha: '', hora: '', horas: '' })
  const [errores, setErrores] = useState({})
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState(null)

  const tipos = ['Examen', 'Quiz', 'Taller', 'Proyecto', 'Otro']

  function validar() {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio'
    if (!form.tipo) e.tipo = 'Selecciona un tipo'
    if (!form.curso.trim()) e.curso = 'El curso es obligatorio'
    if (!form.fechaLimite) e.fechaLimite = 'La fecha límite es obligatoria'
    return e
  }

  async function guardar() {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    setCargando(true)
    setErrorGeneral(null)
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ titulo: form.titulo, tipo: form.tipo, curso: form.curso, fechaLimite: form.fechaLimite, horasEstimadas: Number(form.horasEstimadas) || 0 })
      })
      const data = await res.json()
      if (!res.ok) { setErrores(data.campos || {}); setErrorGeneral(data.error || 'Error al guardar'); setCargando(false); return }
      for (const sub of subtareas) {
        await fetch(`${BASE_URL}/api/actividades/${data.id}/subtareas/`, {
          method: 'POST', headers: getHeaders(),
          body: JSON.stringify({ nombre: sub.nombre, fecha: sub.fecha, hora: sub.hora || '', horas: Number(sub.horas) })
        })
      }
      setExito(true)
      setTimeout(() => navigate('/hoy'), 1500)
    } catch (err) { setErrorGeneral('Error de conexión: ' + err.message) }
    setCargando(false)
  }

  function agregarSubtarea() {
    const e = {}
    if (!nuevaSub.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!nuevaSub.horas || Number(nuevaSub.horas) <= 0) e.horas = 'Las horas deben ser mayor a 0'
    if (Object.keys(e).length > 0) { setErrores(e); return }
    setSubtareas([...subtareas, { ...nuevaSub, id: Date.now() }])
    setNuevaSub({ nombre: '', fecha: '', hora: '', horas: '' })
    setErrores({})
  }

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="crear" />
      <main style={mainStyle}>
        {/* Encabezado */}
        <div style={{ width: '100%', maxWidth: 640, marginBottom: 28 }}>
          <button onClick={() => navigate(-1)} style={btnVolver}>← Volver</button>
          <h2 style={tituloPagina}>Crear actividad</h2>
          <p style={subtituloPagina}>Ingresa los datos de tu actividad evaluativa</p>
        </div>

        <div style={{ width: '100%', maxWidth: 640 }}>
          {exito && (
            <div style={alertaExito}>✅ Actividad creada exitosamente. Redirigiendo...</div>
          )}
          {errorGeneral && (
            <div style={alertaError}>⚠️ {errorGeneral}</div>
          )}

          {/* Info actividad */}
          <div style={seccionCard}>
            <p style={labelSeccion}>📝 Información de la actividad</p>
            <Campo label="Título *" error={errores.titulo}>
              <input style={inputStyle(errores.titulo)} placeholder="Ej: Parcial de Cálculo"
                value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </Campo>
            <Campo label="Tipo *" error={errores.tipo}>
              <select style={inputStyle(errores.tipo)} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="">Selecciona un tipo</option>
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Campo>
            <Campo label="Curso *" error={errores.curso}>
              <input style={inputStyle(errores.curso)} placeholder="Ej: Cálculo Diferencial"
                value={form.curso} onChange={e => setForm({ ...form, curso: e.target.value })} />
            </Campo>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Campo label="Fecha límite *" error={errores.fechaLimite}>
                <DateInput style={inputStyle(errores.fechaLimite)} value={form.fechaLimite}
                  onChange={e => setForm({ ...form, fechaLimite: e.target.value })} />
              </Campo>
              <Campo label="⏱ Horas estimadas">
                <input type="number" style={inputStyle()} placeholder="Ej: 4" min="0"
                  value={form.horasEstimadas} onChange={e => setForm({ ...form, horasEstimadas: e.target.value })} />
              </Campo>
            </div>
          </div>

          {/* Subtareas */}
          <div style={seccionCard}>
            <p style={labelSeccion}>📌 Subtareas del plan inicial</p>

            {/* Vacío: botón centrado */}
            {subtareas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: '#8b8a9a', fontSize: '0.88rem' }}>
                <p style={{ marginBottom: 16 }}>No hay subtareas. Agrega al menos una.</p>
              </div>
            )}

            {subtareas.map((s, i) => (
              <div key={s.id} style={tarjetaSub}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0eff5' }}>{s.nombre}</p>
                  <p style={{ fontSize: '0.75rem', color: '#8b8a9a', marginTop: 2 }}>
                    {s.fecha ? `📅 ${s.fecha}` : 'Sin fecha'}{s.hora ? ` · ${formatHora12(s.hora)}` : ''} · ⏱ {s.horas}h
                  </p>
                </div>
                <button onClick={() => setSubtareas(subtareas.filter((_, j) => j !== i))}
                  style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid rgba(240,74,74,0.2)', borderRadius: 7, padding: '4px 10px', color: '#f07070', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  Eliminar
                </button>
              </div>
            ))}

            {/* Formulario nueva subtarea */}
            <div style={{ borderTop: '1px solid #2a2a38', marginTop: 16, paddingTop: 18 }}>
              <p style={{ fontSize: '0.78rem', color: '#8b8a9a', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nueva subtarea</p>
              <Campo error={errores.nombre}>
                <input style={inputStyle(errores.nombre)} placeholder="Nombre de la subtarea"
                  value={nuevaSub.nombre} onChange={e => setNuevaSub({ ...nuevaSub, nombre: e.target.value })} />
              </Campo>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
                <Campo label="Fecha">
                  <DateInput style={inputStyle()} value={nuevaSub.fecha}
                    onChange={e => setNuevaSub({ ...nuevaSub, fecha: e.target.value })} />
                </Campo>
                <Campo label="Horas de estudio" error={errores.horas}>
                  <input type="number" style={inputStyle(errores.horas)} placeholder="Ej: 2" min="0"
                    value={nuevaSub.horas} onChange={e => setNuevaSub({ ...nuevaSub, horas: e.target.value })} />
                </Campo>
              </div>
              {nuevaSub.fecha && (
                <Campo label="Hora (opcional)">
                  <HoraPicker value={nuevaSub.hora} onChange={v => setNuevaSub({ ...nuevaSub, hora: v })} />
                </Campo>
              )}
              <button onClick={agregarSubtarea} style={btnAgregar}>
                ＋ Agregar subtarea
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate(-1)} style={btnCancelar}>Cancelar</button>
            <button onClick={guardar} disabled={cargando} style={btnGuardar(cargando)}>
              {cargando ? 'Guardando...' : '💾 Guardar actividad'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: '0.82rem', color: '#8b8a9a', fontWeight: 600, marginBottom: 6 }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#f07070', marginTop: 4, fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

// ─── Estilos ─────────────────────────────────────────────────
const layoutBase = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: 'DM Sans, sans-serif',
  background: '#0f0f15',
  color: '#f0eff5',
}

const mainStyle = {
  marginLeft: '220px',
  flex: 1,
  padding: '40px 32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const tituloPagina = { fontSize: '1.6rem', fontWeight: 800, color: '#f0eff5', letterSpacing: '-0.02em', marginBottom: 4 }
const subtituloPagina = { fontSize: '0.88rem', color: '#8b8a9a' }

const btnVolver = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: '#1e1e2a',
  border: '2px solid #3a3a50',
  borderRadius: 10,
  color: '#d0cfdf',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  marginBottom: 16,
  letterSpacing: '0.01em',
}

const seccionCard = {
  background: '#1a1a24',
  border: '1px solid #2a2a38',
  borderRadius: 16,
  padding: '24px',
  marginBottom: 20,
}

const labelSeccion = {
  fontSize: '0.78rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#8b8a9a',
  marginBottom: 18,
}

const inputStyle = (error) => ({
  width: '100%',
  background: '#0f0f15',
  border: `1px solid ${error ? '#f04a4a' : '#2a2a38'}`,
  borderRadius: 10,
  padding: '11px 14px',
  color: '#f0eff5',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.92rem',
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
})

const tarjetaSub = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  background: '#0f0f15',
  border: '1px solid #2a2a38',
  borderRadius: 10,
  padding: '10px 14px',
  marginBottom: 8,
}

const alertaExito = {
  background: 'rgba(59,191,163,0.12)',
  border: '1px solid #3bbfa3',
  borderRadius: 12,
  padding: '12px 18px',
  marginBottom: 20,
  color: '#3bbfa3',
  fontSize: '0.9rem',
  fontWeight: 600,
}

const alertaError = {
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.4)',
  borderRadius: 12,
  padding: '12px 18px',
  marginBottom: 20,
  color: '#f07070',
  fontSize: '0.9rem',
  fontWeight: 600,
}

const btnAgregar = {
  marginTop: 8,
  padding: '9px 18px',
  background: 'rgba(167,139,250,0.12)',
  border: '1px solid rgba(167,139,250,0.4)',
  borderRadius: 9,
  color: '#a78bfa',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnCancelar = {
  padding: '12px 24px',
  background: '#1e1e2a',
  border: '2px solid #3a3a50',
  borderRadius: 11,
  color: '#d0cfdf',
  fontSize: '0.92rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnGuardar = (disabled) => ({
  padding: '12px 28px',
  background: disabled ? '#4a4060' : '#a78bfa',
  border: 'none',
  borderRadius: 11,
  color: 'white',
  fontSize: '0.92rem',
  fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'DM Sans, sans-serif',
})