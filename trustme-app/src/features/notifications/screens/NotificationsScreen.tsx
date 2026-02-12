import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomColors } from '../../../core/colors';

const NotificationsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.subtitle}>Você não tem notificações no momento</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
});

export default NotificationsScreen;





