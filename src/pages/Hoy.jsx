import { useNavigate } from 'react-router-dom'

function Hoy() {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Arial' }}>
      <h1>Planificador de Estudio</h1>
      <p>¿Qué deseas hacer?</p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate('/hoy')} style={{ background: '#4CAF50', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '280px' }}>
          📅 Ver prioridades de HOY
        </button>
        <button onClick={() => navigate('/crear')} style={{ background: '#2196F3', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '280px' }}>
          ➕ Crear nueva actividad
        </button>
        <button onClick={() => navigate('/actividad/1')} style={{ background: '#FF9800', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '280px' }}>
          🔄 Reprogramar actividad
        </button>
        <button onClick={() => navigate('/progreso')} style={{ background: '#9C27B0', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '280px' }}>
          📊 Ver progreso
        </button>
      </div>
    </div>
  )
}

export default Hoy