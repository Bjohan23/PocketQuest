# Pocket Quest

Aplicación móvil educativa y experimental que explora arquitectura modular, separación de contextos y diseño UI multi-modo en React Native con TypeScript.

## 🎯 Objetivo del Proyecto

Pocket Quest es un proyecto educativo para aprender:
- Arquitectura móvil modular
- Navegación avanzada con React Navigation
- Gestión de estado con Zustand
- Preparación para mensajería privada y comunicación en tiempo real

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── navigation/           # Sistema de navegación
│   ├── RootNavigation.tsx
│   ├── GameNavigation.tsx
│   └── CommunicationNavigation.tsx
│
├── screens/             # Pantallas de la aplicación
│   ├── game/           # Modo Juego
│   │   ├── GameHomeScreen.tsx
│   │   └── GameSettingsScreen.tsx
│   ├── access/         # Sistema de Acceso
│   │   └── AccessScreen.tsx
│   └── communication/  # Modo Comunicación
│       ├── ConversationListScreen.tsx
│       ├── ConversationScreen.tsx
│       └── ConversationSettingsScreen.tsx
│
├── components/          # Componentes reutilizables
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── index.ts
│
├── store/              # Estado Global (Zustand)
│   └── useAppStore.ts
│
├── services/           # Servicios de la aplicación
│   ├── apiService.ts        # Preparado para backend NestJS
│   ├── notificationService.ts
│   └── index.ts
│
├── hooks/              # Hooks personalizados
│   └── useNavigation.ts
│
├── utils/              # Utilidades
│   ├── formatUtils.ts
│   ├── validationUtils.ts
│   └── index.ts
│
├── types/              # Tipos TypeScript
│   └── index.ts
│
└── App.tsx            # Punto de entrada
```

## 🎮 Modos de la Aplicación

### 1. Modo Juego
- **GameHomeScreen**: Pantalla principal del juego casual
  - Estadísticas: nivel, vidas, monedas, experiencia
  - Botones de acción: Jugar, Tienda, Configuración
- **GameSettingsScreen**: Configuración del juego
  - Preferencias de sonido e idioma
  - Acceso avanzado al modo comunicación

### 2. Modo Comunicación
- **AccessScreen**: Pantalla de autenticación
  - Input de código de acceso
  - Validación simulada
- **ConversationListScreen**: Lista de conversaciones
  - Conversaciones con indicadores de estado
  - Contadores de mensajes no leídos
- **ConversationScreen**: Chat individual
  - Burbujas de mensajes
  - Input de texto y botón enviar
- **ConversationSettingsScreen**: Configuración de conversación
  - Mensajes temporales con duración configurable
  - Opción de limpiar conversación

## 🔑 Códigos de Acceso

El proyecto incluye códigos de acceso simulados para demostración:

- **Código por defecto**: `POCKET2025`
- **Código avanzado**: `ADVANCED2025`

## 🛠️ Tecnologías Utilizadas

- **React Native CLI** (v0.83.1) - Sin Expo managed
- **TypeScript** - Tipado estricto
- **React Navigation** - Navegación
- **Zustand** - Gestión de estado
- **Axios** - Cliente HTTP (preparado para backend)
- **react-native-keychain** - Secure Storage

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js >= 20
- npm o yarn
- Android Studio (para Android)
- Xcode (para iOS, solo macOS)

### Instalación

```bash
# Clonar el repositorio (o navegar al directorio)
cd PocketQuest

# Instalar dependencias
npm install

# Para iOS (macOS solamente)
cd ios && pod install && cd ..

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

### Desarrollo

```bash
# Iniciar Metro bundler
npm start

# Ejecutar en emulador/dispositivo
npm run android  # Android
npm run ios      # iOS
```

## 📱 Características Implementadas

### ✅ Completado

1. **Arquitectura Modular**
   - Separación clara de contextos (juego/comunicación)
   - Código organizado por funcionalidades
   - Componentes reutilizables

2. **Sistema de Navegación**
   - Navegación anidada (Stack Navigators)
   - Navegación condicional basada en autenticación
   - Transiciones suaves entre modos

3. **Gestión de Estado**
   - Store global con Zustand
   - Estado separado por contextos
   - Selectores personalizados

4. **Modo Juego**
   - UI de juego casual completa
   - Estadísticas simuladas (nivel, vidas, monedas, experiencia)
   - Configuración de preferencias
   - Sistema de experiencia progresivo

5. **Sistema de Acceso**
   - Pantalla de autenticación con validación simulada
   - Códigos de acceso configurables
   - Transición segura entre modos

6. **Modo Comunicación**
   - Lista de conversaciones con estado
   - Chat individual con burbujas de mensajes
   - Configuración de mensajes temporales
   - Indicadores de mensajes no leídos

7. **Mecanismo de Cambio de Contexto**
   - Transición instantánea entre modos
   - Reset de estado al cambiar de contexto
   - Prevención de navegación atrás no deseada

8. **Notificaciones Simuladas**
   - Notificaciones genéricas del juego
   - Servicio de notificaciones reutilizable
   - Notificaciones automáticas cada 30 segundos

9. **Servicios Preparados para Backend**
   - Servicio de API con Axios
   - Endpoints configurados para NestJS
   - Interceptors de requests/response

10. **Componentes Reutilizables**
    - Button con múltiples variantes
    - Card para contenedores
    - Input con validación

11. **Utilidades**
    - Formato de fechas y números
    - Validación de datos
    - Generación de IDs únicos

## 🔐 Seguridad y Privacidad

Este proyecto es **educativo y experimental**. No implementa:
- Cifrado real de mensajes
- Almacenamiento seguro real
- Backend real (todo está simulado)

El objetivo es enseñar arquitectura y buenas prácticas, no crear una aplicación de mensajería segura.

## 📦 Preparado para Backend

El proyecto está preparado para conectarse a un backend NestJS:

- Servicio de API configurado con Axios
- Tipos e interfaces definidos
- Endpoints documentados
- Autenticación preparada

## 🎨 Diseño UI

- **Modo Juego**: Colores azules y verdes, estilo casual
- **Modo Comunicación**: Colores verdes, estilo mensajería
- **Animaciones**: Transiciones suaves entre pantallas
- **Componentes**: Diseño moderno con sombras y bordes redondeados

## 📝 Notas Importantes

1. **Tipado Estricto**: TypeScript configurado con modo estricto
2. **Código Comentado**: Todo el código incluye comentarios explicativos
3. **Separación de Responsabilidades**: UI/lógica claramente separadas
4. **Componentes Reutilizables**: Maximiza la reutilización de código

## 🚧 Próximos Pasos (Opcionales)

Para continuar desarrollando:

1. Conectar backend NestJS real
2. Implementar WebSocket para comunicación en tiempo real
3. Agregar cifrado real de mensajes
4. Implementar almacenamiento seguro con Keychain/Keystore
5. Agregar más funcionalidades de juego
6. Implementar pruebas unitarias
7. Agregar animaciones más complejas

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como ejemplo educativo de:
- Arquitectura móvil modular
- React Native con TypeScript
- Gestión de estado con Zustand
- Navegación avanzada
- Separación de contextos

## 📄 Licencia

Proyecto educativo. Uso libre para fines de aprendizaje.

---

**¡Disfruta explorando Pocket Quest! 🎮🚀**
