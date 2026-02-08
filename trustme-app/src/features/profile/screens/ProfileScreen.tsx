import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import FormInput from '../../../components/forms/FormInput';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useUser();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLogout = async () => {
    await logout();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'A senha deve ter no mínimo 8 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'A nova senha deve ser diferente da senha atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.put('user/profile', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (response.success) {
        Alert.alert(
          'Sucesso',
          'Senha alterada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrors({});
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível alterar a senha');
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.password?.[0] ||
                          'Não foi possível alterar a senha. Verifique se a senha atual está correta.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Perfil</Text>
        
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.nome_completo || user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.nome_completo || user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {!showChangePassword ? (
          <>
            <TouchableOpacity 
              style={styles.mySealsButton} 
              onPress={() => navigation.navigate('MySeals')}
            >
              <SafeIcon name="shield" size={20} color={CustomColors.white} />
              <Text style={styles.mySealsButtonText}>Meus Selos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mySealsButton} 
              onPress={() => navigation.navigate('MyConnections')}
            >
              <SafeIcon name="connections" size={20} color={CustomColors.white} />
              <Text style={styles.mySealsButtonText}>Minhas Conexões</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mySealsButton} 
              onPress={() => navigation.navigate('MyContracts')}
            >
              <SafeIcon name="document-text" size={20} color={CustomColors.white} />
              <Text style={styles.mySealsButtonText}>Meus Contratos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.changePasswordButton} 
              onPress={() => setShowChangePassword(true)}
            >
              <SafeIcon name="lock" size={20} color={CustomColors.white} />
              <Text style={styles.changePasswordButtonText}>Alterar Senha</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.passwordForm}>
            <Text style={styles.sectionTitle}>Alterar Senha</Text>
            
            <View style={styles.passwordInputContainer}>
              <FormInput
                label="Senha Atual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Digite sua senha atual"
                secureTextEntry={!showCurrentPassword}
                error={errors.currentPassword}
                required
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <SafeIcon
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={CustomColors.activeGreyed}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputContainer}>
              <FormInput
                label="Nova Senha"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Digite sua nova senha"
                secureTextEntry={!showNewPassword}
                error={errors.newPassword}
                required
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <SafeIcon
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={CustomColors.activeGreyed}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputContainer}>
              <FormInput
                label="Confirmar Nova Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme sua nova senha"
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                required
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <SafeIcon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={CustomColors.activeGreyed}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrors({});
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={CustomColors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <SafeIcon name="logout" size={20} color={CustomColors.white} />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: CustomColors.black,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: CustomColors.black,
  },
  email: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  mySealsButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mySealsButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  changePasswordButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  changePasswordButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  passwordForm: {
    backgroundColor: CustomColors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: CustomColors.black,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 32,
    padding: 8,
    zIndex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CustomColors.activeGreyed,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: CustomColors.activeGreyed,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    backgroundColor: CustomColors.vividRed,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;

