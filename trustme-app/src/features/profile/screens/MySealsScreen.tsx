import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';
import { API_BASE_URL } from '../../../utils/constants';

type MySealsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MySeals'>;

interface SealDocument {
  id: number;
  document_type: string;
  file_name: string;
  mime_type?: string;
  is_image: boolean;
  path: string;
}

interface Seal {
  id: number;
  verificado: boolean;
  expira_em?: string;
  obtido_em?: string;
  rejection_reason?: string;
  analyst_feedback?: string;
  seal_request_id?: number;
  solicitado_em?: string;
  documentos?: SealDocument[];
  selo?: {
    id: number;
    codigo?: string;
    descricao?: string;
    disponivel?: boolean;
    validade?: number;
  };
  sealType?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface UserSealsResponse {
  usuario_id: number;
  nome_completo: string;
  ativos: Seal[];
  pendentes: Seal[];
  expirados: Seal[];
  cancelados: Seal[];
}

const MySealsScreen: React.FC = () => {
  const navigation = useNavigation<MySealsScreenNavigationProp>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [sealsData, setSealsData] = useState<UserSealsResponse | null>(null);

  useEffect(() => {
    loadSeals();
  }, []);

  const loadSeals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; result: UserSealsResponse }>(`usuario/${user.id}/selos`);

