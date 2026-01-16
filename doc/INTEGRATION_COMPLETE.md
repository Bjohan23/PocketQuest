# ✅ Pocket Quest Mobile - Implementación Completada

## 📦 Servicios Integrados

### 1. **Servicios Core**
- ✅ **apiService** - Cliente HTTP con Axios
- ✅ **authService** - Login, registro, logout
- ✅ **chatService** - Gestión de chats 1:1 y grupales
- ✅ **messageService** - Envío y recepción de mensajes
- ✅ **webSocketService** - Conexión en tiempo real con Socket.IO
- ✅ **notificationService** - Notificaciones simuladas

### 2. **Configuración Centralizada**
- ✅ **src/config/api.ts** - URLs base y timeouts configurables
- ✅ Compatible con Android Emulator (10.0.2.2)
- ✅ Compatible con iOS Simulator (localhost)
- ✅ Compatible con dispositivo físico (IP local)

### 3. **Endpoints Implementados**

#### Autenticación
```
POST /api/auth/login
POST /api/auth/logout
```

#### Usuarios
```
POST /api/users/register
GET  /api/users/me
PUT  /api/users/me
GET  /api/users/search?query=xxx
```

#### Dispositivos
```
POST /api/devices
GET  /api/devices
```

#### Chats
```
GET  /api/chats
GET  /api/chats/:id
POST /api/chats
POST /api/chats/:id/participants
```

#### Mensajes
```
GET  /api/messages/:chatId
POST /api/messages/:id/delivered
```

#### Media
```
POST /api/media/upload
GET  /api/media/:id
GET  /api/media/:id/metadata
```

#### Presencia
```
GET  /api/presence/:userId
POST /api/presence/batch
POST /api/presence/heartbeat
```

#### Modo Pánico
```
POST /api/panic/lock
POST /api/panic/lock-all
```

## 🚀 Instrucciones para Ejecutar

### Paso 1: Asegúrate de que el backend esté corriendo

```bash
# Desde el directorio del backend
cd backend
npm run start:dev
```

El backend debería estar en `http://localhost:3000`

### Paso 2: Limpia caché y reconstruye

```bash
cd PocketQuest

# Limpiar caché de Metro
npm run start:reset

# En otra terminal:
npm run android
```

### Paso 3: Si la app sigue mostrando la pantalla por defecto

```bash
# Opción A: Limpia todo y reinstala
npm run clean
npm run clean:android
npm run android

# Opción B: Desinstala la app manualmente del emulador
# Luego ejecuta:
npm run android
```

## 🔐 Códigos de Acceso

### Modo Juego → Modo Comunicación

1. Abre la app
2. Ve a "Configuración"
3. Despliega "Acceso Avanzado"
4. Ingresa el código: **POCKET2025**
5. Presiona "Continuar"

### Login Backend

Usuarios de prueba (desarrollo):
- `alice@test.com` (password: cualquiera)
- `bob@test.com`
- `charlie@test.com`

## 📱 Flujo de la Aplicación

### 1. Modo Juego (Inicio)
```
GameHomeScreen
├── Estadísticas: Nivel, Vidas, Monedas, XP
├── Botón: Jugar
├── Botón: Tienda
└── Botón: Configuración
```

### 2. Habilitar Modo Comunicación
```
GameSettingsScreen
└── Acceso Avanzado
    ├── Input: Código de acceso
    └── Botón: Continuar (POCKET2025)
```

### 3. Modo Comunicación
```
AccessScreen → Login → ConversationListScreen
                                    ├── ConversationList
                                    ├── ConversationScreen (Chat)
                                    └── ConversationSettingsScreen
```

## 🔧 Configurar URL según tu entorno

### Android Emulator (Por defecto)
```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://10.0.2.2:3000/api';
export const WS_URL = 'http://10.0.2.2:3000';
```

### iOS Simulator
```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://localhost:3000/api';
export const WS_URL = 'http://localhost:3000';
```

### Dispositivo Físico
```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
export const WS_URL = 'http://192.168.1.XXX:3000';
```

> Para obtener tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)

## 🐛 Solución de Problemas

### La app no muestra el contenido nuevo

**Síntoma**: Sigue apareciendo la pantalla por defecto de React Native

**Solución**:
```bash
# 1. Detén todo (Ctrl+C en todas las terminales)
# 2. Limpia caché
npm run start:reset

# 3. En otra terminal
cd android && ./gradlew clean && cd ..

# 4. Desinstala la app del emulador
# 5. Vuelve a instalar
npm run android
```

### Error: "Unable to resolve module"

```bash
rm -rf node_modules
npm install
npm run android
```

### Error de conexión al backend

1. Verifica que el backend esté corriendo: `http://localhost:3000`
2. Prueba los endpoints: `curl http://localhost:3000/api/auth/login`
3. Verifica la URL en `src/config/api.ts`
4. Si usas emulador Android: usa `10.0.2.2`
5. Si usas dispositivo físico: usa tu IP local

## 📂 Archivos Clave

### Configuración
- **[src/config/api.ts](src/config/api.ts)** - URLs de API y WebSocket

### Servicios
- **[src/services/apiService.ts](src/services/apiService.ts)** - Cliente HTTP
- **[src/services/authService.ts](src/services/authService.ts)** - Autenticación
- **[src/services/chatService.ts](src/services/chatService.ts)** - Chats
- **[src/services/messageService.ts](src/services/messageService.ts)** - Mensajes
- **[src/services/webSocketService.ts](src/services/webSocketService.ts)** - WebSocket

### Navegación
- **[src/navigation/RootNavigation.tsx](src/navigation/RootNavigation.tsx)**
- **[src/navigation/GameNavigation.tsx](src/navigation/GameNavigation.tsx)**
- **[src/navigation/CommunicationNavigation.tsx](src/navigation/CommunicationNavigation.tsx)**

### Pantallas
- **[src/screens/game/](src/screens/game/)** - Modo Juego
- **[src/screens/access/](src/screens/access/)** - Acceso
- **[src/screens/communication/](src/screens/communication/)** - Modo Comunicación

## ✨ Características Implementadas

1. ✅ Dos modos funcionales independientes
2. ✅ Sistema de acceso con códigos
3. ✅ Navegación modular con React Navigation
4. ✅ Estado global con Zustand
5. ✅ Integración completa con backend
6. ✅ WebSocket para mensajería en tiempo real
7. ✅ Notificaciones simuladas
8. ✅ Mecanismo de cambio rápido de contexto
9. ✅ Componentes reutilizables
10. ✅ TypeScript con tipado estricto

## 🎯 Próximos Pasos

1. **Probar la app** con el backend corriendo
2. **Verificar login** con usuarios de prueba
3. **Probar chat** en tiempo real
4. **Implementar cifrado E2EE** (opcional)
5. **Añadir más funcionalidades** de juego

## 📞 Usuarios de Prueba

```
alice@test.com  - Password: cualquiera
bob@test.com    - Password: cualquiera
charlie@test.com - Password: cualquiera
```

---

**¡Tu aplicación móvil está lista para integrarse con el backend! 🎉**
