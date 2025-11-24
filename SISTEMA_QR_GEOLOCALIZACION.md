# Sistema de Verificación con QR y Geolocalización

## Descripción General

Este sistema implementa un mecanismo robusto de verificación de asistencia a eventos mediante **3 capas de seguridad**:

1. **Código QR Dinámico** - Cambia cada 5 minutos para evitar falsificaciones
2. **Verificación de Geolocalización** - Confirma que el usuario está físicamente en el lugar
3. **Reconocimiento Facial (Opcional)** - Verifica la identidad del usuario

## Características Implementadas

### Backend

#### Modelos Actualizados

**Attendance.js**
- `isLocationVerified` - Indica si la ubicación fue verificada
- `isQRCodeVerified` - Indica si el código QR fue validado
- `location` - Coordenadas GPS del usuario al registrar asistencia
- `distanceFromEvent` - Distancia en metros del usuario al evento
- `qrCodeUsed` - Código QR utilizado
- `isValidAttendance` - Indica si pasó todas las verificaciones requeridas

**Event.js**
- `location` - Coordenadas GPS del evento
- `locationName` - Nombre legible del lugar
- `allowedRadius` - Radio permitido en metros
- `qrConfig` - Configuración del código QR dinámico
- `currentQRCode` - Código QR actual con expiración
- `requiresQRCode` - Si el evento requiere código QR
- `requiresLocation` - Si el evento requiere verificación de ubicación
- `requiresFacialRecognition` - Si requiere reconocimiento facial

#### Servicios Nuevos

**qrService.js** - Funciones para:
- Generar códigos QR únicos y seguros
- Verificar validez de códigos QR
- Calcular distancias geográficas (fórmula de Haversine)
- Validar ubicación dentro del radio permitido

#### Endpoints Nuevos

```javascript
POST /api/events/:id/attend-verified
// Registra asistencia con todas las verificaciones
// Body: { qrCode, latitude, longitude, deviceInfo }
// File: faceImage (opcional según configuración)

GET /api/events/:id/qr-code
// Obtiene el código QR actual del evento
// Solo accesible por el creador o admin

POST /api/events/:id/qr-code/refresh
// Regenera el código QR manualmente

POST /api/events/:id/checkout
// Registra la salida del evento
```

### Frontend

#### Componentes Nuevos

1. **EventQRDisplay.jsx**
   - Muestra el código QR del evento
   - Actualiza automáticamente cuando expira
   - Contador regresivo de tiempo de expiración

2. **QRScanner.jsx**
   - Escanea códigos QR usando la cámara
   - Utiliza librería html5-qrcode

3. **AttendanceVerified.jsx**
   - Flujo paso a paso para registrar asistencia
   - Paso 1: Escanear QR
   - Paso 2: Capturar ubicación GPS
   - Paso 3: Tomar foto (si se requiere)
   - Paso 4: Confirmar y enviar

#### Formulario de Eventos Actualizado

**EventForm.jsx** ahora incluye:
- Campos de ubicación (latitud, longitud, radio)
- Botón para capturar ubicación actual
- Checkboxes para configurar verificaciones requeridas
- Campo de tiempo mínimo de permanencia

## Cómo Usar el Sistema

### Para Administradores (Crear Eventos)

1. **Crear un nuevo evento** con ubicación:
   ```
   - Ve a la sección "Eventos"
   - Click en "Crear nuevo evento"
   - Completa nombre, descripción, fecha
   - En "Ubicación del Evento":
     * Ingresa el nombre del lugar
     * Click en "Usar mi ubicación actual" (si estás en el lugar)
     * O ingresa coordenadas manualmente
     * Define el radio permitido (ej: 100 metros)
   - En "Configuración de Verificación":
     * Marca "Requiere código QR" ✓
     * Marca "Requiere verificación de ubicación" ✓
     * Opcionalmente marca "Requiere reconocimiento facial"
   - Click "Crear evento"
   ```

2. **Mostrar el código QR durante el evento**:
   ```
   - Abre el evento creado
   - Click en "Ver código QR" (solo visible para admins/creadores)
   - El código QR se mostrará en pantalla
   - Proyecta o muestra el QR en el lugar del evento
   - El código se renueva automáticamente cada 5 minutos
   ```

### Para Usuarios (Registrar Asistencia)

1. **Método tradicional** (sin verificación adicional):
   ```
   - Ve a "Eventos"
   - Click en "Registrar Asistencia" en el evento deseado
   ```

2. **Método verificado** (con QR + GPS):
   ```
   - Ve al evento físicamente
   - Abre la app en tu teléfono
   - Ve a "Eventos" → selecciona el evento
   - Click en "Asistencia Verificada"
   - Paso 1: Escanea el código QR mostrado en el evento
   - Paso 2: Permite el acceso a tu ubicación GPS
   - Paso 3: Si requiere facial, toma una foto
   - Paso 4: Confirma y envía
   - ✓ Asistencia registrada y verificada
   ```

## Seguridad y Validaciones

### Código QR Dinámico

- Cada código incluye:
  - ID del evento
  - Timestamp de generación
  - Hash de seguridad (SHA-256)
  - Tiempo de expiración
- Expira automáticamente cada 5 minutos
- No se puede reutilizar código QR expirado
- No se puede usar código QR de otro evento

### Verificación de Ubicación

