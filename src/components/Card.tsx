/**
 * Componente de Card Reutilizable
 * Contenedor con estilo de tarjeta
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  shadow?: boolean;
}

/**
 * Componente de Card reutilizable
 */
const Card = ({
  children,
  title,
  style,
  onPress,
  padding = 15,
  shadow = true,
}: CardProps): React.JSX.Element => {
  const cardContent = (
    <>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </>
  );

  const cardStyles = [
    styles.card,
    { padding },
    !shadow && styles.cardNoShadow,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{cardContent}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardNoShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
});

export default Card;
