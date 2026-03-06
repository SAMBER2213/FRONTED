import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API } from '../api'

export default function Actividad() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [actividad, setActividad] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [reprogramando, setReprogramando] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevasHoras, setNuevasHoras] = useState('')
  const [conflicto, setConflicto] = useState(null)
  const [avance, setAvance] = useState(null)
  const [nota, setNota] = useState('')
  const LIMITE_HORAS = 6

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const data = await API.getActividad(id)
      if (data.error) { setError('Actividad no encontrada'); return }
      setActividad(data)
    } catch {
      setError('Error al cargar la actividad.')
    }
    setCargando(false)
  }

  function abrirReprogramar(sub) {
    setReprogramando(sub)
    setNuevaFecha(sub.fecha || '')
    setNuevasHoras(sub.horas || '')
    setConflicto(null)
  }

  async function confirmarReprogramacion() {
    const subs = actividad.subtareas || []
    const horasEnFecha = subs.filter(s => s.id !== reprogramando.id && s.fecha === nuevaFecha)
      .reduce((acc, s) => acc + Number(s.horas), 0)
    const total = horasEnFecha + Number(nuevasHoras)
    if (total > LIMITE_HORAS) { setConflicto({ total, limite: LIMITE_HORAS, fecha: nuevaFecha }); return }
    await aplicarReprogramacion()
  }

  async function aplicarReprogramacion() {
    try {
      await API.updateSubtarea(id, reprogramando.id, { fecha: nuevaFecha, horas: Number(nuevasHoras) })
      await cargar()
    } catch { alert('Error al reprogramar.') }
    setReprogramando(null)
    setConflicto(null)
  }

  async function registrarAvance(sub, estado) {
    try {
      await API.updateSubtarea(id, sub.id, { estado, nota })
      await cargar()
    } catch { alert('Error al registrar avance.') }
    setAvance(null)
    setNota('')
  }

  async function eliminarActividad() {
    if (!confirm('¿Seguro que deseas eliminar esta actividad?')) return
    await API.deleteActividad(id)
    navigate('/hoy')
  }

  if (cargando) return <Pantalla><p style={{ color: '#6b6a7a' }}>Cargando actividad...</p></Pantalla>
  if (error) return <Pantalla><p style={{ color: '#f04a4a' }}>⚠️ {error}</p></Pantalla>

  const subtareas = actividad.subtareas || []
  const hechas = subtareas.filter(s => s.estado === 'hecho').length
  const progreso = subtareas.length > 0 ? Math.round((hechas / subtareas.length) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#0f0f11', color: '#f0eff5' }}>
      <Sidebar navigate={navigate} />
      <main style={{ padding: '36px 40px', maxWidth: 720 }}>
        <button onClick={() => navigate('/hoy')} style={{ background: 'none', border: 'none', color: '#6b6a7a', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 20, fontFamily: 'DM Sans, sans-serif' }}>← Volver</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>{actividad.titulo}</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b6a7a' }}>{actividad.tipo} · {actividad.curso} {actividad.fechaLimite ? `· Vence ${actividad.fechaLimite}` : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ background: 'rgba(124,109,250,0.15)', border: '1px solid #7c6dfa', color: '#7c6dfa', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 600 }}>{progreso}% completado</span>
            <button onClick={eliminarActividad} style={{ background: 'none', border: '1px solid #f04a4a', borderRadius: 8, color: '#f04a4a', fontSize: '0.78rem', padding: '4px 10px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Eliminar</button>
          </div>
        </div>

        <div style={{ background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.82rem', color: '#6b6a7a' }}>Progreso</span>
          <div style={{ flex: 1, height: 6, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${progreso}%`, height: '100%', background: '#7c6dfa', borderRadius: 10, transition: 'width 0.4s' }}></div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: '#6b6a7a' }}>{hechas}/{subtareas.length}</span>
        </div>

        {conflicto && (
          <div style={{ background: 'rgba(240,74,74,0.1)', border: '1px solid #f04a4a', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ color: '#f04a4a', fontWeight: 700, marginBottom: 6 }}>⚠️ Conflicto de sobrecarga detectado</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>El día <strong>{conflicto.fecha}</strong> quedaría con <strong>{conflicto.total}h</strong> planificadas, superando el límite de <strong>{conflicto.limite}h/día</strong>.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={aplicarReprogramacion} style={btnSec}>Reprogramar igual</button>
              <button onClick={() => setConflicto(null)} style={btnPri}>Elegir otra fecha</button>
            </div>
          </div>
        )}

        <p style={labelSeccion}>Subtareas del plan</p>
        {subtareas.length === 0 && <div style={{ textAlign: 'center', padding: '32px', color: '#6b6a7a', fontSize: '0.85rem' }}>Esta actividad no tiene subtareas aún.</div>}

        {subtareas.map(sub => (
          <div key={sub.id} style={{ background: '#1a1a1f', border: `1px solid ${sub.estado === 'hecho' ? '#3bbfa3' : '#2a2a32'}`, borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 500, textDecoration: sub.estado === 'hecho' ? 'line-through' : 'none', color: sub.estado === 'hecho' ? '#6b6a7a' : '#f0eff5' }}>{sub.nombre}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 3 }}>{sub.fecha || 'Sin fecha'} · {sub.horas}h {sub.nota && `· 📝 ${sub.nota}`}</div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: sub.estado === 'hecho' ? 'rgba(59,191,163,0.15)' : sub.estado === 'pospuesto' ? 'rgba(240,165,0,0.15)' : 'rgba(107,106,122,0.15)', color: sub.estado === 'hecho' ? '#3bbfa3' : sub.estado === 'pospuesto' ? '#f0a500' : '#6b6a7a' }}>
              {sub.estado === 'hecho' ? 'Hecho' : sub.estado === 'pospuesto' ? 'Pospuesto' : 'Pendiente'}
            </span>
            <button onClick={() => abrirReprogramar(sub)} style={{ background: 'none', border: '1px solid #2a2a32', borderRadius: 8, color: '#6b6a7a', fontSize: '0.78rem', padding: '4px 10px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reprogramar</button>
            {sub.estado !== 'hecho' && (
              <button onClick={() => { setAvance(sub); setNota('') }} style={{ background: 'none', border: '1px solid #7c6dfa', borderRadius: 8, color: '#7c6dfa', fontSize: '0.78rem', padding: '4px 10px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Registrar</button>
            )}
          </div>
        ))}

        {reprogramando && !conflicto && (
          <div style={overlay}>
            <div style={modal}>
              <h3 style={{ marginBottom: 4, fontSize: '1.1rem' }}>Reprogramar subtarea</h3>
              <p style={{ fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 20 }}>{reprogramando.nombre}</p>
              <label style={lbl}>Nueva fecha</label>
              <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} style={{ ...inp, marginBottom: 14 }} />
              <label style={lbl}>Horas estimadas</label>
              <input type="number" value={nuevasHoras} onChange={e => setNuevasHoras(e.target.value)} style={{ ...inp, marginBottom: 20 }} min="0" />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setReprogramando(null)} style={btnSec}>Cancelar</button>
                <button onClick={confirmarReprogramacion} style={btnPri}>Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {avance && (
          <div style={overlay}>
            <div style={modal}>
              <h3 style={{ marginBottom: 4, fontSize: '1.1rem' }}>Registrar avance</h3>
              <p style={{ fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 20 }}>{avance.nombre}</p>
              <label style={lbl}>Nota opcional</label>
              <input placeholder="Ej: Completé los ejercicios 1 al 5" value={nota} onChange={e => setNota(e.target.value)} style={{ ...inp, marginBottom: 20 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setAvance(null)} style={btnSec}>Cancelar</button>
                <button onClick={() => registrarAvance(avance, 'pospuesto')} style={{ ...btnSec, borderColor: '#f0a500', color: '#f0a500' }}>Posponer</button>
                <button onClick={() => registrarAvance(avance, 'hecho')} style={btnPri}>Marcar hecho</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Pantalla({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f11', fontFamily: 'DM Sans, sans-serif' }}>{children}</div>
}

function Sidebar({ navigate }) {
  return (
    <aside style={{ background: '#1a1a1f', borderRight: '1px solid #2a2a32', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid #2a2a32', marginBottom: 8 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#7c6dfa' }}>📚 Planificador</div>
        <div style={{ fontSize: '0.78rem', color: '#6b6a7a', marginTop: 2 }}>Demo · demo@univalle.edu.co</div>
      </div>
      <button onClick={() => navigate('/hoy')} style={nav(false)}>📅 Hoy</button>
      <button onClick={() => navigate('/crear')} style={nav(true)}>📋 Actividades</button>
      <button onClick={() => navigate('/progreso')} style={nav(false)}>📊 Progreso</button>
    </aside>
  )
}

const nav = (activo) => ({ padding: '9px 12px', borderRadius: 10, fontSize: '0.88rem', color: activo ? '#7c6dfa' : '#6b6a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, background: activo ? 'rgba(124,109,250,0.12)' : 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: activo ? 600 : 400 })
const labelSeccion = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 10 }
const lbl = { display: 'block', fontSize: '0.82rem', color: '#6b6a7a', marginBottom: 6 }
const inp = { width: '100%', background: '#0f0f11', border: '1px solid #2a2a32', borderRadius: 10, padding: '10px 14px', color: '#f0eff5', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }
const btnPri = { padding: '9px 20px', background: '#7c6dfa', border: 'none', borderRadius: 10, color: 'white', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }
const btnSec = { padding: '9px 20px', background: 'none', border: '1px solid #2a2a32', borderRadius: 10, color: '#6b6a7a', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal = { background: '#1a1a1f', border: '1px solid #2a2a32', borderRadius: 16, padding: '28px', width: 400 }