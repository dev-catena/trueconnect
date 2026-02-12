import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';
import { Connection } from '../../../types';

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string | null;
}

type MyConnectionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyConnections'>;

interface ConnectionsResponse {
  result: {
    pendentes: Connection[];
    ativas: Connection[];
    aguardando_resposta: Connection[];
  };
}

const MyConnectionsScreen: React.FC = () => {
  const navigation = useNavigation<MyConnectionsScreenNavigationProp>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);

  useEffect(() => {
    checkActivePlan();
  }, []);

  useEffect(() => {
    if (hasActivePlan === true) {
      loadConnections();
    } else if (hasActivePlan === false) {
      setLoading(false);
    }
  }, [hasActivePlan]);

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

  const loadConnections = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<ConnectionsResponse>('usuario/conexoes');

      if (response.result) {
        const allConnections = [
          ...(response.result.pendentes || []),
          ...(response.result.ativas || []),
          ...(response.result.aguardando_resposta || []),
        ];
        setConnections(allConnections);
      }
    } catch (error: any) {
      console.error('Erro ao carregar conexões:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas conexões. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (connection: Connection) => {
    if (connection.aceito === true) return 'Aceita';
    if (connection.aceito === false) return 'Rejeitada';
    if (connection.solicitante_id === user?.id) return 'Aguardando Resposta';
    return 'Pendente';
  };

  const getStatusColor = (connection: Connection) => {
    if (connection.aceito === true) return CustomColors.activeColor;
    if (connection.aceito === false) return CustomColors.vividRed;
    return '#FFA500';
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

  const getOtherUser = (connection: Connection) => {
    if (connection.solicitante_id === user?.id) {
      return connection.destinatario;
    }
    return connection.solicitante;
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
              <Text style={styles.headerTitle}>Minhas Conexões</Text>
            </View>
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              <SafeIcon name="profile" size={28} color={CustomColors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando conexões...</Text>
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
            <Text style={styles.headerTitle}>Minhas Conexões</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <SafeIcon name="profile" size={28} color={CustomColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasActivePlan === false ? (
          <View style={styles.noPlanContainer}>
            <SafeIcon name="link-off" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.noPlanTitle}>Funcionalidade Indisponível</Text>
            <Text style={styles.noPlanText}>
              Esta funcionalidade não está disponível no momento. Para acessar suas conexões, você precisa contratar um plano.
            </Text>
            <TouchableOpacity
              style={styles.planButton}
              onPress={() => navigation.navigate('Plans')}
            >
              <Text style={styles.planButtonText}>Contratar Plano</Text>
              <SafeIcon name="arrow-forward" size={20} color={CustomColors.white} />
            </TouchableOpacity>
          </View>
        ) : connections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="link-off" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyTitle}>Nenhuma conexão encontrada</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui conexões estabelecidas.
            </Text>
          </View>
        ) : (
          connections.map((connection) => {
            const otherUser = getOtherUser(connection);
            const statusLabel = getStatusLabel(connection);
            const statusColor = getStatusColor(connection);

            return (
              <View key={connection.id} style={styles.connectionCard}>
                <View style={styles.connectionHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusLabel}</Text>
                  </View>
                </View>
                <View style={styles.connectionInfo}>
                  <Text style={styles.userName}>
                    {otherUser?.nome_completo || otherUser?.name || 'Usuário'}
                  </Text>
                  {otherUser?.email && (
                    <Text style={styles.userEmail}>{otherUser.email}</Text>
                  )}
                  {otherUser?.cidade && otherUser?.estado && (
                    <Text style={styles.userLocation}>
                      {otherUser.cidade}, {otherUser.estado}
                    </Text>
                  )}
                </View>
                <View style={styles.connectionDetails}>
                  <View style={styles.detailRow}>
                    <SafeIcon name="calendar" size={16} color={CustomColors.activeGreyed} />
                    <Text style={styles.detailText}>
                      Criada em: {formatDate(connection.created_at)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
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
  connectionCard: {
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
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
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
  connectionInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
  },
  connectionDetails: {
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginLeft: 8,
  },
});

export default MyConnectionsScreen;

