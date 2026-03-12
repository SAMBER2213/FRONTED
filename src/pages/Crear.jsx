import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

function HoraPicker({ value, onChange }) {
  const [hora, setHora] = useState(() => {
    if (!value) return { h: '08', m: '00', ampm: 'AM' }
    const [h, m] = value.split(':')
    const n = parseInt(h)
    return { h: String(n > 12 ? n - 12 : n === 0 ? 12 : n).padStart(2, '0'), m, ampm: n >= 12 ? 'PM' : 'AM' }
  })

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
      {/* Hora */}
      <select value={hora.h} onChange={e => update('h', e.target.value)} style={selStyle}>
        {horas.map(h => <option key={h}>{h}</option>)}
      </select>
      <span style={{ color: '#6b6a7a', fontWeight: 700 }}>:</span>
      {/* Minutos */}
      <select value={hora.m} onChange={e => update('m', e.target.value)} style={selStyle}>
        {minutos.map(m => <option key={m}>{m}</option>)}
      </select>
      {/* AM/PM */}
      <div style={{ display: 'flex', background: '#0f0f11', border: '1px solid #2a2a32', borderRadius: 8, overflow: 'hidden' }}>
        {['AM', 'PM'].map(p => (
          <button key={p} onClick={() => update('ampm', p)} type="button"
            style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 700, background: hora.ampm === p ? '#7c6dfa' : 'transparent', color: hora.ampm === p ? 'white' : '#6b6a7a', transition: 'all 0.15s' }}>
            {p}
          </button>
        ))}
      </div>
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
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} actual="crear" />
      <main style={{ padding: '36px 40px', maxWidth: 680 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Crear actividad</h2>
        <p style={{ fontSize: '0.85rem', color: '#6b6a7a', marginBottom: 28 }}>Ingresa los datos de tu actividad evaluativa</p>

        {exito && <div style={{ background: 'rgba(59,191,163,0.15)', border: '1px solid #3bbfa3', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#3bbfa3', fontSize: '0.88rem' }}>✅ Actividad creada exitosamente. Redirigiendo...</div>}
        {errorGeneral && <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#f04a4a', fontSize: '0.88rem' }}>⚠️ {errorGeneral}</div>}

        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
          <p style={labelSeccion}>Información de la actividad</p>
          <Campo label="Título *" error={errores.titulo}>
            <input style={inputStyle(errores.titulo)} placeholder="Ej: Parcial de Cálculo" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
          </Campo>
          <Campo label="Tipo *" error={errores.tipo}>
            <select style={inputStyle(errores.tipo)} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="">Selecciona un tipo</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Campo>
          <Campo label="Curso *" error={errores.curso}>
            <input style={inputStyle(errores.curso)} placeholder="Ej: Cálculo Diferencial" value={form.curso} onChange={e => setForm({ ...form, curso: e.target.value })} />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Campo label="Fecha límite">
              <input type="date" style={inputStyle()} value={form.fechaLimite} onChange={e => setForm({ ...form, fechaLimite: e.target.value })} />
            </Campo>
            <Campo label="Horas estimadas">
              <input type="number" style={inputStyle()} placeholder="Ej: 4" min="0" value={form.horasEstimadas} onChange={e => setForm({ ...form, horasEstimadas: e.target.value })} />
            </Campo>
          </div>
        </div>

        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
          <p style={labelSeccion}>Subtareas del plan inicial</p>
          {subtareas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6b6a7a', fontSize: '0.85rem' }}>No hay subtareas aún. Agrega al menos una.</div>
          )}
          {subtareas.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0f0f11', border: '1px solid #2a2a32', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b6a7a' }}>
                  {s.fecha || 'Sin fecha'}{s.hora ? ` · ${formatHora12(s.hora)}` : ''} · {s.horas}h
                </div>
              </div>
              <button onClick={() => setSubtareas(subtareas.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f04a4a', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #2a2a32', marginTop: 16, paddingTop: 16 }}>
            <p style={{ fontSize: '0.78rem', color: '#6b6a7a', marginBottom: 12 }}>Nueva subtarea</p>
            <Campo error={errores.nombre}>
              <input style={inputStyle(errores.nombre)} placeholder="Nombre de la subtarea"
                value={nuevaSub.nombre} onChange={e => setNuevaSub({ ...nuevaSub, nombre: e.target.value })} />
            </Campo>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Campo label="Fecha">
                <input type="date" style={inputStyle()} value={nuevaSub.fecha} onChange={e => setNuevaSub({ ...nuevaSub, fecha: e.target.value, hora: nuevaSub.hora || '08:00' })} />
              </Campo>
              <Campo label="Horas de estudio" error={errores.horas}>
                <input type="number" style={inputStyle(errores.horas)} placeholder="Ej: 2" min="0"
                  value={nuevaSub.horas} onChange={e => setNuevaSub({ ...nuevaSub, horas: e.target.value })} />
              </Campo>
            </div>
            {nuevaSub.fecha && (
              <Campo label="Hora (opcional)">
                <HoraPicker value={nuevaSub.hora} onChange={h => setNuevaSub({ ...nuevaSub, hora: h })} />
              </Campo>
            )}
            <button onClick={agregarSubtarea} style={{ marginTop: 8, padding: '8px 16px', background: 'rgba(124,109,250,0.15)', border: '1px solid #7c6dfa', borderRadius: 8, color: '#7c6dfa', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              + Agregar subtarea
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/hoy')} style={{ padding: '11px 24px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
          <button onClick={guardar} disabled={cargando} style={{ padding: '11px 24px', background: cargando ? '#4a4060' : '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: cargando ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {cargando ? 'Guardando...' : 'Guardar actividad'}
          </button>
        </div>
      </main>
    </div>
  )
}

function formatHora12(hora24) {
  if (!hora24) return ''
  const [h, m] = hora24.split(':')
  const n = parseInt(h)
  const ampm = n >= 12 ? 'PM' : 'AM'
  const h12 = n > 12 ? n - 12 : n === 0 ? 12 : n
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`
}

function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 6 }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#f04a4a', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

const labelSeccion = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 16 }
const inputStyle = (error) => ({ width: '100%', background: '#0f0f11', border: `1px solid ${error ? '#f04a4a' : '#2a2a32'}`, borderRadius: 10, padding: '10px 14px', color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' })
const selStyle = { background: '#0f0f11', border: '1px solid #2a2a32', borderRadius: 8, padding: '8px 12px', color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }