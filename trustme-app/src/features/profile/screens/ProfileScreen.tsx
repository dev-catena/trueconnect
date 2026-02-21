import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import FormInput from '../../../components/forms/FormInput';
import { formatUserCodeDisplay } from '../../../utils/formatters';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';
import * as ImagePicker from 'expo-image-picker';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, setUser, refreshUserData } = useUser();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
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

  const handleSelectPhoto = () => {
    Alert.alert(
      'Selecionar Foto',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => pickImage('camera') },
        { text: 'Galeria', onPress: () => pickImage('gallery') },
        user?.caminho_foto ? { text: 'Remover Foto', style: 'destructive', onPress: handleRemovePhoto } : null,
      ].filter(Boolean) as any
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      const permissionResult = source === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'É necessário permitir o acesso à câmera/galeria para adicionar uma foto.');
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadPhoto = async (imageUri: string) => {
    setUploadingPhoto(true);
    try {
      const api = new ApiProvider(true);
      
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Usar axios diretamente para enviar com o campo 'foto'
      const axios = require('axios');
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      
      const token = await AsyncStorage.getItem('authToken');
      const { API_BASE_URL } = require('../../../utils/constants');
      const BASE_URL = API_BASE_URL;
      
      const formData = new FormData();
      formData.append('foto', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await axios.post(`${BASE_URL}/usuario/foto/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success || response.data.message) {
        console.log('📸 Resposta do upload:', JSON.stringify(response.data, null, 2));
        
        // Usar caminho_foto da resposta se disponível
        let caminhoFotoFromResponse = null;
        if (response.data.result?.caminho_foto) {
          caminhoFotoFromResponse = response.data.result.caminho_foto;
        } else if (response.data.caminho_foto) {
          caminhoFotoFromResponse = response.data.caminho_foto;
        } else if (response.data.result?.user?.caminho_foto) {
          caminhoFotoFromResponse = response.data.result.user.caminho_foto;
        }
        
        // Buscar dados atualizados do usuário do backend
        const apiWithToken = new ApiProvider(true);
        const userResponse = await apiWithToken.get('usuario/dados');
        
        if (userResponse && typeof userResponse === 'object') {
          const updatedUserData = (userResponse.result || userResponse) as User;
          if (updatedUserData && updatedUserData.id) {
            // Garantir que o código seja sempre uma string de 6 dígitos
            if (updatedUserData.codigo) {
              const codigoStr = String(updatedUserData.codigo).trim();
              updatedUserData.codigo = codigoStr.length > 6 
                ? codigoStr.slice(-6) 
                : codigoStr.padStart(6, '0');
            }
            
            // Usar caminho_foto da resposta do upload se disponível, senão usar do usuarioDados
            if (caminhoFotoFromResponse) {
              updatedUserData.caminho_foto = caminhoFotoFromResponse;
              console.log('📸 Usando caminho_foto da resposta do upload:', caminhoFotoFromResponse);
            }
            
            // Construir URL completa da foto se necessário
            if (updatedUserData.caminho_foto) {
              if (!updatedUserData.caminho_foto.startsWith('http')) {
                const { BACKEND_BASE_URL } = require('../../../utils/constants');
                updatedUserData.caminho_foto = BACKEND_BASE_URL + (updatedUserData.caminho_foto.startsWith('/') ? updatedUserData.caminho_foto : '/' + updatedUserData.caminho_foto);
              }
              console.log('👤 Usuário atualizado com foto:', updatedUserData.caminho_foto);
              console.log('📸 Dados completos do usuário:', JSON.stringify({
                id: updatedUserData.id,
                nome: updatedUserData.nome_completo,
                caminho_foto: updatedUserData.caminho_foto,
              }, null, 2));
            } else {
              console.log('⚠️ Usuário não tem caminho_foto após upload');
              console.log('📸 Dados do usuário recebidos:', JSON.stringify({
                id: updatedUserData.id,
                nome: updatedUserData.nome_completo,
                campos: Object.keys(updatedUserData),
              }, null, 2));
            }
            
            // Atualizar estado e storage
            await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
            setUser(updatedUserData);
            
            // Forçar re-render adicionando um pequeno delay
            setTimeout(() => {
              setUser({ ...updatedUserData });
            }, 100);
          }
        }
        
        Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar a foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setUploadingPhoto(true);
            try {
              const api = new ApiProvider(true);
              await api.delete('usuario/foto/remover');
              await refreshUserData();
              Alert.alert('Sucesso', 'Foto removida com sucesso!');
            } catch (error: any) {
              console.error('Erro ao remover foto:', error);
              Alert.alert('Erro', 'Não foi possível remover a foto.');
            } finally {
              setUploadingPhoto(false);
            }
          },
        },
      ]
    );
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
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.userInfo}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleSelectPhoto}
            disabled={uploadingPhoto}
          >
            {user?.caminho_foto ? (
              <Image 
                key={`photo-${user.id}-${user.caminho_foto}`} // Forçar reload quando caminho_foto mudar
                source={{ 
                  uri: (() => {
                    let fotoUrl = user.caminho_foto;
                    if (!fotoUrl.startsWith('http')) {
                      const { BACKEND_BASE_URL } = require('../../../utils/constants');
                      const BASE_URL = BACKEND_BASE_URL;
                      fotoUrl = BASE_URL + (fotoUrl.startsWith('/') ? fotoUrl : '/' + fotoUrl);
                    }
                    if (__DEV__) {
                      console.log('🖼️ URL da foto no ProfileScreen:', fotoUrl);
                      console.log('🖼️ user.caminho_foto original:', user.caminho_foto);
                    }
                    return fotoUrl;
                  })()
                }}
                style={styles.avatarImage}
                onError={(error) => {
                  console.error('❌ Erro ao carregar foto:', error.nativeEvent?.error || error);
                  console.error('❌ URL que falhou:', user.caminho_foto);
                }}
                onLoad={() => {
                  if (__DEV__) {
                    console.log('✅ Foto carregada com sucesso no ProfileScreen');
                  }
                }}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.nome_completo || user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {uploadingPhoto ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color={CustomColors.white} />
              </View>
            ) : (
              <View style={styles.avatarEditIcon}>
                <SafeIcon name="camera" size={20} color={CustomColors.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{user?.nome_completo || user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          {/* Código de Conexão */}
          {user?.codigo && (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Meu Código de Conexão</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>
                  {formatUserCodeDisplay(user.codigo)}
                </Text>
              </View>
              <Text style={styles.codeHint}>
                Compartilhe este código para receber solicitações de conexão
              </Text>
            </View>
          )}
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
  header: {
    backgroundColor: CustomColors.activeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  headerPlaceholder: {
    width: 32,
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CustomColors.white,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  codeContainer: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeGreyed,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeDisplay: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  codeHint: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    lineHeight: 16,
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

