import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sidebar, getHeaders } from './Sidebar'
import { BarraCarga, ModalConflicto, verificarConflicto } from './BarraCarga'

const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

function HoraPicker({ value, onChange }) {
  const parse = (v) => {
    if (!v) return { h: '08', m: '00', ampm: 'AM' }
    const [h, m] = v.split(':')
    const n = parseInt(h)
    return {
      h: String(n > 12 ? n - 12 : n === 0 ? 12 : n).padStart(2, '0'),
      m,
      ampm: n >= 12 ? 'PM' : 'AM',
    }
  }

  const [hora, setHora] = useState(() => parse(value))

  function emitir(next) {
    let h24 = parseInt(next.h)

    if (next.ampm === 'AM') {
      if (h24 === 12) h24 = 0
    } else {
      if (h24 !== 12) h24 += 12
    }

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
          <button
            key={p}
            onClick={() => update('ampm', p)}
            type="button"
            style={{
              padding: '8px 12px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: hora.ampm === p ? '#a78bfa' : 'transparent',
              color: hora.ampm === p ? 'white' : '#6b6a7a',
              transition: 'all 0.15s',
            }}
          >
            {p}
          </button>
        ))}
      </div>
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

function DateInput({ value, onChange, style }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <style>{`
        .date-custom::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 28px;
          cursor: pointer;
          position: absolute;
          right: 0;
        }

        .date-custom::-webkit-inner-spin-button {
          display: none;
        }
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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </span>
    </div>
  )
}

export default function Actividad() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [actividad, setActividad] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [reprogramando, setReprogramando] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')
  const [nuevasHoras, setNuevasHoras] = useState('')
  const [errorReprogramar, setErrorReprogramar] = useState('')

  const [conflicto, setConflicto] = useState(null)
  const [modoConflicto, setModoConflicto] = useState(null)

  const [avance, setAvance] = useState(null)
  const [nota, setNota] = useState('')

  const [agregando, setAgregando] = useState(false)
  const [nuevaSub, setNuevaSub] = useState({ nombre: '', fecha: '', hora: '', horas: '' })
  const [erroresSub, setErroresSub] = useState({})

  const [cargaHoy, setCargaHoy] = useState(null)

  const [confirmacionEliminar, setConfirmacionEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [mensajeAccionError, setMensajeAccionError] = useState('')

  useEffect(() => {
    cargar()

    fetch(`${BASE_URL}/api/hoy/`, { headers: getHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCargaHoy(d.carga_hoy_horas) })
      .catch(() => {})
  }, [id])

  async function cargar() {
    setCargando(true)
    setError(null)

    try {
      const res = await fetch(`${BASE_URL}/api/actividades/${id}/`, { headers: getHeaders() })
      if (!res.ok) throw new Error()

      const data = await res.json()

      if (data.error) {
        setError('Actividad no encontrada')
        return
      }

      setActividad(data)
    } catch {
      setError('Error al cargar la actividad.')
    }

    setCargando(false)
  }

  async function agregarSubtarea() {
    const e = {}

    if (!nuevaSub.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!nuevaSub.horas || Number(nuevaSub.horas) <= 0) e.horas = 'Ingresa las horas'

    if (Object.keys(e).length > 0) {
      setErroresSub(e)
      return
    }

    if (nuevaSub.fecha) {
      const resultado = await verificarConflicto(nuevaSub.fecha, nuevaSub.horas)

      if (resultado && resultado.hayConflicto) {
        setConflicto({
          total: resultado.totalConNueva,
          limite: resultado.limiteDiario,
          fecha: nuevaSub.fecha,
          horasActuales: resultado.horasActuales,
        })
        setModoConflicto('agregar')
        return
      }
    }

    await ejecutarAgregarSubtarea()
  }

  async function ejecutarAgregarSubtarea() {
    try {
      await fetch(`${BASE_URL}/api/actividades/${id}/subtareas/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          nombre: nuevaSub.nombre,
          fecha: nuevaSub.fecha,
          hora: nuevaSub.hora || '',
          horas: Number(nuevaSub.horas),
        }),
      })

      setNuevaSub({ nombre: '', fecha: '', hora: '', horas: '' })
      setErroresSub({})
      setAgregando(false)
      setConflicto(null)
      setModoConflicto(null)
      await cargar()
    } catch {
      alert('Error al agregar subtarea.')
    }
  }

  function abrirReprogramar(sub) {
    setReprogramando(sub)
    setNuevaFecha(sub.fecha || '')
    setNuevaHora(sub.hora || '')
    setNuevasHoras(sub.horas || '')
    setConflicto(null)
    setErrorReprogramar('')
  }

  async function confirmarReprogramacion() {
    if (!nuevasHoras || Number(nuevasHoras) <= 0) {
      setErrorReprogramar('Las horas son obligatorias')
      return
    }

    setErrorReprogramar('')

    if (nuevaFecha) {
      const resultado = await verificarConflicto(nuevaFecha, nuevasHoras, reprogramando.id)

      if (resultado && resultado.hayConflicto) {
        setConflicto({
          total: resultado.totalConNueva,
          limite: resultado.limiteDiario,
          fecha: nuevaFecha,
          horasActuales: resultado.horasActuales,
        })
        setModoConflicto('reprogramar')
        return
      }
    }

    await aplicarReprogramacion()
  }

  async function aplicarReprogramacion() {
    try {
      await fetch(`${BASE_URL}/api/actividades/${id}/subtareas/${reprogramando.id}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          fecha: nuevaFecha,
          hora: nuevaHora,
          horas: Number(nuevasHoras),
          estado: 'pendiente',
        }),
      })

      await cargar()
    } catch {
      alert('Error al reprogramar.')
    }

    setReprogramando(null)
    setConflicto(null)
  }

  async function registrarAvance(sub, estado) {
    try {
      await fetch(`${BASE_URL}/api/actividades/${id}/subtareas/${sub.id}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ estado, nota }),
      })

      await cargar()
    } catch {
      alert('Error al registrar avance.')
    }

    setAvance(null)
    setNota('')
  }

  function pedirEliminarActividad() {
    setConfirmacionEliminar({ tipo: 'actividad', item: actividad })
    setMensajeAccionError('')
  }

  function pedirEliminarSubtarea(subtarea) {
    setConfirmacionEliminar({ tipo: 'subtarea', item: subtarea })
    setMensajeAccionError('')
  }

  function cerrarConfirmacionEliminar() {
    if (eliminando) return
    setConfirmacionEliminar(null)
    setMensajeAccionError('')
  }

  async function confirmarEliminacion() {
    if (!confirmacionEliminar) return

    if (confirmacionEliminar.tipo === 'actividad') {
      await eliminarActividadConfirmada()
      return
    }

    await eliminarSubtareaConfirmada(confirmacionEliminar.item)
  }

  async function eliminarActividadConfirmada() {
    setEliminando(true)
    setMensajeAccionError('')

    try {
      const res = await fetch(`${BASE_URL}/api/actividades/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (!res.ok) throw new Error()

      setConfirmacionEliminar(null)
      setMensajeExito('Actividad eliminada correctamente.')
      setTimeout(() => navigate('/actividades'), 900)
    } catch {
      setMensajeAccionError('No se pudo eliminar la actividad. Intenta de nuevo.')
      setEliminando(false)
    }
  }

  async function eliminarSubtareaConfirmada(subtarea) {
    if (!subtarea) return

    setEliminando(true)
    setMensajeAccionError('')

    try {
      const res = await fetch(`${BASE_URL}/api/actividades/${id}/subtareas/${subtarea.id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (!res.ok) throw new Error()

      setConfirmacionEliminar(null)
      setMensajeExito('Subtarea eliminada correctamente.')
      setTimeout(() => setMensajeExito(''), 3200)
      await cargar()
    } catch {
      setMensajeAccionError('No se pudo eliminar la subtarea. Intenta de nuevo.')
    } finally {
      setEliminando(false)
    }
  }

  if (cargando) return <Pantalla cargando>Cargando actividad...</Pantalla>
  if (error) return <Pantalla error>{error}</Pantalla>

  const subtareas = actividad.subtareas || []
  const hechas = subtareas.filter(s => s.estado === 'hecho').length
  const progreso = subtareas.length > 0 ? Math.round((hechas / subtareas.length) * 100) : 0

  return (
    <div style={layoutBase}>
      <Sidebar navigate={navigate} actual="actividades" />

      <main style={mainStyle}>
        <div style={{ width: '100%', maxWidth: 720 }}>
          <button onClick={() => navigate('/actividades')} style={btnVolver}>
            ← Volver
          </button>

          <div style={encabezadoActividad}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>{actividad.titulo}</h2>
              <p style={{ fontSize: '0.85rem', color: '#9998a8' }}>
                {actividad.tipo} · {actividad.curso} {actividad.fechaLimite ? `· Vence ${actividad.fechaLimite}` : ''}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={chipProgreso}>{progreso}% completado</span>
              <button onClick={pedirEliminarActividad} style={btnEliminarTexto}>
                Eliminar
              </button>
            </div>
          </div>

          <div style={tarjetaProgreso}>
            <span style={{ fontSize: '0.82rem', color: '#9998a8' }}>Progreso</span>
            <div style={{ flex: 1, height: 6, background: '#2a2a32', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: `${progreso}%`, height: '100%', background: '#a78bfa', borderRadius: 10, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: '#9998a8' }}>
              {hechas}/{subtareas.length} subtareas
            </span>
          </div>

          {conflicto && (
            <ModalConflicto
              conflicto={conflicto}
              nuevasHoras={modoConflicto === 'reprogramar' ? nuevasHoras : nuevaSub.horas}
              onElgirFecha={() => { setConflicto(null); setModoConflicto(null) }}
              onAjustarHoras={() => { setConflicto(null); setModoConflicto(null) }}
              onGuardarIgual={() => {
                setConflicto(null)
                setModoConflicto(null)

                if (modoConflicto === 'reprogramar') aplicarReprogramacion()
                else ejecutarAgregarSubtarea()
              }}
            />
          )}

          <BarraCarga horasDelDia={cargaHoy} />

          <p style={labelSeccion}>Subtareas del plan</p>

          {subtareas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#9998a8', fontSize: '0.85rem' }}>
              Esta actividad no tiene subtareas.
            </div>
          )}

          {subtareas.map(sub => (
            <div key={sub.id} style={tarjetaSubtarea(sub)}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  textDecoration: sub.estado === 'hecho' ? 'line-through' : 'none',
                  color: sub.estado === 'hecho' ? '#6b6a7a' : '#f0eff5',
                }}>
                  {sub.nombre}
                </div>

                <div style={{ fontSize: '0.78rem', color: '#9998a8', marginTop: 3 }}>
                  {sub.fecha || 'Sin fecha'}{sub.hora ? ` · ${formatHora12(sub.hora)}` : ''} · {sub.horas}h {sub.nota && `· ${sub.nota}`}
                </div>
              </div>

              <span style={chipEstado(sub.estado)}>
                {sub.estado === 'hecho' ? 'Hecho' : sub.estado === 'pospuesto' ? 'Pospuesto' : 'Pendiente'}
              </span>

              <button onClick={() => abrirReprogramar(sub)} style={btnSubtareaNeutro}>
                Reprogramar
              </button>

              {sub.estado === 'pendiente' ? (
                <button onClick={() => { setAvance(sub); setNota('') }} style={btnSubtareaMorado}>
                  Registrar / cambiar estado
                </button>
              ) : (
                <button onClick={() => registrarAvance(sub, 'pendiente')} style={btnSubtareaNeutro}>
                  Revertir
                </button>
              )}

              <button onClick={() => pedirEliminarSubtarea(sub)} style={btnSubtareaEliminar}>
                Eliminar
              </button>
            </div>
          ))}

          {!agregando ? (
            <button onClick={() => setAgregando(true)} style={btnAgregarSubtarea}>
              + Agregar subtarea
            </button>
          ) : (
            <div style={formSubtarea}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a78bfa', marginBottom: 14 }}>
                Nueva subtarea
              </p>

              <div style={{ marginBottom: 12 }}>
                <input
                  placeholder="Nombre de la subtarea"
                  value={nuevaSub.nombre}
                  onChange={e => setNuevaSub({ ...nuevaSub, nombre: e.target.value })}
                  style={{ ...inp, borderColor: erroresSub.nombre ? '#f04a4a' : '#2a2a38' }}
                />
                {erroresSub.nombre && <p style={mensajeErrorCampo}>{erroresSub.nombre}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>Fecha opcional</label>
                  <DateInput value={nuevaSub.fecha} onChange={e => setNuevaSub({ ...nuevaSub, fecha: e.target.value })} style={inp} />
                  <p style={textoAyuda}>
                    Sin fecha, esta subtarea no aparecerá en Hoy ni en prioridades.
                  </p>
                </div>

                <div>
                  <label style={lbl}>Horas de estudio</label>
                  <input
                    type="number"
                    value={nuevaSub.horas}
                    onChange={e => setNuevaSub({ ...nuevaSub, horas: e.target.value })}
                    placeholder="Ej: 2"
                    min="0"
                    style={{ ...inp, borderColor: erroresSub.horas ? '#f04a4a' : '#2a2a38' }}
                  />
                  {erroresSub.horas && <p style={mensajeErrorCampo}>{erroresSub.horas}</p>}
                </div>
              </div>

              {nuevaSub.fecha && (
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Hora opcional</label>
                  <HoraPicker value={nuevaSub.hora} onChange={v => setNuevaSub({ ...nuevaSub, hora: v })} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setAgregando(false)
                    setNuevaSub({ nombre: '', fecha: '', hora: '', horas: '' })
                    setErroresSub({})
                  }}
                  style={btnSec}
                >
                  Cancelar
                </button>

                <button onClick={agregarSubtarea} style={btnPri}>
                  Agregar
                </button>
              </div>
            </div>
          )}

          {reprogramando && !conflicto && (
            <div style={overlay}>
              <div style={modal}>
                <h3 style={{ marginBottom: 4, fontSize: '1.1rem' }}>Reprogramar subtarea</h3>
                <p style={{ fontSize: '0.82rem', color: '#9998a8', marginBottom: 20 }}>{reprogramando.nombre}</p>

                <label style={lbl}>Nueva fecha</label>
                <DateInput value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} style={{ ...inp, marginBottom: 6 }} />
                <p style={{ ...textoAyuda, marginBottom: 14 }}>
                  Si dejas la subtarea sin fecha, no aparecerá en Hoy ni en prioridades.
                </p>

                {nuevaFecha && (
                  <>
                    <label style={lbl}>Hora opcional</label>
                    <div style={{ marginBottom: 14 }}>
                      <HoraPicker value={nuevaHora} onChange={setNuevaHora} />
                    </div>
                  </>
                )}

                <label style={lbl}>Horas de estudio</label>
                <input
                  type="number"
                  value={nuevasHoras}
                  onChange={e => {
                    setNuevasHoras(e.target.value)
                    setErrorReprogramar('')
                  }}
                  style={{ ...inp, borderColor: errorReprogramar ? '#f04a4a' : '#2a2a38', marginBottom: errorReprogramar ? 6 : 20 }}
                  min="0"
                />

                {errorReprogramar && <p style={{ fontSize: '0.75rem', color: '#f07070', marginBottom: 14 }}>{errorReprogramar}</p>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setReprogramando(null)} style={btnSec}>
                    Cancelar
                  </button>
                  <button onClick={confirmarReprogramacion} style={btnPri}>
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {avance && (
            <div style={overlay}>
              <div style={modal}>
                <h3 style={{ marginBottom: 4, fontSize: '1.1rem' }}>Registrar avance</h3>
                <p style={{ fontSize: '0.82rem', color: '#9998a8', marginBottom: 20 }}>{avance.nombre}</p>

                <label style={lbl}>Nota opcional</label>
                <input
                  placeholder="Ej: Completé los ejercicios 1 al 5"
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  style={{ ...inp, marginBottom: 20 }}
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setAvance(null)} style={btnSec}>
                    Cancelar
                  </button>
                  <button onClick={() => registrarAvance(avance, 'pospuesto')} style={{ ...btnSec, borderColor: '#f0a500', color: '#f0a500' }}>
                    Posponer
                  </button>
                  <button onClick={() => registrarAvance(avance, 'hecho')} style={btnPri}>
                    Marcar hecho
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {mensajeExito && <Toast texto={mensajeExito} />}

      {confirmacionEliminar && (
        <ModalConfirmacionEliminar
          titulo={confirmacionEliminar.tipo === 'actividad' ? 'Eliminar actividad' : 'Eliminar subtarea'}
          descripcion={
            confirmacionEliminar.tipo === 'actividad' ? (
              <>
                Vas a eliminar <strong>{confirmacionEliminar.item?.titulo}</strong>. Esta acción también eliminará todas sus subtareas y no se puede deshacer.
              </>
            ) : (
              <>
                Vas a eliminar la subtarea <strong>{confirmacionEliminar.item?.nombre}</strong>. Esta acción no se puede deshacer.
              </>
            )
          }
          error={mensajeAccionError}
          cargando={eliminando}
          textoConfirmar={confirmacionEliminar.tipo === 'actividad' ? 'Sí, eliminar actividad' : 'Sí, eliminar subtarea'}
          onCancelar={cerrarConfirmacionEliminar}
          onConfirmar={confirmarEliminacion}
        />
      )}
    </div>
  )
}

function ModalConfirmacionEliminar({ titulo, descripcion, error, cargando, textoConfirmar, onCancelar, onConfirmar }) {
  return (
    <div style={overlayConfirmacion} role="dialog" aria-modal="true" aria-labelledby="modal-eliminar-titulo">
      <div style={modalConfirmacion}>
        <div style={iconoAdvertencia}>!</div>
        <h3 id="modal-eliminar-titulo" style={tituloModalConfirmacion}>{titulo}</h3>
        <p style={textoModalConfirmacion}>{descripcion}</p>

        {error && <p style={textoErrorConfirmacion}>⚠️ {error}</p>}

        <div style={accionesConfirmacion}>
          <button type="button" onClick={onCancelar} disabled={cargando} style={btnCancelarConfirmacion}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar} disabled={cargando} style={btnEliminarConfirmacion}>
            {cargando ? 'Eliminando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ texto }) {
  return (
    <div style={toast} role="status" aria-live="polite">
      <span>✅</span>
      <span>{texto}</span>
    </div>
  )
}

function Pantalla({ children, error, cargando }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f15', fontFamily: 'DM Sans, sans-serif' }}>
      {cargando ? (
        <>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }

            .spinner-ring {
              width: 44px;
              height: 44px;
              border: 4px solid rgba(167,139,250,0.15);
              border-top-color: #a78bfa;
              border-radius: 50%;
              animation: spin 0.75s linear infinite;
            }
          `}</style>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="spinner-ring" />
            <p style={{ color: '#8b8a9a', fontSize: '0.88rem', fontWeight: 500 }}>{children}</p>
          </div>
        </>
      ) : (
        <p style={{ color: error ? '#f04a4a' : '#6b6a7a' }}>{children}</p>
      )}
    </div>
  )
}

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
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  marginBottom: 20,
}

const encabezadoActividad = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  marginBottom: 24,
}

const chipProgreso = {
  background: 'rgba(167,139,250,0.15)',
  border: '1px solid rgba(167,139,250,0.5)',
  color: '#a78bfa',
  borderRadius: 20,
  padding: '4px 14px',
  fontSize: '0.8rem',
  fontWeight: 600,
}

const btnEliminarTexto = {
  background: 'none',
  border: '1px solid #f04a4a',
  borderRadius: 8,
  color: '#f04a4a',
  fontSize: '0.78rem',
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const tarjetaProgreso = {
  background: '#1a1a24',
  border: '1px solid #2a2a38',
  borderRadius: 14,
  padding: '16px 20px',
  marginBottom: 24,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
}

const labelSeccion = {
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#9998a8',
  marginBottom: 10,
}

const tarjetaSubtarea = (sub) => ({
  background: '#1a1a24',
  border: `1px solid ${sub.estado === 'hecho' ? '#3bbfa3' : '#2a2a32'}`,
  borderRadius: 12,
  padding: '14px 18px',
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
})

const chipEstado = (estado) => ({
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  padding: '3px 9px',
  borderRadius: 20,
  background: estado === 'hecho'
    ? 'rgba(59,191,163,0.15)'
    : estado === 'pospuesto'
      ? 'rgba(240,165,0,0.15)'
      : 'rgba(107,106,122,0.15)',
  color: estado === 'hecho'
    ? '#3bbfa3'
    : estado === 'pospuesto'
      ? '#f0a500'
      : '#6b6a7a',
})

const btnSubtareaNeutro = {
  background: 'none',
  border: '1px solid #2a2a38',
  borderRadius: 8,
  color: '#9998a8',
  fontSize: '0.78rem',
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnSubtareaMorado = {
  background: 'none',
  border: '1px solid rgba(167,139,250,0.5)',
  borderRadius: 8,
  color: '#a78bfa',
  fontSize: '0.78rem',
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnSubtareaEliminar = {
  background: 'none',
  border: '1px solid rgba(240,74,74,0.45)',
  borderRadius: 8,
  color: '#f07070',
  fontSize: '0.78rem',
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnAgregarSubtarea = {
  marginTop: 8,
  width: '100%',
  padding: '10px',
  background: 'rgba(167,139,250,0.08)',
  border: '1px dashed rgba(167,139,250,0.4)',
  borderRadius: 10,
  color: '#a78bfa',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const formSubtarea = {
  background: '#1a1a24',
  border: '1px solid rgba(167,139,250,0.3)',
  borderRadius: 12,
  padding: '18px',
  marginTop: 8,
}

const lbl = {
  display: 'block',
  fontSize: '0.82rem',
  color: '#9998a8',
  marginBottom: 6,
}

const inp = {
  width: '100%',
  background: '#0f0f15',
  border: '1px solid #2a2a38',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#f0eff5',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const textoAyuda = {
  fontSize: '0.74rem',
  color: '#b7a8ff',
  marginTop: 6,
  lineHeight: 1.4,
}

const mensajeErrorCampo = {
  fontSize: '0.75rem',
  color: '#f07070',
  marginTop: 3,
}

const btnPri = {
  padding: '9px 20px',
  background: '#a78bfa',
  border: 'none',
  borderRadius: 10,
  color: 'white',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnSec = {
  padding: '9px 20px',
  background: 'none',
  border: '1px solid #2a2a38',
  borderRadius: 10,
  color: '#9998a8',
  fontSize: '0.88rem',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}

const modal = {
  background: '#1a1a24',
  border: '1px solid #2a2a38',
  borderRadius: 16,
  padding: '28px',
  width: 400,
}

const selStyle = {
  background: '#0f0f15',
  border: '1px solid #2a2a38',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#f0eff5',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.88rem',
  outline: 'none',
  cursor: 'pointer',
}

const overlayConfirmacion = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.72)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
}

const modalConfirmacion = {
  width: '100%',
  maxWidth: 440,
  background: '#1a1a24',
  border: '1px solid #2a2a38',
  borderRadius: 18,
  padding: '28px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
}

const iconoAdvertencia = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  background: 'rgba(240,74,74,0.12)',
  border: '1px solid rgba(240,74,74,0.35)',
  color: '#f07070',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.35rem',
  fontWeight: 900,
  marginBottom: 14,
}

const tituloModalConfirmacion = {
  fontSize: '1.2rem',
  fontWeight: 800,
  color: '#f0eff5',
  marginBottom: 10,
}

const textoModalConfirmacion = {
  fontSize: '0.9rem',
  lineHeight: 1.6,
  color: '#b9b8c8',
  marginBottom: 18,
}

const textoErrorConfirmacion = {
  background: 'rgba(240,74,74,0.08)',
  border: '1px solid rgba(240,74,74,0.28)',
  color: '#f07070',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: '0.82rem',
  fontWeight: 600,
  marginBottom: 16,
}

const accionesConfirmacion = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
}

const btnCancelarConfirmacion = {
  padding: '10px 18px',
  background: 'none',
  border: '1px solid #3a3a50',
  borderRadius: 10,
  color: '#d0cfdf',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const btnEliminarConfirmacion = {
  padding: '10px 18px',
  background: '#f04a4a',
  border: '1px solid #f04a4a',
  borderRadius: 10,
  color: 'white',
  fontSize: '0.88rem',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}

const toast = {
  position: 'fixed',
  right: 28,
  bottom: 28,
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  maxWidth: 360,
  background: 'rgba(59,191,163,0.12)',
  border: '1px solid rgba(59,191,163,0.38)',
  color: '#3bbfa3',
  borderRadius: 14,
  padding: '13px 16px',
  fontSize: '0.88rem',
  fontWeight: 700,
  boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
}