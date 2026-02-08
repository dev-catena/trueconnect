import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomColors } from '../core/colors';
import SafeIcon from './SafeIcon';

interface HeaderLineProps {
  title: string;
  icon?: string;
}

const HeaderLine: React.FC<HeaderLineProps> = ({ title, icon = 'document-text' }) => {
  // Se o icon for um emoji (contém caracteres não-ASCII), usar como texto
  // Caso contrário, usar SafeIcon
  const isEmoji = icon && /[\u{1F300}-\u{1F9FF}]/u.test(icon);
  
  return (
    <View style={styles.container}>
      {isEmoji ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : (
        <SafeIcon name={icon} size={28} color={CustomColors.activeColor} />
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
});

export default HeaderLine;


