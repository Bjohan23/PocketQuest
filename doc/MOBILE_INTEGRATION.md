# 📱 Guía de Integración - App Móvil React Native

Esta guía muestra cómo consumir la API de PocketQuest desde tu aplicación móvil React Native.

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install axios socket.io-client
# o
yarn add axios socket.io-client
```

### 2. Configurar URL Base

```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android Emulator
// export const API_BASE_URL = 'http://localhost:3000/api'; // iOS Simulator
// export const API_BASE_URL = 'http://TU_IP:3000/api'; // Dispositivo físico

export const WS_URL = 'http://10.0.2.2:3000'; // WebSocket
```

### 3. Crear Cliente HTTP

```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - logout
      await AsyncStorage.removeItem('accessToken');
      // Navegar a login
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Autenticación

### Login

```typescript
// POST /api/auth/login
import api from './api';

interface LoginParams {
  identifier: string; // email, username, o teléfono
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    identifier: string;
    publicKey: string;
  };
}

export const login = async (params: LoginParams): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', params);

  // Guardar token
  await AsyncStorage.setItem('accessToken', response.data.accessToken);
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
};

// Ejemplo de uso
const handleLogin = async () => {
  try {
    const result = await login({
      identifier: 'alice@test.com',
      password: 'cualquier-password', // En development, cualquier password funciona
    });
    console.log('Login exitoso:', result);
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

**Usuarios de prueba disponibles:**
- `alice@test.com`
- `bob@test.com`
- `charlie@test.com`

---

## 👥 Gestión de Usuarios

### Registrar Usuario

```typescript
// POST /api/users/register
interface RegisterParams {
  identifier: string;
  publicKey: string; // Tu clave pública E2EE
}

export const registerUser = async (params: RegisterParams) => {
  const response = await api.post('/users/register', params);
  return response.data;
};

// Ejemplo
await registerUser({
  identifier: 'nuevo@usuario.com',
  publicKey: 'PUBLIC_KEY_FROM_CRYPTO_LIBRARY',
});
```

### Obtener Perfil Propio

```typescript
// GET /api/users/me
export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};
```

### Buscar Usuarios

```typescript
// GET /api/users/search?query=alice
export const searchUsers = async (query: string) => {
  const response = await api.get(`/users/search?query=${query}`);
  return response.data;
};

// Ejemplo
const users = await searchUsers('alice');
```

### Actualizar Perfil

```typescript
// PUT /api/users/me
interface UpdateProfileParams {
  publicKey?: string;
}

export const updateProfile = async (params: UpdateProfileParams) => {
  const response = await api.put('/users/me', params);
  return response.data;
};
```

---

## 📱 Gestión de Dispositivos

### Registrar Dispositivo

```typescript
// POST /api/devices
interface RegisterDeviceParams {
  deviceName: string;
  devicePublicKey: string;
  pushToken?: string; // Token de FCM/APNS
}

export const registerDevice = async (params: RegisterDeviceParams) => {
  const response = await api.post('/devices', params);
  return response.data;
};

// Ejemplo
import DeviceInfo from 'react-native-device-info';

await registerDevice({
  deviceName: await DeviceInfo.getDeviceName(),
  devicePublicKey: 'DEVICE_PUBLIC_KEY',
  pushToken: 'FCM_TOKEN',
});
```

### Listar Dispositivos

```typescript
// GET /api/devices
export const getMyDevices = async () => {
  const response = await api.get('/devices');
  return response.data;
};
```

---

## 💬 Gestión de Chats

### Crear Chat 1:1

```typescript
// POST /api/chats
interface CreateChatParams {
  isGroup: boolean;
  participantIds: string[];
}

export const createChat = async (userId: string) => {
  const response = await api.post('/chats', {
    isGroup: false,
    participantIds: [userId],
  });
  return response.data;
};

// Ejemplo
const chat = await createChat('bob-user-id');
```

### Crear Chat Grupal

```typescript
export const createGroupChat = async (userIds: string[]) => {
  const response = await api.post('/chats', {
    isGroup: true,
    participantIds: userIds,
  });
  return response.data;
};

