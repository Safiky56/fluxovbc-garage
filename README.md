# 🏎️ FLUXO GARAGE - Sistema Integral de Gestión de Taller Automotriz

Sistema profesional, minimalista y 100% funcional para la gestión operativa y financiera de talleres mecánicos y centros de servicio automotriz.

---

## 🌟 Características Principales

- **Branding & Diseño Automotriz:** Logotipo vectorial profesional (SVG), paleta de colores de alto contraste inspirada en talleres de competición (Negro carbón, Naranja carrera, Cian diagnóstico y Verde entrega).
- **Control de Bahías y Órdenes de Trabajo (OT):**
  - Flujo de 6 fases en tiempo real: *Recibido -> En Diagnóstico -> Presupuestado -> En Reparación -> Control de Calidad -> Listo para Entrega -> Entregado*.
  - Búsqueda instantánea por placa, cliente, modelo u orden.
  - Filtros por fase de trabajo.
- **Checklist de Recepción Vehicular Digital:**
  - Registro de inventario al recibir el automóvil: carrocería/chapería, faros/luces, vidrios/espejos, neumáticos y auxilio, tapicería/radio, gata y herramientas, documentos/SOAT.
- **Gestión de Presupuesto y Repuestos:**
  - Desglose dinámico de repuestos y mano de obra con cálculo automático de totales.
- **Notificaciones Directas por WhatsApp:**
  - Botón de 1 clic para enviar al cliente su reporte de estado, presupuesto y diagnóstico formateado automáticamente.
- **Hoja de Servicio e Impresión Formal (Proforma/Factura):**
  - Hoja de servicio lista para imprimir (`Ctrl + P` o botón *Proforma / Hoja*) con diseño formal para firma del cliente.
- **Portal de Seguimiento para Clientes:**
  - Consulta en tiempo real del vehículo introduciendo el número de placa o código de orden.
- **Exportación:** Descarga de reportes en formato CSV/Excel con un solo clic.

---

## 🗄️ Base de Datos Dual: Supabase Cloud & SQLite Local

El sistema cuenta con un motor dual inteligente:
1. **Supabase Cloud (PostgreSQL):** Si configuras tus credenciales de Supabase en `.env` o desde la propia interfaz web, el sistema se sincroniza en la nube.
2. **SQLite Local (Cero configuración):** Si aún no tienes Supabase o trabajas sin conexión, el sistema utiliza automáticamente una base de datos local SQLite (`data/fluxo_garage.db`) con persistencia total y sin necesidad de instalar nada extra.

---

## 🚀 Cómo Iniciar el Proyecto

### 1. Iniciar el Servidor Node.js
Abre PowerShell o terminal en la carpeta del proyecto y ejecuta:

```powershell
npm start
```
*(O en modo desarrollo con recarga automática: `npm run dev`)*

### 2. Abrir la Aplicación
Ingresa en tu navegador a:
👉 **http://localhost:3000**

---

## ☁️ Cómo Conectar tu Base de Datos en Supabase

Si deseas conectar tu proyecto a Supabase:

1. Ingresa a **[supabase.com](https://supabase.com)** y crea un proyecto gratuito.
2. Ve a la sección **SQL Editor** en el panel de Supabase.
3. Abre el archivo `supabase_schema.sql` incluido en este proyecto (o pulsa el botón *"Copiar Script SQL"* dentro de la ventana de configuración en la app) y ejecútalo en Supabase para crear la tabla `orders` y las políticas de seguridad.
4. En Supabase, ve a **Project Settings -> API** y copia:
   - **Project URL**
   - **Project API Key (anon / public)**
5. Haz clic en el botón de estado de base de datos en la esquina superior de la aplicación (`SQLite Local` o el icono de engranaje) y pega tus credenciales para conectarte al instante.
   *(También puedes ingresarlas directamente en el archivo `.env` en la raíz del proyecto).*

---

## 📁 Estructura del Proyecto

```
FLUXO-Prueba/
├── public/                     # Frontend de la aplicación
│   ├── index.html              # Vista principal profesional
│   ├── css/
│   │   └── style.css           # Estilos minimalistas automotrices
│   ├── js/
│   │   └── app.js              # Lógica reactiva de la aplicación
│   └── assets/
│       └── logo.svg            # Logo vectorial automotriz Fluxo Garage
├── index.js                    # Servidor API REST con Express y entrada principal
├── db.js                       # Capa de datos dual (Supabase Cloud + SQLite)
├── supabase_schema.sql         # Script SQL listo para Supabase
├── package.json                # Configuración y dependencias
├── .env                        # Variables de entorno
├── .env.example                # Plantilla de variables
└── data/                       # Almacenamiento local SQLite
    └── fluxo_garage.db
```
