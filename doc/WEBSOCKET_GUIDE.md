# Guía de WebSocket - Tiempo Real

Esta guía explica cómo implementar la mensajería en tiempo real usando Socket.IO en la app móvil PocketQuest.

---

## 📋 Tabla de Contenidos

1. [¿Qué es WebSocket?](#qué-es-websocket)
2. [Eventos Disponibles](#eventos-disponibles)
3. [Conexión y Autenticación](#conexión-y-autenticación)
4. [Recibir Mensajes en Tiempo Real](#recibir-mensajes-en-tiempo-real)
5. [Enviar Mensajes](#enviar-mensajes)
6. [Presencia (Online/Offline)](#presencia-onlineoffline)
7. [Indicador de Escritura](#indicador-de-escritura)
8. [Ejemplos Completos](#ejemplos-completos)

---

## 🎯 ¿Qué es WebSocket?

WebSocket es una conexión **bidireccional** y **persistente** entre el cliente y el servidor.

### REST vs WebSocket

| REST (HTTP) | WebSocket |
|-------------|-----------|
| Tú pides datos | El servidor te envía datos |
| Conexión temporal | Conexión permanente |
| Unidireccional | Bidireccional |
| Historial | Tiempo real |

### Cuándo usar cada uno

```
┌─────────────────────────────────────────────────────────────┐
│                    REST (HTTP)                              │
├─────────────────────────────────────────────────────────────┤
│ ✅ Cargar historial de mensajes                            │
│ ✅ Buscar usuarios                                          │
│ ✅ Crear chats                                              │
│ ✅ Subir archivos                                           │
│ ❌ Recibir nuevos mensajes instantáneamente                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    WEBSOCKET                                │
├─────────────────────────────────────────────────────────────┤
│ ✅ Recibir mensajes en tiempo real                          │
│ ✅ Ver cuando alguien está escribiendo                      │
│ ✅ Ver online/offline de usuarios                           │
│ ✅ Confirmaciones de entrega (✓✓)                          │
│ ❌ Cargar historial (usar REST para esto)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Eventos Disponibles

### Cliente → Servidor (Tú envías)

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `send_message` | Enviar mensaje cifrado | `{ chatId, cipherText, mediaId?, ttlHours? }` |
| `message_delivered` | Confirmar que recibiste mensaje | `{ messageId }` |
| `typing` | Indicar que estás escribiendo | `{ chatId, isTyping }` |
| `join_chat` | Unirse a sala de chat | `{ chatId }` |
| `leave_chat` | Salir de sala de chat | `{ chatId }` |

### Servidor → Cliente (Tú recibes)

| Evento | Descripción | Cuándo se dispara |
|--------|-------------|------------------|
| `message_received` | Nuevo mensaje recibido | Alguien te envía mensaje |
| `message_sent` | Tu mensaje fue enviado | Tú enviaste un mensaje |
| `delivery_confirmation` | Mensaje fue entregado | Destinatario lo recibió |
| `user_online` | Usuario se conectó | Alguien se acaba de conectar |
| `user_offline` | Usuario se desconectó | Alguien se desconectó |
| `user_typing` | Alguién está escribiendo | Otro usuario escribe en el chat |

---

## 🔗 Conexión y Autenticación

### Paso 1: Instalar Socket.IO

```bash
# Flutter
flutter pub add socket_io_client

# React Native
npm install socket.io-client
```

### Paso 2: Conectar al WebSocket

**React Native/JavaScript:**

```javascript
import io from 'socket.io-client';

class SocketService {
  constructor(accessToken) {
    this.socket = null;
    this.accessToken = accessToken;
  }

  connect() {
    // Configurar conexión
    this.socket = io('http://your-backend:3000', {
      transports: ['websocket'], // Importante para móvil
      auth: { token: this.accessToken }, // Enviar JWT
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    this.socket.on('error', (error) => {
      console.error('⚠️ WebSocket error:', error);
    });

    // Escuchar nuevos mensajes
    this.socket.on('message_received', (data) => {
      console.log('📩 Nuevo mensaje:', data);
      // TODO: Descifrar y mostrar en UI
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
```

### Paso 3: Inicializar después del Login

```typescript
// Después de login exitoso
const loginWithCode = async (code) => {
  const response = await api.post('/auth/login-code', { loginCode: code });
  const { accessToken } = response.data;

  // Guardar token
  await AsyncStorage.setItem('accessToken', accessToken);

  // Conectar WebSocket
  const socketService = new SocketService(accessToken);
  socketService.connect();

  return response.data;
};
```

---

## 📩 Recibir Mensajes en Tiempo Real

### Flujo Completo

```
1. Backend emite: message_received
2. Cliente recibe evento
3. Cliente descifra cipherText con privateKey
4. Cliente muestra mensaje en UI
5. Cliente envía confirmación: message_delivered
```

### Implementación

**React Native/JavaScript:**

```javascript
this.socket.on('message_received', async (data) => {
  // 1. Descifrar el mensaje
  const decryptedText = decryptMessage(data.cipherText);

  // 2. Crear objeto de mensaje
  const newMessage = {
    id: data.id,
    chatId: data.chatId,
    senderId: data.senderId,
    text: decryptedText,
    createdAt: new Date(data.createdAt),
  };

  // 3. Notificar a la UI (Redux, MobX, Context, etc.)
  dispatch({ type: 'NEW_MESSAGE', payload: newMessage });

  // 4. Enviar confirmación de entrega
  this.socket.emit('message_delivered', {
    messageId: data.id
  });

  // 5. Mostrar notificación push si la app está en background
  // (usando react-native-push-notification)
});
```

---

## 📤 Enviar Mensajes

### Por WebSocket (Tiempo Real)

**React Native/JavaScript:**

```javascript
function sendMessage({ chatId, messageText, recipientPublicKey }) {
  // 1. Cifrar el mensaje
  const cipherText = encryptMessage(messageText, recipientPublicKey);

  // 2. Enviar por WebSocket
  this.socket.emit('send_message', {
    chatId,
    cipherText,
    mediaId: null, // Opcional
    ttlHours: null, // Opcional: mensaje temporal
  });

  // 3. Escuchar confirmación (una sola vez)
  this.socket.once('message_sent', (data) => {
    console.log('✅ Mensaje enviado:', data.id);
    // Actualizar UI con estado "enviado"
  });
}
```

### Por REST (Alternativa)

También puedes enviar por REST si WebSocket no está conectado:

```javascript
// Fallback a REST si WebSocket falla
async function sendMessageREST(chatId, cipherText) {
  const response = await api.post(`/chats/${chatId}/messages`, {
    cipherText,
  });
  return response.data;
}
```

---

## 🟢 Presencia (Online/Offline)

### Recibir Eventos de Presencia

```dart
// Usuario se conectó
_socket!.on('user_online', (data) {
  final userId = data['userId'];
  print('🟢 Usuario $userId está online');

  // Actualizar UI: mostrar indicador verde
  presenceController.setUserOnline(userId);
});

// Usuario se desconectó
_socket!.on('user_offline', (data) {
  final userId = data['userId'];
  print('🔴 Usuario $userId está offline');

  // Actualizar UI: mostrar indicador gris
  presenceController.setUserOffline(userId);
});
```

### Comprobar Estado de Usuario (REST)

```dart
// Obtener estado actual de un usuario
Future<bool> getUserPresence(String userId) async {
  final response = await api.get('/presence/$userId');
  return response.data['isOnline'];
}

// Obtener estado de múltiples usuarios
Future<Map<String, bool>> getBatchPresence(List<String> userIds) async {
  final response = await api.post('/presence/batch', { userIds });
  return response.data; // { userId1: true, userId2: false, ... }
}
```

### Heartbeat (Mantener conexión activa)

```dart
// Enviar heartbeat cada 4 minutos (TTL es 5 min)
Timer.periodic(Duration(minutes: 4), (timer) async {
  try {
    await api.post('/presence/heartbeat');
    print('💓 Heartbeat enviado');
  } catch (error) {
    print('⚠️ Error en heartbeat: $error');
  }
});
```

---

## ⌨️ Indicador de Escritura

### Mostrar "Escribiendo..." cuando alguien escribe

```dart
// Escuchar eventos de typing
_socket!.on('user_typing', (data) {
  final chatId = data['chatId'];
  final userId = data['userId'];
  final isTyping = data['isTyping'];

  if (isTyping) {
    print('✍️ Usuario $userId está escribiendo en $chatId');
    // Mostrar indicador en UI
    typingController.showTypingIndicator(chatId, userId);
  } else {
    // Ocultar indicador
    typingController.hideTypingIndicator(chatId, userId);
  }
});

// Enviar indicador cuando escribes
void sendTypingIndicator(String chatId, bool isTyping) {
  _socket!.emit('typing', {
    'chatId': chatId,
    'isTyping': isTyping,
  });
}

// Ejemplo en TextField
onChanged: (text) {
  if (text.isNotEmpty) {
    sendTypingIndicator(chatId, true);
  } else {
    sendTypingIndicator(chatId, false);
  }
}
```

### Debounce para no saturar

```dart
Timer? _typingTimer;

onChanged: (text) {
  // Cancelar timer anterior
  _typingTimer?.cancel();

  // Enviar "estoy escribiendo"
  sendTypingIndicator(chatId, true);

  // Después de 2 segundos sin escribir, enviar "ya no escribo"
  _typingTimer = Timer(Duration(seconds: 2), () {
    sendTypingIndicator(chatId, false);
  });
}
```

---

## 🎯 Ejemplos Completos

### Hook React Native Completo

```javascript
import { useEffect, useState, useCallback } from 'react';
import { AsyncStorage } from 'react-native';
import io from 'socket.io-client';

const useWebSocket = (currentChatId) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  // Conectar WebSocket
  useEffect(() => {
    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('accessToken');

      const socketInstance = io('http://10.0.2.2:3000', {
        transports: ['websocket'],
        auth: { token },
      });

      // Mensaje recibido
      socketInstance.on('message_received', (message) => {
        const decrypted = decryptMessage(message.cipherText);
        setMessages(prev => [...prev, { ...message, text: decrypted }]);

        // Confirmar entrega
        socketInstance.emit('message_delivered', { messageId: message.id });
      });

      // Mensaje enviado (confirmación)
      socketInstance.on('message_sent', (message) => {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        ));
      });

      // Confirmación de entrega
      socketInstance.on('delivery_confirmation', ({ messageId }) => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        ));
      });

      // Usuario escribiendo
      socketInstance.on('user_typing', ({ chatId, userId, isTyping }) => {
        if (chatId === currentChatId) {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: isTyping,
          }));
        }
      });

      // Usuario online
      socketInstance.on('user_online', ({ userId }) => {
        console.log('🟢 User online:', userId);
      });

      // Usuario offline
      socketInstance.on('user_offline', ({ userId }) => {
        console.log('🔴 User offline:', userId);
      });

      setSocket(socketInstance);
    };

    connectSocket();

    return () => {
      socket?.disconnect();
    };
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (chatId, text, recipientPublicKey) => {
    const cipherText = encryptMessage(text, recipientPublicKey);

    socket.emit('send_message', {
      chatId,
      cipherText,
    });
  }, [socket]);

  // Indicador de escritura
  const sendTypingIndicator = useCallback((chatId, isTyping) => {
    socket?.emit('typing', { chatId, isTyping });
  }, [socket]);

  return {
    socket,
    messages,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
  };
};

export default useWebSocket;
```

### Uso en Componente

```javascript
import React, { useState } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import useWebSocket from './hooks/useWebSocket';

const ChatScreen = ({ route }) => {
  const { chatId, recipientPublicKey } = route.params;
  const [text, setText] = useState('');
  const { messages, typingUsers, sendMessage, sendTypingIndicator } = useWebSocket(chatId);

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage(chatId, text, recipientPublicKey);
    setText('');
  };

  return (
    <View>
      <FlatList
        data={messages.filter(m => m.chatId === chatId)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} />
        )}
      />

      {typingUsers[recipientUserId] && (
        <Text>💬 Escribiendo...</Text>
      )}

      <TextInput
        value={text}
        onChangeText={(newText) => {
          setText(newText);
          sendTypingIndicator(chatId, newText.length > 0);
        }}
        placeholder="Escribe un mensaje..."
      />
    </View>
  );
};
```

---

## ⚠️ Consideraciones Importantes

### Reconexión Automática

Socket.IO reconecta automáticamente por defecto, pero puedes configurarlo:

```javascript
this.socket = io('http://server:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  reconnectionDelayMax: 5000,
});
```

### Manejo de Background

En móvil, cuando la app va a background, el WebSocket puede desconectarse:

```dart
// AppLifecycleDetector en Flutter
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
  if (state == AppLifecycleState.resumed) {
    // App volvió a primer plano
    _socketService.connect();
  } else if (state == AppLifecycleState.paused) {
    // App pasó a background
    _socketService.disconnect();
  }
}
```

### Salas de Chat

Útil para recibir mensajes solo de chats específicos:

```javascript
// Unirse a sala
socket.emit('join_chat', { chatId: 'chat-123' });