// Ejemplo
const groupChat = await createGroupChat(['user-id-1', 'user-id-2', 'user-id-3']);
```

### Obtener Todos los Chats

```typescript
// GET /api/chats
export const getMyChats = async () => {
  const response = await api.get('/chats');
  return response.data;
};
```

### Obtener Detalles de un Chat

```typescript
// GET /api/chats/:id
export const getChatDetails = async (chatId: string) => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data;
};
```

### Añadir Participante a Grupo

```typescript
// POST /api/chats/:id/participants
export const addParticipantToGroup = async (chatId: string, userId: string) => {
  const response = await api.post(`/chats/${chatId}/participants`, {
    userId,
  });
  return response.data;
};
```

---

## 📨 Mensajes (REST API)

### Obtener Mensajes de un Chat

```typescript
// GET /api/messages/:chatId?limit=50&before=messageId
interface GetMessagesParams {
  chatId: string;
  limit?: number;
  before?: string; // Message ID para paginación
}

export const getMessages = async ({ chatId, limit = 50, before }: GetMessagesParams) => {
  let url = `/messages/${chatId}?limit=${limit}`;
  if (before) {
    url += `&before=${before}`;
  }
  const response = await api.get(url);
  return response.data;
};

// Ejemplo con paginación
const messages = await getMessages({ chatId: 'chat-123', limit: 20 });
const olderMessages = await getMessages({
  chatId: 'chat-123',
  limit: 20,
  before: messages[messages.length - 1].id
});
```

### Marcar Mensaje como Entregado

```typescript
// POST /api/messages/:id/delivered
export const markMessageDelivered = async (messageId: string) => {
  const response = await api.post(`/messages/${messageId}/delivered`);
  return response.data;
};
```

---

## 🔌 WebSocket (Mensajería en Tiempo Real)

### Configurar Socket.IO

```typescript
// src/services/socket.ts
import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '../config/api';

let socket: Socket | null = null;

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No authentication token');
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Enviar Mensaje

```typescript
// Evento: send_message
interface SendMessageData {
  chatId: string;
  cipherText: string; // Mensaje cifrado
  mediaId?: string;
  ttlHours?: number;
}

export const sendMessage = (data: SendMessageData) => {
  const socket = getSocket();
  if (!socket) throw new Error('Socket not connected');

  socket.emit('send_message', data, (response: any) => {
    console.log('Message sent:', response);
  });
};

// Ejemplo
sendMessage({
  chatId: 'chat-123',
  cipherText: 'ENCRYPTED_MESSAGE_CONTENT',
  ttlHours: 24, // Mensaje se autodestruye en 24 horas
});
```

### Recibir Mensajes

```typescript
// Evento: message_received
socket.on('message_received', (message) => {
  console.log('New message:', message);
  // Actualizar UI con el nuevo mensaje
  // Descifrar message.cipherText
});
```

### Confirmación de Envío

```typescript
// Evento: message_sent
socket.on('message_sent', (message) => {
  console.log('Message sent confirmation:', message);
  // Actualizar UI con estado de enviado
});
```

### Confirmación de Entrega

```typescript
// Evento: delivery_confirmation
socket.on('delivery_confirmation', (data) => {
  console.log('Message delivered:', data);
  // Actualizar UI con doble check
});

// Enviar confirmación de entrega
export const confirmMessageDelivery = (messageId: string) => {
  const socket = getSocket();
  socket?.emit('message_delivered', { messageId });
};
```

### Indicador de Escritura (Typing)

```typescript
// Evento: typing
export const sendTypingIndicator = (chatId: string, isTyping: boolean) => {
  const socket = getSocket();
  socket?.emit('typing', { chatId, isTyping });
};

// Recibir indicador
socket.on('user_typing', ({ chatId, userId, isTyping }) => {
  console.log(`User ${userId} is ${isTyping ? 'typing' : 'stopped typing'} in chat ${chatId}`);
  // Actualizar UI con "Usuario escribiendo..."
});
```

