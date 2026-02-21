import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import SignatureCountdown from '../../../components/SignatureCountdown';
import ApiProvider from '../../../core/api/ApiProvider';
import { webSocketService } from '../../../core/services/WebSocketService';
import { formatDateTime } from '../../../utils/dateParser';

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string | null;
}

interface Contract {
  id: number;
  codigo?: string;
  descricao?: string;
  status?: string;
  duracao?: number;
  dt_inicio?: string;
  dt_fim?: string;
  dt_prazo_assinatura?: string | null;
  contratante_id?: number;
  contrato_tipo_id?: number;
  tipo?: {
    id: number;
    codigo?: string;
    descricao?: string;
  };
  contratante?: {
    id: number;
    nome_completo?: string;
    name?: string;
    email?: string;
  };
}

type MyContractsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyContracts'>;

const MyContractsScreen: React.FC = () => {
  const navigation = useNavigation<MyContractsScreenNavigationProp>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);

  const loadContracts = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const api = new ApiProvider(true);
      // usuario/contratos retorna { result: { contratos_como_contratante: [], contratos_como_participante: [] } }
      // contrato/listar retorna { result: [...] } - array direto
      const response = await api.get<any>('contrato/listar');

      let contractsList: Contract[] = [];
      const data = response?.result ?? response?.data ?? response;
      if (Array.isArray(data)) {
        contractsList = data;
      } else if (data && typeof data === 'object') {
        const comoContratante = Array.isArray(data.contratos_como_contratante) ? data.contratos_como_contratante : [];
        const comoParticipante = Array.isArray(data.contratos_como_participante) ? data.contratos_como_participante : [];
        const ids = new Set<number>();
        contractsList = [...comoContratante, ...comoParticipante].filter((c: Contract) => {
          if (ids.has(c.id)) return false;
          ids.add(c.id);
          return true;
        });
      }

      setContracts(contractsList);
    } catch (error: any) {
      console.error('Erro ao carregar contratos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus contratos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkActivePlan();
  }, []);

  useEffect(() => {
    if (hasActivePlan === true) {
      loadContracts();
    } else if (hasActivePlan === false) {
      setLoading(false);
    }
  }, [hasActivePlan, loadContracts]);

  // WebSocket: atualizar lista quando contrato for assinado/criado por outra parte
  useEffect(() => {
    const unsub = webSocketService.on('contrato.atualizado', () => {
      if (hasActivePlan) {
        loadContracts();
      }
    });
    return unsub;
  }, [hasActivePlan, loadContracts]);

  const checkActivePlan = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Subscription[] }>('user/subscriptions');

      if (response.success && Array.isArray(response.data)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const active = response.data.find((sub: Subscription) => {
          if (sub.status !== 'active') return false;
          if (!sub.end_date) return true; // Se não tem data de fim, considera ativa
          const endDate = new Date(sub.end_date);
          endDate.setHours(0, 0, 0, 0);
          return endDate >= today;
        });

        setHasActivePlan(!!active);
      } else {
        setHasActivePlan(false);
      }
    } catch (error: any) {
      console.error('Erro ao verificar plano ativo:', error);
      setHasActivePlan(false);
    }
  };


  const getStatusColor = (status?: string) => {
    const colors: { [key: string]: string } = {
      'Ativo': CustomColors.successGreen,
      'Pendente': CustomColors.activeColor,
      'Concluído': CustomColors.activeGreyed,
      'Expirado': '#FF8C00', // Laranja
      'Cancelado': CustomColors.vividRed,
    };
    return colors[status || ''] || CustomColors.activeGreyed;
  };

  const getCardBorderColor = (status?: string) => {
    const colors: { [key: string]: string } = {
      'Ativo': CustomColors.successGreen,
      'Pendente': CustomColors.activeColor,
      'Concluído': CustomColors.activeGreyed,
      'Expirado': '#FF8C00', // Laranja
      'Cancelado': CustomColors.vividRed,
    };
    return colors[status || ''] || CustomColors.activeGreyed;
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
              <Text style={styles.headerTitle}>Meus Contratos</Text>
            </View>
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              <SafeIcon name="profile" size={28} color={CustomColors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando contratos...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>Meus Contratos</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <SafeIcon name="profile" size={28} color={CustomColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasActivePlan === false ? (
          <View style={styles.noPlanContainer}>
            <SafeIcon name="document" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.noPlanTitle}>Funcionalidade Indisponível</Text>
            <Text style={styles.noPlanText}>
              Esta funcionalidade não está disponível no momento. Para acessar seus contratos, você precisa contratar um plano.
            </Text>
            <TouchableOpacity
              style={styles.planButton}
              onPress={() => navigation.navigate('Plans')}
            >
              <Text style={styles.planButtonText}>Contratar Plano</Text>
              <SafeIcon name="arrow-forward" size={20} color={CustomColors.white} />
            </TouchableOpacity>
          </View>
        ) : contracts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="document" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyTitle}>Nenhum contrato encontrado</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui contratos cadastrados.
            </Text>
          </View>
        ) : (
          contracts.map((contract) => (
            <View
              key={contract.id}
              style={[
                styles.contractCard,
                {
                  borderLeftWidth: 6,
                  borderLeftColor: getCardBorderColor(contract.status),
                },
              ]}
            >
              <View style={styles.contractHeader}>
                <View style={styles.contractInfo}>
                  <Text style={styles.contractCode}>
                    {contract.codigo || `Contrato #${contract.id}`}
                  </Text>
                  {contract.tipo?.descricao && (
                    <Text style={styles.contractType}>{contract.tipo.descricao}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) }]}>
                  <Text style={styles.statusText}>{contract.status || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.contractDetails}>
                {contract.contratante && (
                  <View style={styles.detailRow}>
                    <SafeIcon name="account" size={16} color={CustomColors.activeGreyed} />
                    <Text style={styles.detailText}>
                      {contract.contratante.nome_completo || contract.contratante.name || 'N/A'}
                    </Text>
                  </View>
                )}
                {contract.dt_inicio && (
                  <View style={styles.detailRow}>
                    <SafeIcon name="checkmark-circle" size={16} color={CustomColors.successGreen} />
                    <Text style={styles.detailText}>
                      Assinado em: {formatDateTime(contract.dt_inicio)}
                    </Text>
                  </View>
                )}
                {contract.dt_fim && (
                  <View style={styles.detailRow}>
                    <SafeIcon name="time" size={16} color={CustomColors.activeGreyed} />
                    <Text style={styles.detailText}>
                      Fim: {formatDate(contract.dt_fim)}
                    </Text>
                  </View>
                )}
                {contract.status === 'Pendente' && contract.dt_prazo_assinatura && (
                  <SignatureCountdown
                    dtPrazoAssinatura={contract.dt_prazo_assinatura}
                    compact
                  />
                )}
              </View>
            </View>
          ))
        )}
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
    paddingHorizontal: 32,
  },
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  noPlanTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  noPlanText: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  planButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  planButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  contractCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contractInfo: {
    flex: 1,
    marginRight: 12,
  },
  contractCode: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 4,
  },
  contractType: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: CustomColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  contractDetails: {
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
});

export default MyContractsScreen;

