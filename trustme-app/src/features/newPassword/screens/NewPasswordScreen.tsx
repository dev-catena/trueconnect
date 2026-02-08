import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomColors } from '../../../core/colors';

const NewPasswordScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Senha</Text>
      {/* Implementar formulário de nova senha */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NewPasswordScreen;