### Presencia (Online/Offline)

```typescript
// Eventos de presencia
socket.on('user_online', ({ userId }) => {
  console.log(`User ${userId} is online`);
});

socket.on('user_offline', ({ userId }) => {
  console.log(`User ${userId} is offline`);
});
```

### Unirse/Salir de Chat

```typescript
// Unirse a una sala de chat
export const joinChat = (chatId: string) => {
  const socket = getSocket();
  socket?.emit('join_chat', { chatId });
};

// Salir de una sala
export const leaveChat = (chatId: string) => {
  const socket = getSocket();
  socket?.emit('leave_chat', { chatId });
};
```

---

## 📁 Archivos/Media

### Subir Archivo Cifrado

```typescript
// POST /api/media/upload
import { FormData } from 'react-native';

interface UploadMediaParams {
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

export const uploadMedia = async ({ file }: UploadMediaParams) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Ejemplo con cifrado
import * as FileSystem from 'expo-file-system';

const encryptAndUpload = async (fileUri: string) => {
  // 1. Leer archivo
  const fileContent = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 2. Cifrar contenido (usando tu biblioteca de crypto)
  const encrypted = await encryptFile(fileContent);

  // 3. Crear archivo temporal cifrado
  const tempUri = FileSystem.cacheDirectory + 'encrypted_file.bin';
  await FileSystem.writeAsStringAsync(tempUri, encrypted, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 4. Subir
  const result = await uploadMedia({
    file: {
      uri: tempUri,
      type: 'application/octet-stream',
      name: 'encrypted_file.bin',
    },
  });

  return result;
};
```

### Descargar Archivo

```typescript
// GET /api/media/:id
export const downloadMedia = async (mediaId: string) => {
  const response = await api.get(`/media/${mediaId}`, {
    responseType: 'blob',
  });

  return response.data;
};

// Descifrar y guardar
const downloadAndDecrypt = async (mediaId: string) => {
  // 1. Descargar
  const encryptedBlob = await downloadMedia(mediaId);

  // 2. Leer como base64
  const reader = new FileReader();
  reader.readAsDataURL(encryptedBlob);

  reader.onloadend = async () => {
    const base64 = reader.result as string;

    // 3. Descifrar
    const decrypted = await decryptFile(base64);

    // 4. Guardar
    const filePath = FileSystem.documentDirectory + 'downloaded_file';
    await FileSystem.writeAsStringAsync(filePath, decrypted, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
  };
};
```

### Obtener Metadata de Archivo

```typescript
// GET /api/media/:id/metadata
export const getMediaMetadata = async (mediaId: string) => {
  const response = await api.get(`/media/${mediaId}/metadata`);
  return response.data;
};
```

---

## 🟢 Presencia

### Consultar Estado de Usuario

```typescript
// GET /api/presence/:userId
export const getUserPresence = async (userId: string) => {
  const response = await api.get(`/presence/${userId}`);
  return response.data; // { userId, isOnline }
};
```

### Consultar Estado de Múltiples Usuarios

```typescript
// POST /api/presence/batch
export const getBatchPresence = async (userIds: string[]) => {
  const response = await api.post('/presence/batch', { userIds });
  return response.data; // { userId1: true, userId2: false, ... }
};
```

### Heartbeat (Renovar Presencia)

```typescript
// POST /api/presence/heartbeat
export const sendHeartbeat = async () => {
  await api.post('/presence/heartbeat');
};

// Enviar heartbeat cada 4 minutos (TTL es 5 min)
setInterval(() => {
  sendHeartbeat().catch(console.error);
}, 4 * 60 * 1000);
```

---

## 🚨 Modo Pánico

### Bloquear Dispositivo Actual