      if (response.success && response.result) {
        setSealsData(response.result);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar seus selos.');
      }
    } catch (error: any) {
      console.error('Erro ao carregar selos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus selos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'ativos': 'Concedidos',
      'pendentes': 'Pendentes',
      'expirados': 'Expirados',
      'cancelados': 'Rejeitados',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'ativos': CustomColors.activeColor,
      'pendentes': '#FFA500',
      'expirados': '#888888',
      'cancelados': CustomColors.vividRed,
    };
    return colors[status] || CustomColors.activeGreyed;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SealDocument | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then((t) => setAuthToken(t?.trim() || null));
  }, []);

  const getDocUrl = (doc: SealDocument) => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const path = doc.path.startsWith('/') ? doc.path.slice(1) : doc.path;
    return `${base}/${path}`;
  };

  const openDocument = (doc: SealDocument) => {
    setSelectedDoc(doc);
    setDocModalVisible(true);
  };

  const renderSealSection = (title: string, seals: Seal[], status: string) => {
    if (!seals || seals.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { borderLeftColor: getStatusColor(status) }]}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.badgeText}>{seals.length}</Text>
          </View>
        </View>
        {seals.map((seal) => (
          <View key={seal.id} style={styles.sealCard}>
            <View style={styles.sealHeader}>
              <SafeIcon name="shield-check" size={24} color={getStatusColor(status)} />
              <View style={styles.sealInfo}>
                <Text style={styles.sealName}>
                  {seal.sealType?.name || seal.selo?.descricao || 'Selo'}
                </Text>
                {seal.selo?.codigo && (
                  <Text style={styles.sealCode}>Código: {seal.selo.codigo}</Text>
                )}
              </View>
            </View>
            <View style={styles.sealDetails}>
              {status === 'pendentes' && seal.solicitado_em && (
                <View style={styles.detailRow}>
                  <SafeIcon name="time" size={16} color={CustomColors.activeGreyed} />
                  <Text style={styles.detailText}>Solicitado em: {formatDateTime(seal.solicitado_em)}</Text>
                </View>
              )}
              {status === 'pendentes' && seal.documentos && seal.documentos.length > 0 && (
                <View style={styles.documentsSection}>
                  <Text style={styles.documentsLabel}>Documentos enviados:</Text>
                  {seal.documentos.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.docLink}
                      onPress={() => openDocument(doc)}
                    >
                      <SafeIcon
                        name={doc.is_image ? 'image' : 'document'}
                        size={16}
                        color={CustomColors.activeColor}
                      />
                      <Text style={styles.docLinkText}>
                        {doc.document_type === 'frente' ? 'Frente' : doc.document_type === 'tras' ? 'Trás' : doc.document_type} - {doc.file_name}
                        {doc.is_image ? ' (ver)' : ' (baixar)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {status === 'pendentes' && seal.analyst_feedback && (
                <View style={[styles.detailRow, styles.feedbackBox]}>
                  <SafeIcon name="alert-circle" size={16} color="#E65100" />
                  <View style={styles.feedbackContent}>
                    <Text style={styles.feedbackLabel}>O analista solicitou mais informações:</Text>
                    <Text style={styles.analystFeedbackText}>{seal.analyst_feedback}</Text>
                    {seal.seal_request_id && (
                      <TouchableOpacity
                        style={styles.complementBtn}
                        onPress={() =>
                          navigation.navigate('SealComplement', {
                            sealRequestId: seal.seal_request_id!,
                            seloName: seal.sealType?.name || seal.selo?.descricao || 'Selo',
                            analystFeedback: seal.analyst_feedback,
                          })
                        }
                      >
                        <SafeIcon name="cloud-upload" size={14} color={CustomColors.activeColor} />
                        <Text style={styles.complementBtnText}>Complementar documentação</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              {status === 'cancelados' && (
                <View style={[styles.detailRow, styles.rejectionReasonBox]}>
                  <SafeIcon name="alert-circle" size={16} color={CustomColors.vividRed} />
                  <View style={styles.rejectionReasonContent}>
                    <Text style={styles.rejectionReasonLabel}>Motivo da rejeição:</Text>
                    <Text style={styles.rejectionReasonText}>
                      {(seal.rejection_reason && String(seal.rejection_reason).trim())
                        ? seal.rejection_reason
                        : 'Não informado'}
                    </Text>
                  </View>
                </View>
              )}
              {seal.obtido_em && (
                <View style={styles.detailRow}>
                  <SafeIcon name="calendar" size={16} color={CustomColors.activeGreyed} />
                  <Text style={styles.detailText}>Obtido em: {formatDate(seal.obtido_em)}</Text>
                </View>
              )}
              {seal.expira_em && (
                <View style={styles.detailRow}>
                  <SafeIcon name="time" size={16} color={CustomColors.activeGreyed} />
                  <Text style={styles.detailText}>Expira em: {formatDate(seal.expira_em)}</Text>
                </View>
              )}
              {seal.verificado && (
                <View style={styles.detailRow}>
                  <SafeIcon name="check-circle" size={16} color={CustomColors.activeColor} />
                  <Text style={[styles.detailText, { color: CustomColors.activeColor }]}>Verificado</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../../assets/images/trustme-logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                  tintColor={CustomColors.white}
                />
              </View>
              <Text style={styles.headerTitle}>Meus Selos</Text>
            </View>
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              <SafeIcon name="profile" size={28} color={CustomColors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando selos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSeals = (sealsData?.ativos?.length || 0) +
                   (sealsData?.pendentes?.length || 0) +
                   (sealsData?.expirados?.length || 0) +
                   (sealsData?.cancelados?.length || 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/images/trustme-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                tintColor={CustomColors.white}
              />
            </View>
            <Text style={styles.headerTitle}>Meus Selos</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'Seals' } })}
            style={styles.addButton}
          >
            <SafeIcon name="add-circle" size={28} color={CustomColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {totalSeals === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="shield-off" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyTitle}>Nenhum selo encontrado</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui selos solicitados ou concedidos.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'Seals' } })}
            >
              <SafeIcon name="add-circle" size={20} color={CustomColors.white} />
              <Text style={styles.browseButtonText}>Solicitar Selo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderSealSection('Concedidos', sealsData?.ativos || [], 'ativos')}
            {renderSealSection('Pendentes', sealsData?.pendentes || [], 'pendentes')}
            {renderSealSection('Expirados', sealsData?.expirados || [], 'expirados')}
            {renderSealSection('Rejeitados', sealsData?.cancelados || [], 'cancelados')}
            <TouchableOpacity
              style={styles.addSealButton}
              onPress={() => navigation.navigate('Main', { screen: 'Home', params: { screen: 'Seals' } })}
            >
              <SafeIcon name="add-circle" size={24} color={CustomColors.white} />
              <Text style={styles.addSealButtonText}>Solicitar Novo Selo</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={docModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDoc?.file_name || 'Documento'}
              </Text>
              <TouchableOpacity onPress={() => setDocModalVisible(false)} style={styles.modalCloseBtn}>
                <SafeIcon name="close-circle" size={28} color={CustomColors.activeGreyed} />
              </TouchableOpacity>
            </View>
            {selectedDoc && authToken && (
              selectedDoc.is_image ? (
                <Image
                  source={{
                    uri: getDocUrl(selectedDoc),
                    headers: { Authorization: `Bearer ${authToken}` },
                  }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <WebView
                  source={{
                    uri: getDocUrl(selectedDoc),
                    headers: { Authorization: `Bearer ${authToken}` },
                  }}
                  style={styles.modalWebView}
                  originWhitelist={['*']}
                />
              )
            )}
          </View>
        </View>
      </Modal>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  profileButton: {
    padding: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  browseButton: {
    backgroundColor: CustomColors.activeColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  browseButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addSealButton: {
    backgroundColor: CustomColors.activeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    gap: 8,
  },
  addSealButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: CustomColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sealCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sealInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sealName: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 4,
  },
  sealCode: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
  },
  sealDetails: {
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginLeft: 8,
  },
  feedbackBox: {
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  feedbackContent: { flex: 1, marginLeft: 8 },
  feedbackLabel: { fontSize: 12, fontWeight: '600', color: '#E65100', marginBottom: 4 },
  analystFeedbackText: { fontSize: 14, color: '#333', marginBottom: 8 },
  complementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  complementBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeColor,
    marginLeft: 6,
  },
  documentsSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  documentsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  docLinkText: {
    fontSize: 14,
    color: CustomColors.activeColor,
    marginLeft: 8,
    flex: 1,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
  },
  modalWebView: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
  },
  rejectionReasonBox: {
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: CustomColors.vividRed,
  },
  rejectionReasonContent: {
    flex: 1,
    marginLeft: 8,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CustomColors.vividRed,
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 14,
    color: '#991B1B',
  },
});

export default MySealsScreen;

