# 🚀 Guía de Configuración - Pocket Quest Mobile

## Pasos para Ejecutar la Aplicación

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Para Android Emulator
API_BASE_URL=http://10.0.2.2:3000/api
WS_URL=http://10.0.2.2:3000

# Para iOS Simulator (descomentar si usas Mac)
# API_BASE_URL=http://localhost:3000/api
# WS_URL=http://localhost:3000

# Para dispositivo físico (descomentar y usar tu IP local)
# API_BASE_URL=http://192.168.1.XXX:3000/api
# WS_URL=http://192.168.1.XXX:3000
```

### 2. Instalar Dependencias Nativas

#### Android
```bash
cd android
./gradlew clean
cd ..

# Reiniciar Metro
npm start -- --reset-cache
```

#### iOS (macOS solamente)
```bash
cd ios
pod install
cd ..
```

### 3. Iniciar el Backend

Asegúrate de que el backend de NestJS esté corriendo en el puerto 3000:

```bash
# Desde el directorio del backend
npm run start:dev
```

### 4. Limpiar Caché y Reconstruir

```bash
# Limpiar caché de Metro
npx react-native start --reset-cache

# En otra terminal, ejecutar:
npm run android
```

### 5. Verificar Conexión

Una vez la app esté corriendo:

1. **Modo Juego**: Deberías ver la pantalla principal con estadísticas
2. **Configuración**: Ve a Configuración e ingresa el código: `POCKET2025`
3. **Modo Comunicación**: Después de habilitar el acceso, puedes navegar al modo comunicación
4. **Login**: Usa los usuarios de prueba:
   - `alice@test.com` (cualquier password en development)
   - `bob@test.com`
   - `charlie@test.com`

## Solución de Problemas Comunes

### La app muestra la pantalla por defecto de React Native

**Causa**: Los cambios no se han compilado correctamente.

**Solución**:
```bash
# 1. Detén todo (Ctrl+C)
# 2. Limpia caché
npx react-native start --reset-cache

# 3. Desinstala la app del emulador
# 4. Vuelve a instalar
npm run android
```

### Error: "Unable to resolve module"

**Causa**: Dependencias no instaladas correctamente.

**Solución**:
```bash
rm -rf node_modules
npm install
cd android && ./gradlew clean && cd ..
npm run android
```

### Error de conexión al backend

**Causa**: URL incorrecta o backend no está corriendo.

**Solución**:
1. Verifica que el backend esté corriendo: `http://localhost:3000`
2. Verifica la URL en `src/services/apiService.ts`
3. Para emulador Android: usa `10.0.2.2` en lugar de `localhost`
4. Para dispositivo físico: usa tu IP local (ej: `192.168.1.100`)

### La app se cierra inesperadamente

**Causa**: Error en el código nativo o JavaScript.

**Solución**:
1. Revisa el logcat: `adb logcat`
2. Busca errores en la consola de Metro
3. Verifica que todos los archivos importados existan

## Verificación de Instalación

### Ejecutar estos comandos para verificar:

```bash
# Verificar dependencias instaladas
npm list react-navigation @react-navigation/native zustand axios socket.io-client

# Verificar archivos creados
ls -la src/screens/game/
ls -la src/screens/communication/
ls -la src/services/

# Verificar TypeScript
npx tsc --noEmit
```

## Usuarios de Prueba

El backend incluye estos usuarios de prueba (desarrollo):

- **alice@test.com** - Password: cualquiera
- **bob@test.com** - Password: cualquiera
- **charlie@test.com** - Password: cualquiera

## Próximos Pasos

Una vez que la app esté funcionando:

1. ✅ Verifica que el modo juego funciona correctamente
2. ✅ Habilita el modo comunicación con el código: `POCKET2025`
3. ✅ Login con los usuarios de prueba
4. ✅ Crea un chat con otro usuario
5. ✅ Envía mensajes en tiempo real

## Recursos

- [Documentación React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
