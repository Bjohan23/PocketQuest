/**
 * Pantalla de Lista de Conversaciones
 * Muestra todas las conversaciones disponibles
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunicationStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import useAppNavigation from '../../hooks/useNavigation';

type NavigationProps = NativeStackNavigationProp<CommunicationStackParamList, 'ConversationList'>;

interface ConversationItemProps {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  onlineStatus: 'online' | 'offline' | 'away';
  onPress: () => void;
}

/**
 * Componente de item de conversación
 */
const ConversationItem = ({
  name,
  lastMessage,
  lastMessageTime,
  unreadCount,
  onlineStatus,
  onPress,
}: ConversationItemProps): React.JSX.Element => {
  const formatTime = (date?: Date): string => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    switch (onlineStatus) {
      case 'online':
        return '#4CAF50';
      case 'away':
        return '#FF9800';
      case 'offline':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <TouchableOpacity style={styles.conversationItem} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={[styles.onlineStatus, { backgroundColor: getStatusColor() }]} />
      </View>

      {/* Contenido */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{name}</Text>
          {lastMessageTime && (
            <Text style={styles.conversationTime}>
              {formatTime(lastMessageTime)}
            </Text>
          )}
        </View>

        <View style={styles.conversationFooter}>
          <Text
            style={[styles.conversationLastMessage, unreadCount > 0 && styles.messageUnread]}
            numberOfLines={1}
          >
            {lastMessage || 'Sin mensajes'}
          </Text>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Pantalla principal de lista de conversaciones
 */
const ConversationListScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const { goToGameMode } = useAppNavigation();

  // Obtener conversaciones desde el store
  const { conversations } = useAppStore();

  /**
   * Navega a una conversación específica
   */
  const handleConversationPress = (conversationId: string) => {
    (navigation as any).navigate('Conversation', { conversationId });
  };

  /**
   * Renderiza cada conversación
   */
  const renderConversation = ({ item }: { item: typeof conversations[0] }) => {
    return (
      <ConversationItem
        id={item.id}
        name={item.name}
        lastMessage={item.lastMessage}
        lastMessageTime={item.lastMessageTime}
        unreadCount={item.unreadCount}
        onlineStatus={item.onlineStatus}
        onPress={() => handleConversationPress(item.id)}
      />
    );
  };

  /**
   * Header personalizado con botón para volver al juego
   */
  const ReactHeaderLeft = () => {
    return (
      <TouchableOpacity onPress={goToGameMode} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>🎮 Juego</Text>
      </TouchableOpacity>
    );
  };

  // Establecer el header left
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <ReactHeaderLeft />,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversaciones</Text>
        <Text style={styles.headerSubtitle}>
          {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
        </Text>
      </View>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes conversaciones</Text>
          <Text style={styles.emptySubtext}>
            Tus conversaciones aparecerán aquí
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  headerButton: {
    marginLeft: 15,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  messageUnread: {
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
  },
});

export default ConversationListScreen;
