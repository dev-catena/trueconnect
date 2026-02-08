import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
// import { TextInputMask } from 'react-native-masked-text';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useUser();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!cpf || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsSubmitting(true);
      // Remove formatação do CPF
      const cleanCpf = cpf.replace(/[^\d]/g, '');
      await login(cleanCpf, password);
      // Navegação será feita automaticamente pelo AppNavigator quando user for definido
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Usuário ou senha inválidos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text style={styles.title}>TrueConnect</Text>
        <Image
          source={require('../../../../assets/images/trustme-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.formContainer}>
          <TextInput
            value={cpf}
            onChangeText={setCpf}
            placeholder="123.456.789-00"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="numeric"
            maxLength={14}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              placeholderTextColor="#999"
              style={styles.input}
              secureTextEntry={!isPasswordVisible}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Text>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('NewPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {isSubmitting || isLoading ? (
            <ActivityIndicator size="large" color={CustomColors.activeColor} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: CustomColors.black,
  },
  logo: {
    height: 100,
    width: 200,
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: CustomColors.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: CustomColors.activeColor,
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 16,
    padding: 12,
  },
  forgotPasswordText: {
    color: CustomColors.activeColor,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 8,
    padding: 12,
  },
  registerButtonText: {
    color: CustomColors.activeColor,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;

