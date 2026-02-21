import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import { API_BASE_URL } from '../../../utils/constants';
import SafeIcon from '../../../components/SafeIcon';

type SealAcquisitionScreenRouteProp = RouteProp<HomeStackParamList, 'SealAcquisition'>;
type SealAcquisitionScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'SealAcquisition'>;

interface FileUpload {
  uri: string;
  type: string;
  name: string;
  isImage: boolean;
}

const SealAcquisitionScreen: React.FC = () => {
  const navigation = useNavigation<SealAcquisitionScreenNavigationProp>();
  const route = useRoute<SealAcquisitionScreenRouteProp>();
  const { selo } = route.params;

  // Documentos do selo: suporta formato legado (string[]) ou novo [{nome, obrigatorio}]
  const documentItems = React.useMemo(() => {
    const raw = selo.documentos_evidencias;
    // Array vazio [] = selo sem documentos obrigatórios. Fallback Frente/Trás só quando null/undefined (legado)
    if (!Array.isArray(raw)) {
      return [{ nome: 'Frente', obrigatorio: true }, { nome: 'Trás', obrigatorio: true }];
    }
    if (raw.length === 0) {
      return [];
    }
    return raw.map((item: unknown) => {
      if (typeof item === 'string') {
        return { nome: item, obrigatorio: true };
      }
      const obj = item as { nome?: string; obrigatorio?: boolean };
      return {
        nome: obj.nome || '',
        obrigatorio: obj.obrigatorio !== false,
      };
    }).filter(d => d.nome && String(d.nome).trim() !== '');
  }, [selo.documentos_evidencias]);

  // Chave normalizada para o backend (frente, tras, etc)
  const getFieldName = (nome: string): string => {
    const n = nome.toLowerCase().trim();
    if (n === 'frente') return 'frente';
    if (n === 'trás' || n === 'tras') return 'tras';
    return n.replace(/\s+/g, '_');
  };

  // Estado dinâmico para armazenar arquivos por documento (chave = nome)
  const [documentFiles, setDocumentFiles] = useState<Record<string, FileUpload | null>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const initial: Record<string, FileUpload | null> = {};
    documentItems.forEach((d) => { initial[d.nome] = null; });
    setDocumentFiles(initial);
  }, [documentItems]);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (__DEV__) {
        console.log('📸 Status da permissão:', status);
      }
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária', 
          'Precisamos de permissão para acessar suas fotos. Por favor, permita o acesso nas configurações do aplicativo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configurações', onPress: () => {
              // Em produção, você pode usar Linking.openSettings() se necessário
              if (__DEV__) {
                console.log('Abrir configurações do app');
              }
            }}
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      Alert.alert('Erro', 'Não foi possível solicitar permissão para acessar as fotos.');
      return false;
    }
  };

  const pickFile = async (documentName: string, fileType: 'image' | 'pdf') => {
    try {
      if (__DEV__) {
        console.log(`📄 Iniciando seleção de arquivo: ${documentName} (tipo: ${fileType})`);
      }

      if (fileType === 'image') {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          if (__DEV__) {
            console.log('❌ Permissão negada');
          }
          return;
        }

        if (__DEV__) {
          console.log('📸 Abrindo seletor de imagens...');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (__DEV__) {
          console.log('📸 Resultado do ImagePicker:', {
            canceled: result.canceled,
            hasAssets: result.assets && result.assets.length > 0,
          });
        }

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = asset.uri;
          const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(fileName);
          const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

          const fileData: FileUpload = {
            uri: imageUri,
            type: mimeType,
            name: fileName,
            isImage: true,
          };

          if (__DEV__) {
            console.log('✅ Imagem selecionada:', {
              document: documentName,
              uri: imageUri.substring(0, 50) + '...',
              name: fileName,
              mimeType,
            });
          }

          setDocumentFiles(prev => ({
            ...prev,
            [documentName]: fileData
          }));
        } else {
          if (__DEV__) {
            console.log('ℹ️ Seleção de imagem cancelada pelo usuário');
          }
        }
      } else {
        // Selecionar PDF
        if (__DEV__) {
          console.log('📄 Abrindo seletor de documentos...');
        }

        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: true,
        });

        if (__DEV__) {
          console.log('📄 Resultado completo do DocumentPicker:', JSON.stringify(result, null, 2));
          console.log('📄 Resultado do DocumentPicker:', {
            canceled: result.canceled,
            hasFile: !!result.file,
            resultType: result.type,
            assets: result.assets,
          });
        }

        // Verificar diferentes estruturas de retorno
        let selectedFile: any = null;
        
        if (!result.canceled) {
          // Versão mais recente pode retornar assets[]
          if (result.assets && result.assets.length > 0) {
            selectedFile = result.assets[0];
          } 
          // Versão antiga retorna file diretamente
          else if (result.file) {
            selectedFile = result.file;
          }
        }

        if (selectedFile) {
          const fileData: FileUpload = {
            uri: selectedFile.uri || selectedFile.fileUri,
            type: selectedFile.mimeType || selectedFile.mime || 'application/pdf',
            name: selectedFile.name || selectedFile.fileName || `documento_${Date.now()}.pdf`,
            isImage: false,
          };

          if (__DEV__) {
            console.log('✅ PDF selecionado e processado:', {
              document: documentName,
              fileData: fileData,
              uri: fileData.uri.substring(0, 50) + '...',
              name: fileData.name,
              type: fileData.type,
            });
          }

          setDocumentFiles(prev => {
            const updated = {
              ...prev,
              [documentName]: fileData
            };
            if (__DEV__) {
              console.log('📝 Estado atualizado:', {
                documentName,
                hasFile: !!updated[documentName],
                allFiles: Object.keys(updated),
              });
            }
            return updated;
          });
        } else {
          if (__DEV__) {
            console.log('ℹ️ Seleção de documento cancelada ou arquivo não encontrado');
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ Erro ao selecionar ${fileType === 'image' ? 'imagem' : 'documento'}:`, error);
      Alert.alert(
        'Erro', 
        `Não foi possível abrir o seletor de ${fileType === 'image' ? 'imagens' : 'documentos'}. Por favor, tente novamente.`,
        [{ text: 'OK' }]
      );
    }
  };

  const showFileTypePicker = (documentName: string) => {
    Alert.alert(
      'Selecionar arquivo',
      'Escolha o tipo de arquivo que deseja enviar:',
      [
        {
          text: 'Imagem',
          onPress: () => pickFile(documentName, 'image'),
        },
        {
          text: 'PDF',
          onPress: () => pickFile(documentName, 'pdf'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const removeFile = (documentName: string) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentName]: null
    }));
  };

  const handleContinue = async () => {
    // Verificar apenas documentos obrigatórios
    const missingObrigatorios: string[] = [];
    documentItems.forEach((doc) => {
      if (doc.obrigatorio && !documentFiles[doc.nome]) {
        missingObrigatorios.push(doc.nome);
      }
    });

    if (missingObrigatorios.length > 0) {
      Alert.alert(
        'Atenção',
        `Por favor, faça o upload dos seguintes documentos obrigatórios:\n${missingObrigatorios.join('\n')}`
      );
      return;
    }

    setUploading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();

      // Arquivos primeiro (evita problemas com FormData no React Native)
      documentItems.forEach((doc) => {
        const file = documentFiles[doc.nome];
        if (file) {
          const fieldName = getFieldName(doc.nome);
          const fileName = file.name || `${fieldName}_${Date.now()}.${file.isImage ? 'jpg' : 'pdf'}`;
          formData.append(fieldName, {
            uri: file.uri,
            type: file.type || (file.isImage ? 'image/jpeg' : 'application/pdf'),
            name: fileName,
          } as any);
        }
      });
      formData.append('selo_id', selo.id.toString());

      if (__DEV__) {
        console.log('📤 FormData criado:', {
          selo_id: selo.id,
          documents: documentItems.map(doc => ({
            name: doc.nome,
            obrigatorio: doc.obrigatorio,
            hasFile: !!documentFiles[doc.nome]
          }))
        });
      }

      // Usar fetch em vez de axios - mais confiável para uploads no React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(`${API_BASE_URL}/selos/solicitar`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const response = await res.json();

      if (response.success) {
        navigation.navigate('Payment', {
          selo,
          requestId: response.data?.id || response.data?.request_id,
        });
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível processar a solicitação.');
      }
    } catch (error: any) {
      console.error('Erro ao solicitar selo:', error);
      const msg = error?.message || error?.toString?.() || 'Erro desconhecido';
      if (msg.includes('abort') || msg.includes('timeout')) {
        Alert.alert('Erro', 'A requisição demorou muito. Verifique sua conexão e tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível processar a solicitação. Tente novamente.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../../assets/images/trustme-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              tintColor={CustomColors.white}
            />
          </View>
          <Text style={styles.headerTitle}>Adquirir Selo</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações do Selo */}
        <View style={styles.sealInfoCard}>
          <View style={styles.sealIconContainer}>
            <SafeIcon name="seal" size={32} color={CustomColors.activeColor} />
          </View>
          <View style={styles.sealInfo}>
            <Text style={styles.sealName}>{selo.nome || selo.descricao || selo.codigo}</Text>
            <Text style={styles.sealCode}>Código: {selo.codigo}</Text>
            <Text style={styles.sealPrice}>
              R$ {selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' 
                ? selo.custo_obtencao.toFixed(2).replace('.', ',') 
                : '0,00'}
            </Text>
          </View>
        </View>

        {/* Upload de Imagens */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Documentos Necessários</Text>
          {documentItems.length === 0 ? (
            <Text style={styles.noDocsText}>Este selo não exige documentos. Clique em Continuar para prosseguir.</Text>
          ) : null}
          {documentItems.map((doc, index) => {
            const currentFile = documentFiles[doc.nome];
            return (
              <View key={index} style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>
                  {doc.nome} {doc.obrigatorio ? '*' : '(opcional)'}
                </Text>
                {currentFile ? (
                  <View style={styles.filePreview}>
                    {currentFile.isImage ? (
                      <Image 
                        source={{ uri: currentFile.uri }} 
                        style={styles.previewImage} 
                      />
                    ) : (
                      <View style={styles.pdfPreview}>
                        <SafeIcon name="document" size={48} color={CustomColors.activeColor} />
                        <Text style={styles.pdfFileName} numberOfLines={1}>
                          {currentFile.name}
                        </Text>
                        <Text style={styles.pdfLabel}>PDF</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFile(doc.nome)}
                    >
                      <SafeIcon name="close-circle" size={24} color={CustomColors.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => {
                    if (__DEV__) console.log(`📄 Botão clicado: ${doc.nome}`);
                    showFileTypePicker(doc.nome);
                  }}
                  activeOpacity={0.7}
                >
                  <SafeIcon name="add-circle" size={32} color={CustomColors.activeColor} />
                  <Text style={styles.uploadButtonText}>Adicionar Arquivo</Text>
                  <Text style={styles.uploadButtonSubtext}>Imagem ou PDF</Text>
                </TouchableOpacity>
              )}
            </View>
            );
          })}
        </View>

        {/* Botão Continuar */}
        <TouchableOpacity
          style={[styles.continueButton, uploading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={uploading || documentItems.some(d => d.obrigatorio && !documentFiles[d.nome])}
        >
          {uploading ? (
            <ActivityIndicator color={CustomColors.activeColor} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Continuar para Pagamento</Text>
              <SafeIcon name="arrow-forward" size={20} color={CustomColors.activeColor} />
            </>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: CustomColors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  sealInfoCard: {
    backgroundColor: CustomColors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sealIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sealInfo: {
    flex: 1,
  },
  sealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  sealCode: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    marginBottom: 4,
  },
  sealPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  uploadSection: {
    padding: 16,
  },
  noDocsText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 16,
  },
  uploadCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  uploadButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: CustomColors.activeColor,
    fontWeight: '600',
  },
  uploadButtonSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: CustomColors.activeGreyed,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomColors.pastelGreen,
    borderRadius: 12,
    paddingVertical: 16,
    margin: 16,
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
});

export default SealAcquisitionScreen;

