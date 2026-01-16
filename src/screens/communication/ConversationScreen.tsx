/**
 * Pantalla de Conversación Individual
 * Muestra los mensajes cifrados E2EE de una conversación
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommunicationStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { messageService } from '../../services';

type NavigationProps = NativeStackNavigationProp<
  CommunicationStackParamList,
  'Conversation'
>;
type RouteProps = RouteProp<CommunicationStackParamList, 'Conversation'>;

interface MessageBubbleProps {
  content: string;
  isFromUser: boolean;
  timestamp: string;
  isEncrypted?: boolean;
}

/**
 * Componente de burbuja de mensaje
 */
const MessageBubble = ({
  content,
  isFromUser,
  timestamp,
  isEncrypted,
}: MessageBubbleProps): React.JSX.Element => {
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <View
      style={[
        styles.messageBubble,
        isFromUser ? styles.userMessage : styles.otherMessage,
      ]}
    >
      {isEncrypted && (
        <View style={styles.encryptedBadge}>
          <Icon name="lock" size={12} color="#10B981" />
          <Text style={styles.encryptedText}>E2EE</Text>
        </View>
      )}

      <Text
        style={[
          styles.messageText,
          isFromUser ? styles.userMessageText : styles.otherMessageText,
        ]}
      >
        {content}
      </Text>

      <Text
        style={[
          styles.messageTime,
          isFromUser ? styles.userMessageTime : styles.otherMessageTime,
        ]}
      >
        {formatTime(timestamp)}
      </Text>
    </View>
  );
};

/**
 * Pantalla de conversación individual
 */
const ConversationScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { chatId } = route.params;

  // Estado local
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Obtener datos del store
  const { chats, messages, user, loadMessages } = useAppStore();

  // Encontrar el chat actual
  const currentChat = chats.find(c => c.id === chatId);
  const chatMessages = messages[chatId] || [];

  useEffect(() => {
    loadChatMessages();
  }, [chatId]);

  const loadChatMessages = async () => {
    try {
      setLoading(true);
      await loadMessages(chatId);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envía un nuevo mensaje cifrado
   */
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChat || !user) {
      return;
    }

    try {
      setSending(true);

      // Obtener clave pública del destinatario
      const recipientPublicKey = currentChat.participant?.publicKey;

      if (!recipientPublicKey) {
        console.error('No se encontró la clave pública del destinatario');
        return;
      }

      // Enviar mensaje cifrado
      await messageService.sendMessage({
        chatId,
        message: messageText,
        recipientPublicKey,
      });

      console.log('✅ Mensaje cifrado enviado');

      // Limpiar input
      setMessageText('');

      // Recargar mensajes
      await loadChatMessages();

      // Scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  /**
   * Renderiza cada mensaje
   */
  const renderMessage = ({ item }: { item: any }) => {
    const isFromUser = item.senderId === user?.id;

    return (
      <MessageBubble
        content={item.decryptedText || '[Cifrado]'}
        isFromUser={isFromUser}
        timestamp={item.createdAt}
        isEncrypted={true}
      />
    );
  };

  /**
   * Header personalizado con título del chat
   */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: currentChat?.participant?.name || 'Chat Seguro',
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            (navigation as any).navigate('ConversationSettings', { chatId })
          }
          style={styles.headerButton}
        >
          <Icon name="cog" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentChat]);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages?.length]);

  if (!currentChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>Chat no encontrado</Text>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Descifrando mensajes...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="message-lock" size={64} color="#475569" />
                <Text style={styles.emptyText}>No hay mensajes aún</Text>
                <Text style={styles.emptySubtext}>
                  Todos los mensajes están cifrados E2EE
                </Text>
              </View>
            }
          />
        )}

        {/* Input de Mensaje */}
        <View style={styles.inputContainer}>
          <Icon
            name="lock"
            size={18}
            color="#10B981"
            style={styles.lockInputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mensaje cifrado..."
            placeholderTextColor="#64748B"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            editable={!sending}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  encryptedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  otherMessageTime: {
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#475569',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  lockInputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
  },
  headerButton: {
    marginRight: 12,
  },
});

export default ConversationScreen;
