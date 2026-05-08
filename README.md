# PlanificaT — Frontend

Aplicación web para organizar actividades evaluativas académicas. Permite crear, planificar y hacer seguimiento de tareas y subtareas con fechas límite, horas de estudio y estados de avance.

## 🚀 Demo

> Actualiza con tu URL de Vercel después del deploy

---

## 🛠️ Tecnologías

- **React 18** + Vite
- **React Router v6**
- **CSS-in-JS** (estilos en línea, sin librerías externas)
- Deploy: **Vercel**

---

## 📦 Instalación local

```bash
git clone https://github.com/tu-usuario/planificat-frontend.git
cd planificat-frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🗂️ Estructura del proyecto

```
src/
├── api.js               # Configuración base de la API
├── App.jsx              # Rutas y protección de rutas
├── main.jsx
├── index.css            # Variables CSS globales y reset
└── pages/
    ├── Login.jsx        # Login y registro combinados
    ├── Registro.jsx     # Registro independiente
    ├── Hoy.jsx          # Vista kanban: Vencidas / Hoy / Próximas
    ├── Actividades.jsx  # Lista de actividades con progreso
    ├── Actividad.jsx    # Detalle: subtareas, reprogramar, avances
    ├── Crear.jsx        # Formulario de nueva actividad
    ├── Progreso.jsx     # Resumen global de avance
    ├── Sidebar.jsx      # Barra de navegación lateral
    └── BarraCarga.jsx   # Indicador de carga de estudio diaria
```

---

## ✨ Funcionalidades

- **Autenticación** con correo y contraseña
- **Vista Hoy**: columnas kanban con tareas vencidas, de hoy y próximas
- **Actividades**: lista con barra de progreso y eliminación con confirmación
- **Detalle de actividad**: gestión de subtareas, reprogramación, registro de avance
- **Progreso global**: porcentaje general y por actividad
- **Barra de carga diaria**: alerta si superas las horas recomendadas de estudio
- **Soporte de teclado**: Enter para enviar en todos los formularios

---

## 🚢 Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. El archivo `vercel.json` ya maneja las rutas SPA automáticamente

---

## 🔗 Backend

URL base del backend configurada en cada página:
```
https://backend-planificador-3sre.onrender.com
```

---

## 📄 Licencia

MIT