- Usa GPS del dispositivo
- Calcula distancia con fórmula de Haversine (precisión alta)
- Valida que el usuario esté dentro del radio permitido
- Registra la distancia exacta del usuario al evento
- Almacena precisión del GPS para auditoría

### Validación de Asistencia

El sistema rechaza la asistencia si:
- El código QR es inválido o expirado
- El usuario está fuera del radio permitido
- Falta el reconocimiento facial (si es requerido)
- El evento ya finalizó
- El evento aún no ha comenzado

## Datos Almacenados para Auditoría

Cada registro de asistencia incluye:
- ✓ Usuario que registró
- ✓ Evento al que asistió
- ✓ Timestamp preciso
- ✓ Coordenadas GPS del usuario
- ✓ Distancia del usuario al evento
- ✓ Código QR utilizado
- ✓ Foto de verificación (opcional)
- ✓ Información del dispositivo
- ✓ Estado de cada verificación (QR, ubicación, facial)
- ✓ Validez final de la asistencia

## Reportes y Análisis

Los administradores pueden:
- Filtrar asistencias por verificación (válidas vs no válidas)
- Ver distancia de cada asistente al evento
- Exportar reportes con datos de verificación
- Ver qué código QR usó cada asistente
- Analizar patrones de ubicación

## Configuración Recomendada

### Para eventos presenciales estrictos:
```javascript
requiresQRCode: true
requiresLocation: true
requiresFacialRecognition: true
allowedRadius: 50  // 50 metros
minimumStayMinutes: 30  // Mínimo 30 minutos
```

### Para eventos presenciales flexibles:
```javascript
requiresQRCode: true
requiresLocation: true
requiresFacialRecognition: false
allowedRadius: 200  // 200 metros
minimumStayMinutes: 0
```

### Para eventos híbridos/virtuales:
```javascript
requiresQRCode: false
requiresLocation: false
requiresFacialRecognition: false
```

## Endpoints API

### Crear evento con verificación
```http
POST /api/events
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Conferencia Anual",
  "description": "Evento corporativo 2024",
  "date": "2024-12-15T09:00:00Z",
  "endDate": "2024-12-15T18:00:00Z",
  "location": {
    "coordinates": [-70.6483, -33.4569]
  },
  "locationName": "Centro de Convenciones",
  "allowedRadius": 100,
  "requiresQRCode": true,
  "requiresLocation": true,
  "requiresFacialRecognition": false,
  "minimumStayMinutes": 60
}
```

### Registrar asistencia verificada
```http
POST /api/events/{eventId}/attend-verified
Content-Type: multipart/form-data
Authorization: Bearer {token}

qrCode: "{JSON con datos del QR}"
latitude: -33.4569
longitude: -70.6483
deviceInfo: "Mozilla/5.0..."
faceImage: [archivo de imagen]
```

### Obtener código QR
```http
GET /api/events/{eventId}/qr-code
Authorization: Bearer {token}

Response:
{
  "qrCode": "{datos JSON}",
  "qrImage": "data:image/png;base64,...",
  "generatedAt": "2024-12-15T10:00:00Z",
  "expiresAt": "2024-12-15T10:05:00Z",
  "refreshed": false
}
```

## Troubleshooting

### "No se pudo obtener tu ubicación"
- Verifica que el navegador tenga permisos de ubicación
- Usa HTTPS (geolocalización requiere conexión segura)
- En móvil, verifica que GPS esté activado

### "Código QR inválido"
- El código puede haber expirado (5 minutos)
- Escanea el código QR actual mostrado en pantalla
- Verifica que sea del evento correcto

### "Estás muy lejos del evento"
- Asegúrate de estar físicamente en el lugar
- Verifica que el GPS tenga buena señal
- Contacta al organizador si el radio es muy restrictivo

## Dependencias Instaladas

**Backend:**
- `qrcode` - Generación de códigos QR
- `geolib` - Cálculos geográficos (alternativa)
- `crypto` - Hashing y seguridad (nativo de Node)

**Frontend:**
- `html5-qrcode` - Escaneo de códigos QR con cámara

## Próximas Mejoras Sugeridas

1. ✅ Integrar con servicios de reconocimiento facial avanzado (AWS Rekognition, Azure Face API)
2. ✅ Agregar notificaciones push cuando se acerca el evento
3. ✅ Implementar check-in/check-out dual con tiempo de permanencia
4. ✅ Geofencing más avanzado con múltiples zonas
5. ✅ Dashboard de analíticas en tiempo real
6. ✅ Exportación de reportes con mapas de calor de asistentes

## Archivos Modificados/Creados

### Backend
- ✅ `backend/models/Attendance.js` - Actualizado
- ✅ `backend/models/Event.js` - Actualizado
- ✅ `backend/services/qrService.js` - Nuevo
- ✅ `backend/controllers/eventController.js` - Actualizado
- ✅ `backend/routes/eventRoutes.js` - Actualizado

### Frontend
- ✅ `frontend/src/components/EventForm.jsx` - Actualizado
- ✅ `frontend/src/components/EventQRDisplay.jsx` - Nuevo
- ✅ `frontend/src/components/QRScanner.jsx` - Nuevo
- ✅ `frontend/src/components/AttendanceVerified.jsx` - Nuevo

## Soporte

Para reportar bugs o solicitar features:
- Revisa la documentación técnica en los archivos fuente
- Contacta al equipo de desarrollo
- Verifica los logs del servidor para errores

---

**Versión:** 1.0.0
**Última actualización:** 2024-11-24
