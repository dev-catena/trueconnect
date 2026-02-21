import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';
import CustomScaffold from '../../../components/CustomScaffold';

type MyPlansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyPlans'>;

interface Plan {
  id: number;
  name: string;
  description: string;
  features?: string[];
  is_active?: boolean;
}

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string | null;
  plan?: Plan;
}

const MyPlansScreen: React.FC = () => {
  const navigation = useNavigation<MyPlansScreenNavigationProp>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [shouldShowAddPlanButton, setShouldShowAddPlanButton] = useState(true);
  const [availableLimits, setAvailableLimits] = useState<any>(null);

  useEffect(() => {
    loadSubscriptions();
    loadAvailablePlans();
    loadAvailableLimits();
  }, []);

  // Recarregar dados quando a tela voltar ao foco (após compras, etc)
  useFocusEffect(
    React.useCallback(() => {
      console.log('MyPlansScreen - Tela ganhou foco, recarregando dados...');
      loadSubscriptions();
      loadAvailableLimits();
    }, [])
  );

  useEffect(() => {
    // Verificar se deve mostrar o botão "Assinar Novo Plano"
    checkShouldShowAddPlanButton();
  }, [availablePlans, subscriptions]);

  const loadSubscriptions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Subscription[] }>('user/subscriptions');

      if (response.success && Array.isArray(response.data)) {
        setSubscriptions(response.data);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar seus planos.');
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus planos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'active': 'Ativo',
      'cancelled': 'Cancelado',
      'expired': 'Expirado',
      'pending': 'Pendente',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': '#4CAF50',
      'cancelled': CustomColors.vividRed,
      'expired': '#888888',
      'pending': '#FFA500',
    };
    return colors[status] || CustomColors.activeGreyed;
  };

  const formatDate = (dateString: string) => {
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


  const loadAvailablePlans = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Plan[] }>('plans');
      if (response.success && Array.isArray(response.data)) {
        const activePlans = response.data.filter(plan => plan.is_active);
        setAvailablePlans(activePlans);
      }
    } catch (error) {
      console.error('Erro ao carregar planos disponíveis:', error);
    }
  };

  const loadAvailableLimits = async () => {
    try {
      console.log('MyPlansScreen - Carregando limites disponíveis...');
      const api = new ApiProvider(true);
      const response = await api.get('additional-purchases/limits');
      if (response.success && response.data) {
        console.log('MyPlansScreen - Limites carregados:', response.data);
        setAvailableLimits(response.data);
      } else {
        console.warn('MyPlansScreen - Resposta de limites não tem sucesso ou dados:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar limites disponíveis:', error);
    }
  };

  const checkShouldShowAddPlanButton = () => {
    // Se não há planos disponíveis, não mostrar o botão
    if (availablePlans.length === 0) {
      setShouldShowAddPlanButton(false);
      return;
    }

    // Se há apenas um plano disponível
    if (availablePlans.length === 1) {
      const singlePlan = availablePlans[0];
      // Verificar se o usuário já tem assinatura ativa desse plano
      const hasActiveSubscription = subscriptions.some(
        sub => sub.plan_id === singlePlan.id && sub.status === 'active'
      );
      
      // Se já tem assinatura ativa do único plano, não mostrar o botão
      setShouldShowAddPlanButton(!hasActiveSubscription);
      return;
    }

    // Se há mais de um plano, sempre mostrar o botão
    setShouldShowAddPlanButton(true);
  };

  const handleAddPlan = () => {
    navigation.navigate('Plans');
  };

  const handlePurchaseAdditional = (type: 'contracts' | 'connections') => {
    navigation.navigate('AdditionalPurchaseQuantity', { type });
  };

  if (loading) {
    return (
      <CustomScaffold title="Meus Planos">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando planos...</Text>
        </View>
      </CustomScaffold>
    );
  }

  return (
    <CustomScaffold 
      title="Meus Planos"
      showProfileButton={false}
      showBackButton={true}
      floatingActionButton={
        shouldShowAddPlanButton ? (
          <TouchableOpacity onPress={handleAddPlan} style={styles.fabButton}>
            <SafeIcon name="add-circle" size={32} color={CustomColors.white} />
          </TouchableOpacity>
        ) : undefined
      }
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="card" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyTitle}>Nenhum plano encontrado</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui planos ativos. Assine um plano para desbloquear recursos.
            </Text>
            {shouldShowAddPlanButton && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={handleAddPlan}
              >
                <SafeIcon name="add-circle" size={20} color={CustomColors.white} />
                <Text style={styles.browseButtonText}>Assinar Plano</Text>
              </TouchableOpacity>
            )}
            {!shouldShowAddPlanButton && availablePlans.length === 1 && (
              <Text style={styles.infoText}>
                Você já possui assinatura ativa do único plano disponível.
              </Text>
            )}
          </View>
        ) : (
          <>
            {subscriptions
              .filter((subscription) => {
                // Se o plano está cancelado, verificar se há um plano ativo do mesmo tipo
                if (subscription.status === 'cancelled') {
                  const hasActiveSamePlan = subscriptions.some(
                    (sub) => 
                      sub.plan_id === subscription.plan_id && 
                      sub.status === 'active' &&
                      sub.id !== subscription.id
                  );
                  // Não mostrar plano cancelado se há um plano ativo do mesmo tipo
                  return !hasActiveSamePlan;
                }
                // Mostrar todos os planos que não são cancelados
                return true;
              })
              .map((subscription) => {
              const status = subscription.status;
              const statusColor = getStatusColor(status);
              const statusLabel = getStatusLabel(status);

              return (
                <View key={subscription.id} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>
                        {subscription.plan?.name || `Plano #${subscription.plan_id}`}
                      </Text>
                      {subscription.plan?.description && (
                        <Text style={styles.planDescription}>
                          {subscription.plan.description}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '33', borderColor: statusColor }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.planDetails}>
                    <View style={styles.detailRow}>
                      <SafeIcon name="calendar" size={16} color={CustomColors.activeGreyed} />
                      <Text style={styles.detailText}>
                        Início: {formatDate(subscription.start_date)}
                      </Text>
                    </View>
                    {subscription.end_date && (
                      <View style={styles.detailRow}>
                        <SafeIcon name="time" size={16} color={CustomColors.activeGreyed} />
                        <Text style={styles.detailText}>
                          Término: {formatDate(subscription.end_date)}
                        </Text>
                      </View>
                    )}
                    {!subscription.end_date && status === 'active' && (
                      <View style={styles.detailRow}>
                        <SafeIcon name="check-circle" size={16} color={CustomColors.activeColor} />
                        <Text style={[styles.detailText, { color: CustomColors.activeColor }]}>
                          Sem data de término
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Funcionalidades do Plano */}
                  {subscription.plan?.features && Array.isArray(subscription.plan.features) && subscription.plan.features.length > 0 && (
                    <View style={styles.featuresSection}>
                      <Text style={styles.featuresTitle}>Funcionalidades:</Text>
                      {subscription.plan.features.map((feature: string, index: number) => (
                        <View key={index} style={styles.featureItem}>
                          <SafeIcon name="checkmark-circle" size={16} color={CustomColors.successGreen} />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Informações de Contratos e Conexões */}
                  {status === 'active' && availableLimits && (
                    <View style={styles.limitsSection}>
                      <Text style={styles.limitsTitle}>Recursos Disponíveis:</Text>
                      
                      <View style={styles.limitsRow}>
                        {/* Contratos */}
                        <View style={styles.limitCard}>
                          <View style={styles.limitHeader}>
                            <SafeIcon name="document-text" size={20} color={CustomColors.activeColor} />
                            <Text style={styles.limitLabel}>Contratos</Text>
                          </View>
                          <View style={styles.limitDetails}>
                            <View style={styles.limitRow}>
                              <Text style={styles.limitDetailText}>
                                Do plano: {availableLimits.contracts?.plan_limit != null ? availableLimits.contracts.plan_limit : 'Ilimitado'}
                              </Text>
                            </View>
                            {(availableLimits.contracts?.additional ?? 0) > 0 && (
                              <View style={styles.limitRow}>
                                <Text style={styles.limitDetailText}>
                                  Compras adicionais: +{availableLimits.contracts.additional}
                                </Text>
                              </View>
                            )}
                            <View style={styles.limitRow}>
                              <Text style={styles.limitTotalText}>
                                Total: {availableLimits.contracts?.total_limit != null ? availableLimits.contracts.total_limit : 'Ilimitado'}
                              </Text>
                            </View>
                            <View style={styles.limitRow}>
                              <Text style={styles.limitUsedText}>
                                Utilizados: {availableLimits.contracts?.used ?? 0}
                              </Text>
                            </View>
                            {availableLimits.contracts?.available != null && (
                              <View style={styles.limitRow}>
                                <Text style={[styles.limitAvailableText, availableLimits.contracts.available === 0 && styles.limitAvailableTextZero]}>
                                  Disponíveis: {availableLimits.contracts.available}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Conexões */}
                        <View style={styles.limitCard}>
                          <View style={styles.limitHeader}>
                            <SafeIcon name="people" size={20} color={CustomColors.successGreen} />
                            <Text style={styles.limitLabel}>Conexões</Text>
                          </View>
                          <View style={styles.limitDetails}>
                            <View style={styles.limitRow}>
                              <Text style={styles.limitDetailText}>
                                Do plano: {availableLimits.connections?.plan_limit != null ? availableLimits.connections.plan_limit : 'Ilimitado'}
                              </Text>
                            </View>
                            {(availableLimits.connections?.additional ?? 0) > 0 && (
                              <View style={styles.limitRow}>
                                <Text style={styles.limitDetailText}>
                                  Compras adicionais: +{availableLimits.connections.additional}
                                </Text>
                              </View>
                            )}
                            <View style={styles.limitRow}>
                              <Text style={styles.limitTotalText}>
                                Total: {availableLimits.connections?.total_limit != null ? availableLimits.connections.total_limit : 'Ilimitado'}
                              </Text>
                            </View>
                            <View style={styles.limitRow}>
                              <Text style={styles.limitUsedText}>
                                Utilizadas: {availableLimits.connections?.used ?? 0}
                              </Text>
                            </View>
                            {availableLimits.connections?.available != null && (
                              <View style={styles.limitRow}>
                                <Text style={[styles.limitAvailableText, availableLimits.connections.available === 0 && styles.limitAvailableTextZero]}>
                                  Disponíveis: {availableLimits.connections.available}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Cards para comprar mais - um abaixo do outro */}
                  {status === 'active' && (
                    <View style={styles.additionalPurchaseSection}>
                      <Text style={styles.additionalPurchaseTitle}>Comprar Mais:</Text>
                      <View style={styles.additionalPurchaseCards}>
                        <TouchableOpacity
                          style={[styles.additionalPurchaseCard, styles.contractsButton]}
                          onPress={() => handlePurchaseAdditional('contracts')}
                          activeOpacity={0.8}
                        >
                          <SafeIcon name="document-text" size={24} color={CustomColors.white} />
                          <Text style={styles.additionalPurchaseCardText}>+ Contratos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.additionalPurchaseCard, styles.connectionsButton]}
                          onPress={() => handlePurchaseAdditional('connections')}
                          activeOpacity={0.8}
                        >
                          <SafeIcon name="people" size={24} color={CustomColors.white} />
                          <Text style={styles.additionalPurchaseCardText}>+ Conexões</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            {shouldShowAddPlanButton && (
              <TouchableOpacity
                style={styles.addPlanButton}
                onPress={handleAddPlan}
              >
                <SafeIcon name="add-circle" size={24} color={CustomColors.white} />
                <Text style={styles.addPlanButtonText}>Assinar Novo Plano</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  infoText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    fontStyle: 'italic',
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
  planCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planDetails: {
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
  addPlanButton: {
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
  addPlanButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  featuresSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginLeft: 8,
    flex: 1,
  },
  additionalPurchaseSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  additionalPurchaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 12,
  },
  additionalPurchaseCards: {
    flexDirection: 'column',
    gap: 12,
  },
  additionalPurchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  contractsButton: {
    backgroundColor: CustomColors.activeColor,
  },
  connectionsButton: {
    backgroundColor: CustomColors.successGreen,
  },
  additionalPurchaseCardText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  limitsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  limitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 12,
  },
  limitsRow: {
    flexDirection: 'column',
    gap: 12,
  },
  limitCard: {
    width: '100%',
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  limitLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: CustomColors.black,
  },
  limitDetails: {
    marginTop: 8,
  },
  limitRow: {
    marginBottom: 6,
  },
  limitDetailText: {
    fontSize: 13,
    color: CustomColors.activeGreyed,
  },
  limitTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeColor,
    marginTop: 4,
  },
  limitUsedText: {
    fontSize: 14,
    fontWeight: '500',
    color: CustomColors.black,
    marginTop: 4,
  },
  limitAvailableText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.successGreen,
    marginTop: 4,
  },
  limitAvailableTextZero: {
    color: CustomColors.vividRed,
  },
});

export default MyPlansScreen;

