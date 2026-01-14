/**
 * Pantalla de Conversación Individual
 * Muestra los mensajes de una conversación y permite enviar nuevos
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunicationStackParamList, Message } from '../../types';
import { useAppStore } from '../../store/useAppStore';

type NavigationProps = NativeStackNavigationProp<CommunicationStackParamList, 'Conversation'>;
type RouteProps = RouteProp<CommunicationStackParamList, 'Conversation'>;

interface MessageBubbleProps {
  content: string;
  isFromUser: boolean;
  timestamp: Date;
  isTemporary?: boolean;
}

/**
 * Componente de burbuja de mensaje
 */
const MessageBubble = ({
  content,
  isFromUser,
  timestamp,
  isTemporary,
}: MessageBubbleProps): React.JSX.Element => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.messageBubble,
        isFromUser ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          isFromUser ? styles.userMessageText : styles.otherMessageText,
        ]}
      >
        {content}
      </Text>

      <View
        style={[
          styles.messageFooter,
          isFromUser ? styles.userMessageFooter : styles.otherMessageFooter,
        ]}
      >
        <Text
          style={[
            styles.messageTime,
            isFromUser ? styles.userMessageTime : styles.otherMessageTime,
          ]}
        >
          {formatTime(timestamp)}
        </Text>

        {isTemporary && (
          <Text style={styles.temporaryIndicator}>⏱ {isTemporary}</Text>
        )}
      </View>
    </View>
  );
};

/**
 * Pantalla de conversación individual
 */
const ConversationScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { conversationId } = route.params;

  // Estado local para el input de mensaje
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Obtener datos de la conversación desde el store
  const { conversations, addMessage, setActiveConversation } = useAppStore();

  // Encontrar la conversación actual
  const activeConversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    // Establecer la conversación como activa al cargar la pantalla
    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);

  /**
   * Envía un nuevo mensaje
   */
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      return;
    }

    // Agregar el mensaje al store
    addMessage(conversationId, messageText, true);

    // Limpiar el input
    setMessageText('');

    // Simular respuesta automática después de 1 segundo
    setTimeout(() => {
      const responses = [
        '¡Mensaje recibido!',
        'Gracias por tu mensaje',
        'Entendido, te responderé pronto',
        '¡Interesante!',
        '¡Claro que sí!',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(conversationId, randomResponse, false);
    }, 1000);
  };

  /**
   * Renderiza cada mensaje
   */
  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <MessageBubble
        content={item.content}
        isFromUser={item.isFromUser}
        timestamp={item.timestamp}
        isTemporary={item.isTemporary}
      />
    );
  };

  /**
   * Header personalizado con botón de configuración
   */
  const ReactHeaderRight = () => {
    return (
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('ConversationSettings', { conversationId })}
        style={styles.headerButton}
      >
        <Text style={styles.headerButtonText}>⚙️</Text>
      </TouchableOpacity>
    );
  };

  // Establecer header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: activeConversation?.name || 'Conversación',
      headerRight: () => <ReactHeaderRight />,
    });
  }, [navigation, activeConversation]);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeConversation?.messages.length]);

  if (!activeConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversación no encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Lista de Mensajes */}
        <FlatList
          ref={flatListRef}
          data={activeConversation.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay mensajes aún</Text>
              <Text style={styles.emptySubtext}>¡Inicia la conversación!</Text>
            </View>
          }
        />

        {/* Input de Mensaje */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => console.log('Adjuntar archivo (solo UI)')}
            activeOpacity={0.7}
          >
            <Text style={styles.attachButtonText}>📎</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D32',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  userMessageFooter: {
    justifyContent: 'flex-end',
  },
  otherMessageFooter: {
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#999',
  },
  temporaryIndicator: {
    fontSize: 10,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  attachButton: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  attachButtonText: {
    fontSize: 18,
  },
  headerButton: {
    marginRight: 15,
  },
  headerButtonText: {
    fontSize: 20,
  },
});

export default ConversationScreen;
