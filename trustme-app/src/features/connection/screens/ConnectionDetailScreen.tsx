import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import SafeIcon from '../../../components/SafeIcon';
import { Connection, Seal } from '../../../types';
import { formatDate, formatTimeAgo } from '../../../utils/dateParser';
import ApiProvider from '../../../core/api/ApiProvider';
import { useUser } from '../../../core/context/UserContext';

interface UserSeal {
  id: number;
  selo_id?: number;
  verificado: boolean;
  expira_em?: string;
  obtido_em?: string;
  selo?: Seal;
}

interface UserSealsResponse {
  usuario_id: number;
  nome_completo: string;
  ativos: UserSeal[];
  pendentes: UserSeal[];
  expirados: UserSeal[];
  cancelados: UserSeal[];
}

type ConnectionDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ConnectionDetail'>;
type ConnectionDetailScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ConnectionDetail'
>;

interface Props {
  route: ConnectionDetailScreenRouteProp;
}

const ConnectionDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<ConnectionDetailScreenNavigationProp>();
  const { connection: initialConnection } = route.params;
  const { user, refreshUserData, removeConnection } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [allSeals, setAllSeals] = useState<Seal[]>([]);
  const [userSeals, setUserSeals] = useState<UserSealsResponse | null>(null);
  const [loadingSeals, setLoadingSeals] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const otherUser =
    initialConnection.solicitante_id === user?.id
      ? initialConnection.destinatario
      : initialConnection.solicitante;

  const isPending = initialConnection.aceito === null || initialConnection.aceito === undefined;
  const isAccepted = initialConnection.aceito === true;
  const isRequestedByMe = initialConnection.solicitante_id === user?.id;

  // Carregar selos do usuário da conexão
  useEffect(() => {
    if (otherUser?.id) {
      loadUserSeals();
      loadAllSeals();
    }
  }, [otherUser?.id]);

  const loadAllSeals = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Seal[] }>('selos/listar');
      
      if (response.success && Array.isArray(response.data)) {
        const seals = response.data.filter((s: Seal) => s.disponivel !== false);
        setAllSeals(seals);
      } else if (response && response.data && Array.isArray(response.data)) {
        setAllSeals(response.data.filter((s: Seal) => s.disponivel !== false));
      } else if (response && response.result && Array.isArray(response.result)) {
        setAllSeals(response.result.filter((s: Seal) => s.disponivel !== false));
      }
    } catch (error) {
      console.error('Erro ao carregar selos disponíveis:', error);
    }
  };

  const loadUserSeals = async () => {
    if (!otherUser?.id) return;
    
    setLoadingSeals(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; result: UserSealsResponse }>(`usuario/${otherUser.id}/selos`);
      
      if (response.success && response.result) {
        setUserSeals(response.result);
      } else if (response && response.result) {
        setUserSeals(response.result as UserSealsResponse);
      }
    } catch (error) {
      console.error('Erro ao carregar selos do usuário:', error);
    } finally {
      setLoadingSeals(false);
    }
  };

  // Verificar se o usuário tem um selo específico
  const getUserSealStatus = (sealId: number): 'obtido' | 'pendente' | 'expirado' | 'cancelado' | 'nao_obtido' => {
    if (!userSeals) return 'nao_obtido';
    
    const ativo = userSeals.ativos.find(s => s.selo_id === sealId || s.selo?.id === sealId);
    if (ativo) return 'obtido';
    
    const pendente = userSeals.pendentes.find(s => s.selo_id === sealId || s.selo?.id === sealId);
    if (pendente) return 'pendente';
    
    const expirado = userSeals.expirados.find(s => s.selo_id === sealId || s.selo?.id === sealId);
    if (expirado) return 'expirado';
    
    const cancelado = userSeals.cancelados.find(s => s.selo_id === sealId || s.selo?.id === sealId);
    if (cancelado) return 'cancelado';
    
    return 'nao_obtido';
  };

  // Obter informações do selo do usuário
  const getUserSealInfo = (sealId: number): UserSeal | null => {
    if (!userSeals) return null;
    
    const allUserSeals = [
      ...userSeals.ativos,
      ...userSeals.pendentes,
      ...userSeals.expirados,
      ...userSeals.cancelados,
    ];
    
    return allUserSeals.find(s => s.selo_id === sealId || s.selo?.id === sealId) || null;
  };

  // Construir URL completa da foto se necessário
  const getPhotoUrl = (caminhoFoto?: string) => {
    if (!caminhoFoto) return null;
    if (caminhoFoto.startsWith('http')) return caminhoFoto;
    const { BACKEND_BASE_URL } = require('../../../utils/constants');
    return BACKEND_BASE_URL + (caminhoFoto.startsWith('/') ? caminhoFoto : '/' + caminhoFoto);
  };

  const photoUrl = getPhotoUrl(otherUser?.caminho_foto);
  const userName = otherUser?.nome_completo || otherUser?.name || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  // Debug: log para verificar se caminho_foto está presente
  if (__DEV__ && otherUser) {
    console.log('ConnectionDetailScreen - otherUser:', {
      id: otherUser.id,
      nome: userName,
      caminho_foto: otherUser.caminho_foto,
      photoUrl: photoUrl,
    });
  }

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const api = new ApiProvider(true);
      await api.post(`usuario/conexoes/${initialConnection.id}/aceitar`, {});
      Alert.alert('Sucesso', 'Conexão aceita com sucesso!');
      await refreshUserData();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao aceitar conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja rejeitar esta conexão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.delete(`usuario/conexoes/${initialConnection.id}`);
              removeConnection(initialConnection.id);
              Alert.alert('Sucesso', 'Conexão rejeitada');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao rejeitar conexão');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemove = async () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover esta conexão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.delete(`usuario/conexoes/${initialConnection.id}`);
              removeConnection(initialConnection.id);
              Alert.alert('Sucesso', 'Conexão removida');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao remover conexão');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <CustomScaffold title="Detalhes da Conexão">
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => photoUrl && setPhotoModalVisible(true)}
              activeOpacity={photoUrl ? 0.8 : 1}
              disabled={!photoUrl}
            >
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.avatarImage}
                  onError={(error) => {
                    console.error('Erro ao carregar foto do usuário:', error);
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{userInitial}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.headerNameBlock}>
              <Text style={styles.userName}>{userName}</Text>
              {isAccepted && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Conectado</Text>
                </View>
              )}
              {isPending && !isRequestedByMe && (
                <View style={styles.statusBadgePending}>
                  <Text style={styles.statusTextPending}>Pendente</Text>
                </View>
              )}
            </View>
          </View>
          {isAccepted && (
            <View style={styles.sealsCard}>
              <Text style={styles.sealsCardTitle}>Selos</Text>
              {loadingSeals ? (
                <ActivityIndicator size="small" color={CustomColors.activeColor} style={styles.sealsCardLoader} />
              ) : (
                <ScrollView
                  style={styles.sealsListScroll}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  <View style={styles.sealsList}>
                    {(userSeals?.ativos || []).map((userSeal) => {
                      const seal = userSeal.selo;
                      const sealName = seal?.descricao || seal?.codigo || 'Selo';
                      return (
                        <View key={`ativo-${userSeal.id}`} style={styles.sealItem}>
                          <SafeIcon name="star" size={14} color="#D4AF37" />
                          <Text style={styles.sealItemText} numberOfLines={1}>{sealName}</Text>
                          <Text style={styles.sealItemBadge}>Concedido</Text>
                        </View>
                      );
                    })}
                    {(userSeals?.pendentes || []).map((userSeal) => {
                      const seal = userSeal.selo;
                      const sealName = seal?.descricao || seal?.codigo || 'Selo';
                      return (
                        <View key={`pendente-${userSeal.id}`} style={styles.sealItem}>
                          <SafeIcon name="time" size={14} color="#FF9800" />
                          <Text style={styles.sealItemText} numberOfLines={1}>{sealName}</Text>
                          <Text style={styles.sealItemBadgePendente}>Pendente</Text>
                        </View>
                      );
                    })}
                    {((userSeals?.ativos?.length || 0) + (userSeals?.pendentes?.length || 0)) === 0 && !loadingSeals && (
                      <Text style={styles.sealsEmpty}>Nenhum selo</Text>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{otherUser?.email || 'N/A'}</Text>
          </View>
          {otherUser?.CPF && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CPF:</Text>
              <Text style={styles.infoValue}>{otherUser.CPF}</Text>
            </View>
          )}
        </View>

        {otherUser?.cidade && otherUser?.estado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cidade:</Text>
              <Text style={styles.infoValue}>{otherUser.cidade}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <Text style={styles.infoValue}>{otherUser.estado}</Text>
            </View>
            {otherUser.pais && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>País:</Text>
                <Text style={styles.infoValue}>{otherUser.pais}</Text>
              </View>
            )}
          </View>
        )}

        {otherUser?.profissao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profissional</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Profissão:</Text>
              <Text style={styles.infoValue}>{otherUser.profissao}</Text>
            </View>
          </View>
        )}

        {/* Seção de Selos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selos</Text>
          {loadingSeals ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={CustomColors.activeColor} />
              <Text style={styles.loadingText}>Carregando selos...</Text>
            </View>
          ) : allSeals.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum selo disponível</Text>
          ) : (
            <View style={styles.sealsContainer}>
              {allSeals.map((seal) => {
                const status = getUserSealStatus(seal.id);
                const sealInfo = getUserSealInfo(seal.id);
                
                return (
                  <View
                    key={seal.id}
                    style={[
                      styles.sealCard,
                      status === 'obtido' && styles.sealCardObtained,
                      status === 'pendente' && styles.sealCardPending,
                      status === 'expirado' && styles.sealCardExpired,
                      status === 'cancelado' && styles.sealCardCanceled,
                    ]}
                  >
                    <View style={styles.sealHeader}>
                      <View style={[
                        styles.sealIconContainer,
                        status === 'obtido' && styles.sealIconContainerObtained,
                        status === 'pendente' && styles.sealIconContainerPending,
                      ]}>
                        <SafeIcon
                          name="seal"
                          size={24}
                          color={
                            status === 'obtido' ? CustomColors.successGreen :
                            status === 'pendente' ? CustomColors.pendingYellow :
                            status === 'expirado' ? CustomColors.activeGreyed :
                            status === 'cancelado' ? CustomColors.vividRed :
                            CustomColors.activeGreyed
                          }
                        />
                      </View>
                      <View style={styles.sealInfo}>
                        <Text style={styles.sealName}>{seal.descricao || seal.codigo}</Text>
                        <Text style={styles.sealCode}>Código: {seal.codigo}</Text>
                      </View>
                      {status !== 'nao_obtido' && (
                        <View style={[
                          styles.statusBadgeSeal,
                          status === 'obtido' && { backgroundColor: CustomColors.successGreen + '33' },
                          status === 'pendente' && { backgroundColor: CustomColors.pendingYellow + '33' },
                          status === 'expirado' && { backgroundColor: CustomColors.activeGreyed + '33' },
                          status === 'cancelado' && { backgroundColor: CustomColors.vividRed + '33' },
                        ]}>
                          <Text style={[
                            styles.statusBadgeTextSeal,
                            status === 'obtido' && { color: CustomColors.successGreen },
                            status === 'pendente' && { color: CustomColors.pendingYellow },
                            status === 'expirado' && { color: CustomColors.activeGreyed },
                            status === 'cancelado' && { color: CustomColors.vividRed },
                          ]}>
                            {status === 'obtido' ? '✓ Obtido' :
                             status === 'pendente' ? '⏳ Pendente' :
                             status === 'expirado' ? '⏰ Expirado' :
                             '✗ Cancelado'}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Informações de celebração do selo */}
                    {sealInfo && (
                      <View style={styles.sealCelebration}>
                        {sealInfo.obtido_em && (
                          <View style={styles.celebrationRow}>
                            <SafeIcon name="calendar-check" size={16} color={CustomColors.activeColor} />
                            <Text style={styles.celebrationText}>
                              Obtido em: {formatDate(sealInfo.obtido_em)}
                            </Text>
                          </View>
                        )}
                        {sealInfo.expira_em && (
                          <View style={styles.celebrationRow}>
                            <SafeIcon name="calendar-clock" size={16} color={CustomColors.activeGreyed} />
                            <Text style={styles.celebrationText}>
                              Expira em: {formatDate(sealInfo.expira_em)}
                            </Text>
                          </View>
                        )}
                        {sealInfo.verificado && (
                          <View style={styles.celebrationRow}>
                            <SafeIcon name="checkmark-circle" size={16} color={CustomColors.successGreen} />
                            <Text style={[styles.celebrationText, { color: CustomColors.successGreen }]}>
                              Verificado
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    {status === 'nao_obtido' && (
                      <View style={styles.sealNotObtained}>
                        <Text style={styles.notObtainedText}>Ainda não obtido</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Conexão</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>
              {isAccepted
                ? 'Aceita'
                : isPending
                ? isRequestedByMe
                  ? 'Aguardando resposta'
                  : 'Pendente'
                : 'Rejeitada'}
            </Text>
          </View>
          {initialConnection.created_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criada em:</Text>
              <Text style={styles.infoValue}>
                {formatDate(initialConnection.created_at)} ({formatTimeAgo(initialConnection.created_at)})
              </Text>
            </View>
          )}
        </View>

        {isPending && !isRequestedByMe && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Aceitar Conexão</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Rejeitar Conexão</Text>
            </TouchableOpacity>
          </View>
        )}

        {isPending && isRequestedByMe && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Cancelar solicitação</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Remover Conexão</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <Pressable
          style={styles.photoModalOverlay}
          onPress={() => setPhotoModalVisible(false)}
        >
          <Pressable style={styles.photoModalContent} onPress={(e) => e.stopPropagation()}>
            {photoUrl && (
              <Image
                source={{ uri: photoUrl }}
                style={styles.photoModalImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  headerNameBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  sealsCard: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 12,
    padding: 12,
    width: 140,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: CustomColors.activeGreyed + '33',
  },
  sealsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 8,
  },
  sealsCardLoader: {
    marginVertical: 8,
  },
  sealsListScroll: {
    maxHeight: 160,
  },
  sealsList: {
    gap: 6,
  },
  sealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sealItemText: {
    fontSize: 12,
    color: CustomColors.black,
    flex: 1,
  },
  sealItemBadge: {
    fontSize: 10,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sealItemBadgePendente: {
    fontSize: 10,
    color: '#E65100',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sealsEmpty: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    fontStyle: 'italic',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalContent: {
    width: Dimensions.get('window').width * 0.92,
    height: Dimensions.get('window').height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: CustomColors.black,
  },
  statusBadge: {
    backgroundColor: CustomColors.successGreen + '33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusBadgePending: {
    backgroundColor: CustomColors.pendingYellow + '33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: CustomColors.successGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextPending: {
    color: CustomColors.pendingYellow,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: CustomColors.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: CustomColors.black,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: CustomColors.successGreen,
  },
  rejectButton: {
    backgroundColor: CustomColors.vividRed,
  },
  removeButton: {
    backgroundColor: CustomColors.vividRed,
  },
  actionButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  emptyText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    padding: 20,
  },
  sealsContainer: {
    gap: 12,
  },
  sealCard: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: CustomColors.activeGreyed + '33',
  },
  sealCardObtained: {
    borderColor: CustomColors.successGreen + '66',
    backgroundColor: CustomColors.successGreen + '11',
  },
  sealCardPending: {
    borderColor: CustomColors.pendingYellow + '66',
    backgroundColor: CustomColors.pendingYellow + '11',
  },
  sealCardExpired: {
    borderColor: CustomColors.activeGreyed + '66',
    backgroundColor: CustomColors.activeGreyed + '11',
  },
  sealCardCanceled: {
    borderColor: CustomColors.vividRed + '66',
    backgroundColor: CustomColors.vividRed + '11',
  },
  sealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CustomColors.activeColor + '33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sealIconContainerObtained: {
    backgroundColor: CustomColors.successGreen + '33',
  },
  sealIconContainerPending: {
    backgroundColor: CustomColors.pendingYellow + '33',
  },
  sealInfo: {
    flex: 1,
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
  statusBadgeSeal: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeTextSeal: {
    fontSize: 12,
    fontWeight: '600',
  },
  sealCelebration: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CustomColors.activeGreyed + '33',
    gap: 6,
  },
  celebrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  celebrationText: {
    fontSize: 12,
    color: CustomColors.black,
  },
  sealNotObtained: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CustomColors.activeGreyed + '33',
  },
  notObtainedText: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    fontStyle: 'italic',
  },
});

export default ConnectionDetailScreen;