```typescript
// POST /api/panic/lock
export const lockCurrentDevice = async (deviceId: string) => {
  const response = await api.post('/panic/lock', { deviceId });

  // Limpiar datos locales
  await AsyncStorage.clear();

  // Desconectar socket
  disconnectSocket();

  return response.data;
};
```

### Bloquear Todos los Dispositivos

```typescript
// POST /api/panic/lock-all
export const lockAllDevices = async () => {
  const response = await api.post('/panic/lock-all');

  // Limpiar todo
  await AsyncStorage.clear();
  disconnectSocket();

  return response.data;
};
```

---

## 📊 Ejemplo de Implementación Completa

### Hook Personalizado para Mensajería

```typescript
// hooks/useMessaging.ts
import { useEffect, useState } from 'react';
import { connectSocket, getSocket, sendMessage } from '../services/socket';
import { getMessages } from '../services/api';

export const useMessaging = (chatId: string) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conectar socket
    connectSocket();

    // Cargar mensajes históricos
    loadMessages();

    // Escuchar nuevos mensajes
    const socket = getSocket();
    socket?.on('message_received', handleNewMessage);

    return () => {
      socket?.off('message_received', handleNewMessage);
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const data = await getMessages({ chatId });
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: any) => {
    if (message.chatId === chatId) {
      setMessages((prev) => [message, ...prev]);
    }
  };

  const send = (cipherText: string) => {
    sendMessage({ chatId, cipherText });
  };

  return { messages, loading, send };
};
```

### Componente de Chat

```typescript
// screens/ChatScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, TextInput, Button } from 'react-native';
import { useMessaging } from '../hooks/useMessaging';

export const ChatScreen = ({ chatId }) => {
  const { messages, loading, send } = useMessaging(chatId);
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;

    // Cifrar mensaje
    const encrypted = encryptMessage(text);

    // Enviar
    send(encrypted);
    setText('');
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={decryptMessage(item.cipherText)} />
        )}
        inverted
      />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escribe un mensaje..."
      />
      <Button title="Enviar" onPress={handleSend} />
    </View>
  );
};
```

---

## ⚠️ Notas Importantes

1. **Cifrado E2EE**: El backend solo almacena `cipherText`. DEBES cifrar/descifrar en el cliente.

2. **URLs para Testing**:
   - Android Emulator: `http://10.0.2.2:3000`
   - iOS Simulator: `http://localhost:3000`
   - Dispositivo físico: `http://TU_IP_LOCAL:3000`

3. **Headers Requeridos**:
   - Todos los endpoints protegidos requieren: `Authorization: Bearer TOKEN`

4. **Manejo de Errores**:
   - 401: Token inválido/expirado → Logout
   - 403: Sin permisos
   - 404: Recurso no encontrado

5. **WebSocket**:
   - Usar `transports: ['websocket']` para mejor compatibilidad con React Native
   - Reconectar automáticamente en caso de desconexión

6. **Presencia**:
   - TTL de 5 minutos → Enviar heartbeat cada 4 min
   - Online/Offline automático con conexión/desconexión de socket

---

## 🧪 Testing Rápido

```typescript
// Test completo
import * as API from './services/api';
import { connectSocket, sendMessage, getSocket } from './services/socket';

const testFlow = async () => {
  // 1. Login
  const auth = await API.login({
    identifier: 'alice@test.com',
    password: 'test',
  });
  console.log('Logged in:', auth.user);

  // 2. Buscar usuario
  const users = await API.searchUsers('bob');
  console.log('Found users:', users);

  // 3. Crear chat
  const chat = await API.createChat(users[0].id);
  console.log('Chat created:', chat);

  // 4. Conectar WebSocket
  await connectSocket();

  // 5. Enviar mensaje
  sendMessage({
    chatId: chat.id,
    cipherText: 'ENCRYPTED_TEST_MESSAGE',
  });

  // 6. Escuchar respuesta
  getSocket()?.on('message_received', (msg) => {
    console.log('Received:', msg);
  });
};
```

---

¡Tu backend está listo para integrarse con React Native! 🚀