// Salir de sala
socket.emit('leave_chat', { chatId: 'chat-123' });
```

### Debugging

```javascript
// Habilitar logs de Socket.IO
const socket = io('http://server:3000', {
  transports: ['websocket'],
  auth: { token },
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión:', error);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Reconectando, intento:', attemptNumber);
});

socket.on('reconnect_failed', () => {
  console.log('❌ No se pudo reconectar');
});
```

---

## 📖 Librerías Necesarias

### Flutter

```yaml
dependencies:
  flutter:
    sdk: flutter

  # WebSocket
  socket_io_client: ^2.0.0

  # Almacenamiento seguro
  flutter_secure_storage: ^8.0.0

  # Criptografía
  encrypt: ^5.0.0

  # Notificaciones (para background)
  flutter_local_notifications: ^15.0.0
```

### React Native

```json
{
  "dependencies": {
    "socket.io-client": "^4.5.0",
    "@react-native-async-storage/async-storage": "^1.18.0",
    "expo-secure-store": "^12.0.0",
    "react-native-push-notification": "^8.1.1"
  }
}
```

---

## 🧪 Testing

### Verificar WebSocket

```javascript
// 1. Conectar
socket.on('connect', () => {
  console.log('✅ Conectado al WebSocket');
});

// 2. Enviar mensaje de prueba
socket.emit('send_message', {
  chatId: 'test-chat-id',
  cipherText: 'encrypted-test',
});

// 3. Verificar que recibes confirmación
socket.on('message_sent', (data) => {
  console.log('✅ Confirmación recibida:', data);
});

// 4. Verificar que el backend emite message_received
socket.on('message_received', (data) => {
  console.log('📩 Mensaje recibido:', data);
});
```

### Testing con Socket.IO Client

```bash
# Instalar cliente de testing
npm install -g socket.io-client

# Conectar y probar
node test-websocket.js
```

```javascript
// test-websocket.js
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' },
});

socket.on('connect', () => {
  console.log('✅ Conectado');

  // Enviar mensaje de prueba
  socket.emit('send_message', {
    chatId: 'chat-id',
    cipherText: 'test-encrypted',
  });
});

socket.on('message_received', (data) => {
  console.log('Mensaje recibido:', data);
});
```
