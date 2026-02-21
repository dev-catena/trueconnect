import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import { API_BASE_URL } from '../../../utils/constants';
import SafeIcon from '../../../components/SafeIcon';

type SealComplementScreenRouteProp = RouteProp<HomeStackParamList, 'SealComplement'>;
type SealComplementScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'SealComplement'>;

interface FileUpload {
  uri: string;
  type: string;
  name: string;
  isImage: boolean;
}

const SealComplementScreen: React.FC = () => {
  const navigation = useNavigation<SealComplementScreenNavigationProp>();
  const route = useRoute<SealComplementScreenRouteProp>();
  const { sealRequestId, seloName, analystFeedback } = route.params;

  const [frente, setFrente] = useState<FileUpload | null>(null);
  const [tras, setTras] = useState<FileUpload | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickFile = async (target: 'frente' | 'tras') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const isImage = (file.mimeType || '').startsWith('image/');
      const upload: FileUpload = {
        uri: file.uri,
        type: file.mimeType || (isImage ? 'image/jpeg' : 'application/pdf'),
        name: file.name || `${target}_${Date.now()}.${isImage ? 'jpg' : 'pdf'}`,
        isImage,
      };
      target === 'frente' ? setFrente(upload) : setTras(upload);
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleSubmit = async () => {
    const hasDoc = !!frente || !!tras;
    const hasText = textResponse.trim().length > 0;
    if (!hasDoc && !hasText) {
      Alert.alert('Atenção', 'Envie ao menos um documento ou uma mensagem de texto respondendo ao analista.');
      return;
    }

    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();

      // Arquivos primeiro (evita problemas com FormData no React Native)
      if (frente) {
        formData.append('frente', {
          uri: frente.uri,
          type: frente.type,
          name: frente.name,
        } as any);
      }
      if (tras) {
        formData.append('tras', {
          uri: tras.uri,
          type: tras.type,
          name: tras.name,
        } as any);
      }
      formData.append('seal_request_id', sealRequestId.toString());
      if (textResponse.trim()) {
        formData.append('user_response', textResponse.trim());
      }

      // Usar fetch em vez de axios - mais confiável para uploads no React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const response = await fetch(`${API_BASE_URL}/selos/complementar`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        Alert.alert('Sucesso', data.message, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erro', data.message || 'Não foi possível enviar os documentos.');
      }
    } catch (error: any) {
      console.error('Erro ao complementar:', error);
      const msg = error?.message || error?.toString?.() || 'Erro desconhecido';
      if (msg.includes('abort') || msg.includes('timeout')) {
        Alert.alert('Erro', 'A requisição demorou muito. Verifique sua conexão e tente novamente.');
      } else {
        Alert.alert('Erro', msg || 'Não foi possível enviar. Tente novamente.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complementar documentação</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.seloName}>{seloName}</Text>
          {analystFeedback ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackLabel}>O analista solicitou:</Text>
              <Text style={styles.feedbackText}>{analystFeedback}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sua resposta</Text>
          <Text style={styles.sectionHint}>Envie um documento e/ou uma mensagem de texto</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Escreva sua mensagem ao analista (opcional se enviar documento)..."
            placeholderTextColor={CustomColors.activeGreyed}
            multiline
            numberOfLines={4}
            value={textResponse}
            onChangeText={setTextResponse}
            editable={!uploading}
          />
          <Text style={styles.sectionTitle}>Documentos adicionais (opcional)</Text>
          <TouchableOpacity
            style={[styles.uploadBtn, frente && styles.uploadBtnFilled]}
            onPress={() => pickFile('frente')}
            disabled={uploading}
          >
            <SafeIcon name="document" size={24} color={frente ? '#4CAF50' : CustomColors.activeColor} />
            <Text style={styles.uploadBtnText}>Frente {frente ? `- ${frente.name}` : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.uploadBtn, tras && styles.uploadBtnFilled]}
            onPress={() => pickFile('tras')}
            disabled={uploading}
          >
            <SafeIcon name="document" size={24} color={tras ? '#4CAF50' : CustomColors.activeColor} />
            <Text style={styles.uploadBtnText}>Trás {tras ? `- ${tras.name}` : ''}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <SafeIcon name="send" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Enviar resposta</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CustomColors.activeColor,
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: CustomColors.white },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  seloName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  feedbackBox: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    padding: 12,
    borderRadius: 4,
  },
  feedbackLabel: { fontSize: 12, fontWeight: '600', color: '#E65100', marginBottom: 4 },
  feedbackText: { fontSize: 14, color: '#333' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 12 },
  sectionHint: { fontSize: 12, color: CustomColors.activeGreyed, marginBottom: 8 },
  textInput: {
    minHeight: 100,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  uploadBtnFilled: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  uploadBtnText: { marginLeft: 12, fontSize: 14, color: '#333', flex: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#fff' },
});

export default SealComplementScreen;
