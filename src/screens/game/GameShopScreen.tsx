/**
 * Pantalla de Tienda del Modo Juego
 * Sistema de compras con power-ups, vidas y monedas
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Icon, GradientButton, Card } from '../../components';

type NavigationProps = NativeStackNavigationProp<GameStackParamList, 'GameShop'>;

// Tipos de items de tienda
type ShopCategory = 'powerups' | 'lives' | 'coins' | 'skins';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: ShopCategory;
  color: string;
  effect?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Power-ups
  {
    id: 'double_score',
    name: 'Doble Puntuación',
    description: 'x2 puntos durante 60 segundos',
    price: 50,
    icon: 'trending-up',
    category: 'powerups',
    color: Colors.primary,
    effect: '¡Doble puntuación activada!',
  },
  {
    id: 'shield',
    name: 'Escudo',
    description: 'Protección contra bombas',
    price: 75,
    icon: 'shield-checkmark',
    category: 'powerups',
    color: Colors.info,
    effect: '¡Escudo activado!',
  },
  {
    id: 'time_extend',
    name: 'Extra Tiempo',
    description: '+30 segundos en el juego',
    price: 100,
    icon: 'time',
    category: 'powerups',
    color: Colors.warning,
    effect: '¡Tiempo extendido!',
  },
  // Vidas
  {
    id: 'life_1',
    name: '+1 Vida',
    description: 'Recupera una vida',
    price: 25,
    icon: 'heart',
    category: 'lives',
    color: Colors.danger,
  },
  {
    id: 'life_3',
    name: '+3 Vidas',
    description: 'Pack de 3 vidas',
    price: 60,
    icon: 'heart',
    category: 'lives',
    color: Colors.danger,
  },
  {
    id: 'life_unlimited',
    name: 'Vidas Infinitas',
    description: 'Por 24 horas',
    price: 500,
    icon: 'infinite',
    category: 'lives',
    color: Colors.danger,
  },
  // Monedas
  {
    id: 'coins_100',
    name: '100 Monedas',
    description: 'Pack pequeño',
    price: 0,
    icon: 'cash',
    category: 'coins',
    color: Colors.success,
  },
  {
    id: 'coins_500',
    name: '500 Monedas',
    description: 'Pack mediano',
    price: 0,
    icon: 'cash',
    category: 'coins',
    color: Colors.success,
  },
  {
    id: 'coins_1000',
    name: '1000 Monedas',
    description: '¡Mejor valor!',
    price: 0,
    icon: 'cash',
    category: 'coins',
    color: Colors.success,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'apps' },
  { id: 'powerups', name: 'Power-ups', icon: 'flash' },
  { id: 'lives', name: 'Vidas', icon: 'heart' },
  { id: 'coins', name: 'Monedas', icon: 'cash' },
];

const GameShopScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NavigationProps>();
  const { coins, addCoins, addNotification } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  // Valores de animación
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // Animación de entrada
  React.useEffect(() => {
    opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  /**
   * Filtrar items por categoría
   */
  const filteredItems = SHOP_ITEMS.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  /**
   * Manejar compra de item
   */
  const handlePurchase = (item: ShopItem) => {
    if (item.price > coins) {
      Alert.alert(
        'Monedas Insuficientes',
        'No tienes suficientes monedas para comprar este item.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `¿Comprar ${item.name} por ${item.price} monedas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => {
            // Restar monedas (simulado - en producción usar store)
            // addCoins(-item.price);

            // Agregar a comprados
            setPurchasedItems([...purchasedItems, item.id]);

            // Mostrar notificación
            addNotification({
              title: '¡Compra Exitosa!',
              message: item.effect || `Has comprado ${item.name}`,
              type: 'reward',
            });

            // Mostrar alerta de éxito
            Alert.alert(
              '¡Compra Exitosa!',
              item.effect || `Has comprado ${item.name}`,
              [{ text: '¡Genial!', style: 'default' }]
            );
          },
        },
      ]
    );
  };

  /**
   * Verificar si un item está comprado
   */
  const isPurchased = (itemId: string) => purchasedItems.includes(itemId);

  /**
   * Renderizar un item de tienda
   */
  const renderShopItem = (item: ShopItem) => {
    const canAfford = coins >= item.price;
    const purchased = isPurchased(item.id);

    return (
      <Card key={item.id} style={styles.itemCard} variant="elevated">
        <View style={styles.itemContent}>
          {/* Icono del item */}
          <View style={[styles.itemIconContainer, { backgroundColor: item.color + '20' }]}>
            <Icon name={item.name.includes('Infinitas') ? 'infinite' : item.icon as any} size="xl" color={item.color} />
          </View>

          {/* Información del item */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>

            {/* Precio */}
            <View style={styles.priceContainer}>
              <Icon name="cash" size="sm" color={Colors.success} />
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          </View>

          {/* Botón de compra */}
          <TouchableOpacity
            style={[
              styles.buyButton,
              !canAfford && styles.buyButtonDisabled,
              purchased && styles.buyButtonPurchased,
            ]}
            onPress={() => handlePurchase(item)}
            disabled={!canAfford || purchased}
            activeOpacity={0.8}
          >
            <Icon
              name={purchased ? 'checkmark' : 'cart'}
              size="md"
              color={purchased ? Colors.textWhite : Colors.textWhite}
            />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  /**
   * Renderizar selector de categoría
   */
  const renderCategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContent}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              isSelected && styles.categoryButtonSelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Icon
              name={category.icon as any}
              size="md"
              color={isSelected ? Colors.textWhite : Colors.textSecondary}
            />
            <Text
              style={[
                styles.categoryButtonText,
                isSelected && styles.categoryButtonTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedStyle}>
          {/* Header con saldo de monedas */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size="lg" color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Icon name="storefront" size="xl" color={Colors.primary} />
              <Text style={styles.headerTitle}>Tienda</Text>
            </View>

            <View style={styles.balanceContainer}>
              <Icon name="cash" size="md" color={Colors.success} />
              <Text style={styles.balanceText}>{coins}</Text>
            </View>
          </View>

          {/* Selector de categorías */}
          {renderCategorySelector()}

          {/* Items de tienda */}
          <View style={styles.itemsContainer}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => renderShopItem(item))
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="sad" size="5xl" color={Colors.textLight} />
                <Text style={styles.emptyText}>No hay items disponibles</Text>
              </View>
            )}
          </View>

          {/* Footer informativo */}
          <View style={styles.footer}>
            <Icon name="information-circle" size="md" color={Colors.info} />
            <Text style={styles.footerText}>
              Los power-ups se activan automáticamente en el próximo juego
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.heading.large,
    color: Colors.text,
    fontWeight: '700',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  balanceText: {
    ...Typography.label.large,
    color: Colors.success,
    fontWeight: '700',
  },
  categoryScroll: {
    marginBottom: Spacing.lg,
  },
  categoryContent: {
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    ...Typography.label.regular,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: Colors.textWhite,
  },
  itemsContainer: {
    gap: Spacing.md,
  },
  itemCard: {
    padding: Spacing.md,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.label.large,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  itemDescription: {
    ...Typography.body.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceText: {
    ...Typography.label.large,
    color: Colors.success,
    fontWeight: '700',
  },
  buyButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    ...Shadows.md,
  },
  buyButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  buyButtonPurchased: {
    backgroundColor: Colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyText: {
    ...Typography.body.regular,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  footerText: {
    ...Typography.body.small,
    color: Colors.infoDark,
    flex: 1,
  },
});

export default GameShopScreen;
