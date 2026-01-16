/**
 * Pantalla de Lista de Conversaciones
 * Muestra todas las conversaciones disponibles con diseño moderno
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommunicationStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import useAppNavigation from '../../hooks/useNavigation';

type NavigationProps = NativeStackNavigationProp<
  CommunicationStackParamList,
  'ConversationList'
>;

/**
 * Pantalla principal de lista de conversaciones
 */
const ConversationListScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const { chats, loadChats, logout } = useAppStore();

  useEffect(() => {
    loadChats();
  }, []);

  // Función del botón de pánico
  const handlePanicButton = () => {
    Alert.alert(
      '⚠️ Salida de Emergencia',
      '¿Volver al modo de juegos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            console.log('🚨 Botón de pánico activado');
            logout();
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Obtener iniciales para avatares sin foto
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Colores para avatares
  const avatarColors = [
    ['#667eea', '#764ba2'], // púrpura
    ['#f093fb', '#f5576c'], // rosa
    ['#4facfe', '#00f2fe'], // azul
    ['#43e97b', '#38f9d7'], // verde
    ['#fa709a', '#fee140'], // naranja
  ];

  /**
   * Navega a una conversación específica
   */
  const handleConversationPress = (chatId: string) => {
    (navigation as any).navigate('Conversation', { chatId });
  };

  /**
   * Renderiza cada conversación
   */
  const renderConversation = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const colors = avatarColors[index % avatarColors.length];

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id)}
        activeOpacity={0.8}
      >
        {item.participant?.avatarUrl ? (
          <Image
            source={{ uri: item.participant.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <LinearGradient
            colors={colors}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {getInitials(item.participant?.name || 'U')}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>
              {item.participant?.name || 'Usuario'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.messageRow}>
            <Icon
              name="lock"
              size={14}
              color="#64748B"
              style={styles.lockIcon}
            />
            <Text style={styles.conversationLastMessage} numberOfLines={1}>
              {item.lastMessage?.text || 'Mensaje cifrado'}
            </Text>
          </View>
        </View>

        <Text style={styles.conversationTime}>
          {item.lastMessage?.createdAt
            ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversaciones</Text>
        <Icon name="shield-lock" size={24} color="#64748B" />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Icon
          name="magnify"
          size={20}
          color="#64748B"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversaciones..."
          placeholderTextColor="#64748B"
        />
      </View>

      {/* Lista de conversaciones */}
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderConversation}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="message-lock" size={64} color="#475569" />
          <Text style={styles.emptyText}>No tienes conversaciones</Text>
          <Text style={styles.emptySubtext}>
            Tus conversaciones cifradas aparecerán aquí
          </Text>
        </View>
      )}

      {/* Botón de pánico flotante */}
      <TouchableOpacity
        style={styles.panicButton}
        onPress={handlePanicButton}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.panicGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="exit-run" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Fondo oscuro navy/azul
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100, // Espacio para el botón flotante
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 6,
  },
  conversationLastMessage: {
    fontSize: 15,
    color: '#64748B',
    flex: 1,
  },
  conversationTime: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#475569',
  },
  panicButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  panicGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConversationListScreen;
