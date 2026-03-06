const BASE_URL = 'https://backend-planificador-3sre.onrender.com'

export const API = {
  getActividades: () =>
    fetch(`${BASE_URL}/api/actividades/`).then(r => r.json()),

  createActividad: (data) =>
    fetch(`${BASE_URL}/api/actividades/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json().then(json => ({ ok: r.ok, data: json }))),

  getActividad: (id) =>
    fetch(`${BASE_URL}/api/actividades/${id}/`).then(r => r.json()),

  deleteActividad: (id) =>
    fetch(`${BASE_URL}/api/actividades/${id}/`, { method: 'DELETE' }).then(r => r.ok),

  createSubtarea: (actividadId, data) =>
    fetch(`${BASE_URL}/api/actividades/${actividadId}/subtareas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json().then(json => ({ ok: r.ok, data: json }))),

  updateSubtarea: (actividadId, subtareaId, data) =>
    fetch(`${BASE_URL}/api/actividades/${actividadId}/subtareas/${subtareaId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json().then(json => ({ ok: r.ok, data: json }))),

  deleteSubtarea: (actividadId, subtareaId) =>
    fetch(`${BASE_URL}/api/actividades/${actividadId}/subtareas/${subtareaId}/`, {
      method: 'DELETE'
    }).then(r => r.ok),
}