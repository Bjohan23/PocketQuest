# 🚀 Comandos Rápidos - Pocket Quest Mobile

## Comandos Principales

```bash
# Iniciar la app (Android)
npm run android

# Iniciar la app (iOS - solo Mac)
npm run ios

# Iniciar Metro con cache limpio
npm run start:reset

# Limpiar todo y reinstalar
npm run clean

# Limpiar Android
npm run clean:android

# Verificar tipos TypeScript
npm run type-check
```

## Flujo Completo de Limpieza y Ejecución

```bash
# Paso 1: Limpiar caché de Metro
npx react-native start --reset-cache

# Paso 2: (En otra terminal) Limpiar Android
cd android && ./gradlew clean && cd ..

# Paso 3: Desinstalar app del emulador (manualmente)

# Paso 4: Ejecutar
npm run android
```

## Verificación

```bash
# Verificar dependencias
npm list react-navigation zustand axios socket.io-client

# Verificar archivos
ls -la src/services/
ls -la src/screens/game/
ls -la src/screens/communication/

# Verificar TypeScript
npx tsc --noEmit
```

## Backend

```bash
# Asegúrate de que el backend esté corriendo
cd backend
npm run start:dev
```

## Solución Rápida de Problemas

### La app no muestra el contenido nuevo:
```bash
# Opción rápida
npm run start:reset
# En otra terminal:
npm run android
```

### Error de módulo:
```bash
npm run clean
npm run android
```

### Error de conexión:
1. Verifica que el backend esté corriendo
2. Verifica la URL en `src/config/api.ts`
3. Android Emulator: usa `10.0.2.2`
4. iOS: usa `localhost`
5. Dispositivo físico: usa tu IP local
