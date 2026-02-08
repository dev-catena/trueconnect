import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';

interface Contract {
  id: number;
  codigo?: string;
  descricao?: string;
  status?: string;
  duracao?: number;
  dt_inicio?: string;
  dt_fim?: string;
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

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<Contract[] | { result: Contract[] }>('usuario/contratos');

      let contractsList: Contract[] = [];
      if (Array.isArray(response)) {
        contractsList = response;
      } else if (response?.result && Array.isArray(response.result)) {
        contractsList = response.result;
      } else if (response?.data && Array.isArray(response.data)) {
        contractsList = response.data;
      }

      setContracts(contractsList);
    } catch (error: any) {
      console.error('Erro ao carregar contratos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus contratos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    const colors: { [key: string]: string } = {
      'Ativo': CustomColors.activeColor,
      'Pendente': '#FFA500',
      'Concluído': '#4CAF50',
      'Expirado': '#888888',
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Contratos</Text>
          <View style={styles.placeholder} />
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Contratos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {contracts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="document" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyTitle}>Nenhum contrato encontrado</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui contratos cadastrados.
            </Text>
          </View>
        ) : (
          contracts.map((contract) => (
            <View key={contract.id} style={styles.contractCard}>
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
                    <SafeIcon name="calendar" size={16} color={CustomColors.activeGreyed} />
                    <Text style={styles.detailText}>
                      Início: {formatDate(contract.dt_inicio)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
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
  contractCard: {
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

