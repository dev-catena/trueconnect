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
import CustomScaffold from '../../../components/CustomScaffold';
import AdditionalPurchaseModal from '../components/AdditionalPurchaseModal';

type PlansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Plans'>;

interface Plan {
  id: number;
  name: string;
  description: string;
  monthly_price: number;
  semiannual_price: number;
  annual_price: number;
  one_time_price: number | null;
  seals_limit: number | null;
  contracts_limit: number | null;
  features: string[];
  is_active: boolean;
}

type BillingCycle = 'monthly' | 'semiannual' | 'annual' | 'one_time';

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string | null;
  plan?: Plan;
}

interface AdditionalPurchasePrices {
  contracts: {
    unit_price: number;
    min_quantity: number;
    max_quantity: number;
  };
  connections: {
    unit_price: number;
    min_quantity: number;
    max_quantity: number;
  };
}

interface AvailableLimits {
  contracts: {
    plan_limit: number | null;
    additional: number;
    total_limit: number | null;
    used: number;
    available: number | null;
    is_unlimited: boolean;
  };
  connections: {
    plan_limit: number | null;
    additional: number;
    total_limit: number | null;
    used: number;
    available: number | null;
    is_unlimited: boolean;
  };
}

const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansScreenNavigationProp>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('one_time');
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [additionalPrices, setAdditionalPrices] = useState<AdditionalPurchasePrices | null>(null);
  const [availableLimits, setAvailableLimits] = useState<AvailableLimits | null>(null);
  const [showAdditionalPurchase, setShowAdditionalPurchase] = useState(false);
  const [additionalType, setAdditionalType] = useState<'contracts' | 'connections'>('contracts');
  const [additionalQuantity, setAdditionalQuantity] = useState(1);
  const [modalKey, setModalKey] = useState(0); // Contador para forçar re-renderização

  useEffect(() => {
    loadPlans();
    loadActiveSubscription();
    loadAdditionalPrices();
    loadAvailableLimits();
  }, []);

  // Log para debug quando o modal abrir
  useEffect(() => {
    if (showAdditionalPurchase) {
      console.log('🔵 Modal visível - additionalType:', additionalType);
    }
  }, [showAdditionalPurchase, additionalType]);

  const loadAdditionalPrices = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: AdditionalPurchasePrices }>('additional-purchases/prices');
      if (response.success && response.data) {
        setAdditionalPrices(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar preços de compras adicionais:', error);
    }
  };

  const loadAvailableLimits = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: AvailableLimits }>('additional-purchases/limits');
      if (response.success && response.data) {
        setAvailableLimits(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar limites disponíveis:', error);
    }
  };


  // Função auxiliar para abrir o modal com o tipo correto
  const openAdditionalPurchaseModal = (type: 'contracts' | 'connections') => {
    console.log('🔵 PlansScreen - openAdditionalPurchaseModal chamado com type:', type);
    console.log('🔵 PlansScreen - Estado atual additionalType:', additionalType);
    console.log('🔵 PlansScreen - Estado atual showAdditionalPurchase:', showAdditionalPurchase);
    
    // SEMPRE fechar primeiro para garantir re-renderização
    setShowAdditionalPurchase(false);
    setModalKey(prev => prev + 1); // Incrementar contador para forçar re-renderização
    
    // Usar setTimeout para garantir que o estado seja atualizado
    setTimeout(() => {
      console.log('🔵 PlansScreen - Definindo novo tipo:', type);
      setAdditionalType(type);
      setAdditionalQuantity(1);
      console.log('🔵 PlansScreen - Abrindo modal com type:', type, 'modalKey:', modalKey + 1);
      setShowAdditionalPurchase(true);
    }, 100);
  };

  // Função para lidar com a compra do modal
  const handleModalPurchase = async (type: 'contracts' | 'connections', quantity: number) => {
    if (!additionalPrices) return;

    console.log('🔵 handleModalPurchase chamado com type:', type, 'quantity:', quantity);

    try {
      const api = new ApiProvider(true);
      const response = await api.post('additional-purchases', {
        type: type,
        quantity: quantity,
      });

      if (response.success) {
        // Fechar o modal antes de navegar
        setShowAdditionalPurchase(false);
        setAdditionalQuantity(1);
        
        // Navegar para tela de pagamento (store purchase mockup)
        const unitPrice = type === 'contracts' 
          ? additionalPrices.contracts.unit_price 
          : additionalPrices.connections.unit_price;
        const totalPrice = unitPrice * quantity;

        navigation.navigate('StorePurchaseMockup', {
          plan: null,
          billingCycle: 'one_time',
          price: totalPrice,
          isSeal: false,
          additionalPurchase: {
            purchaseId: response.data.id,
            type: type,
            quantity: quantity,
          },
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar compra adicional:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao processar compra adicional');
    }
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Plan[] }>('plans');

      if (response.success && Array.isArray(response.data)) {
        // Normalizar os preços para garantir que são números
        const normalizedPlans = response.data
          .filter(plan => plan.is_active)
          .map(plan => ({
            ...plan,
            monthly_price: plan.monthly_price != null ? Number(plan.monthly_price) : 0,
            semiannual_price: plan.semiannual_price != null ? Number(plan.semiannual_price) : 0,
            annual_price: plan.annual_price != null ? Number(plan.annual_price) : 0,
            one_time_price: plan.one_time_price != null ? Number(plan.one_time_price) : null,
          }));
        setPlans(normalizedPlans);
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os planos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSubscription = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Subscription[] }>('user/subscriptions');

      if (response.success && Array.isArray(response.data)) {
        // Buscar a assinatura ativa (status 'active' e end_date >= hoje)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const active = response.data.find((sub: Subscription) => {
          if (sub.status !== 'active') return false;
          if (!sub.end_date) return true; // Se não tem data de fim, considera ativa
          const endDate = new Date(sub.end_date);
          endDate.setHours(0, 0, 0, 0);
          return endDate >= today;
        });

        if (active) {
          setActiveSubscription(active);
          setSelectedPlanId(active.plan_id);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar assinatura ativa:', error);
      // Não mostrar erro ao usuário, apenas logar
    }
  };

  const getPrice = (plan: Plan): number => {
    let price: number | undefined | null;
    
    // Se renovação automática está desativada, sempre retorna o preço único
    if (!autoRenewal) {
      price = plan.one_time_price;
    } else {
      // Se renovação automática está ativada, usa o ciclo selecionado
      switch (billingCycle) {
        case 'monthly':
          price = plan.monthly_price;
          break;
        case 'semiannual':
          price = plan.semiannual_price;
          break;
        case 'annual':
          price = plan.annual_price;
          break;
        case 'one_time':
          price = plan.one_time_price;
          break;
        default:
          price = plan.monthly_price;
      }
    }
    
    // Garantir que sempre retorna um número válido
    return price != null && !isNaN(Number(price)) ? Number(price) : 0;
  };
  
  const hasOneTimePrice = (plan: Plan): boolean => {
    return plan.one_time_price != null && plan.one_time_price > 0;
  };
  
  const handleAutoRenewalChange = (value: boolean) => {
    setAutoRenewal(value);
    // Se desativar renovação automática, volta para one_time
    if (!value) {
      setBillingCycle('one_time');
    } else {
      // Se ativar, muda para mensal por padrão
      setBillingCycle('monthly');
    }
  };

  const getBillingLabel = () => {
    if (!autoRenewal) {
      return 'único';
    }
    switch (billingCycle) {
      case 'monthly':
        return 'mês';
      case 'semiannual':
        return 'semestre';
      case 'annual':
        return 'ano';
      case 'one_time':
        return 'único';
      default:
        return 'mês';
    }
  };
  
  const getCurrentBillingCycle = (): BillingCycle => {
    if (!autoRenewal) {
      return 'one_time';
    }
    return billingCycle;
  };

  const formatPrice = (price: number | null | undefined): string => {
    // Garantir que price é um número válido
    const numPrice = price != null && !isNaN(Number(price)) ? Number(price) : 0;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    const cycle = getCurrentBillingCycle();
    navigation.navigate('PlanDetail', { plan, billingCycle: cycle });
  };

  const isPlanActive = (planId: number): boolean => {
    return activeSubscription?.plan_id === planId;
  };

  const isPlanSelected = (planId: number): boolean => {
    return selectedPlanId === planId;
  };

  const getPlanCardStyle = (plan: Plan) => {
    const isActive = isPlanActive(plan.id);
    const isSelected = isPlanSelected(plan.id);
    const hasActivePlan = activeSubscription !== null;

    if (isActive || isSelected) {
      return [styles.planCard, styles.planCardHighlighted];
    }
    
    if (hasActivePlan && !isActive) {
      return [styles.planCard, styles.planCardDimmed];
    }

    return styles.planCard;
  };

  if (loading) {
    return (
      <CustomScaffold title="Planos" showBackButton={true} showProfileButton={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando planos...</Text>
        </View>
      </CustomScaffold>
    );
  }

  return (
    <>
    <CustomScaffold title="Planos Disponíveis" showBackButton={true} showProfileButton={true}>
      {!showAdditionalPurchase ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
        >
        {/* Auto Renewal Checkbox */}
        <View style={styles.autoRenewalContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleAutoRenewalChange(!autoRenewal)}
          >
            <View style={[styles.checkbox, autoRenewal && styles.checkboxChecked]}>
              {autoRenewal && (
                <SafeIcon name="check" size={16} color={CustomColors.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Renovação automática</Text>
          </TouchableOpacity>
          {autoRenewal && (
            <Text style={styles.checkboxDescription}>
              Seu plano será renovado automaticamente no período escolhido
            </Text>
          )}
        </View>

        {/* Billing Cycle Selector - Só aparece se renovação automática estiver ativada */}
        {autoRenewal && (
          <View style={styles.billingSelector}>
            <TouchableOpacity
              style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[styles.billingText, billingCycle === 'monthly' && styles.billingTextActive]}>
                Mensal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.billingOption, billingCycle === 'semiannual' && styles.billingOptionActive]}
              onPress={() => setBillingCycle('semiannual')}
            >
              <Text style={[styles.billingText, billingCycle === 'semiannual' && styles.billingTextActive]}>
                Semestral
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-10%</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.billingOption, billingCycle === 'annual' && styles.billingOptionActive]}
              onPress={() => setBillingCycle('annual')}
            >
              <Text style={[styles.billingText, billingCycle === 'annual' && styles.billingTextActive]}>
                Anual
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Compras Adicionais - Só mostrar se o modal não estiver aberto */}
        {(() => {
          const shouldShow = !showAdditionalPurchase && activeSubscription && availableLimits && additionalPrices;
          console.log('🔴🔴🔴 RENDERIZAÇÃO - Seção Compras Adicionais:', {
            showAdditionalPurchase,
            activeSubscription: !!activeSubscription,
            availableLimits: !!availableLimits,
            additionalPrices: !!additionalPrices,
            shouldShow
          });
          return shouldShow;
        })() && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Comprar Recursos Adicionais</Text>
            <Text style={styles.sectionDescription}>
              Precisa de mais contratos ou conexões? Compre recursos adicionais sem precisar fazer upgrade do plano.
            </Text>
            
            {/* Contratos Adicionais */}
            {(() => {
              const shouldShowContracts = !availableLimits.contracts.is_unlimited;
              console.log('🔴🔴🔴 RENDERIZAÇÃO - Botão Contratos:', {
                is_unlimited: availableLimits.contracts.is_unlimited,
                shouldShowContracts
              });
              return shouldShowContracts;
            })() && (
              <View style={styles.additionalCard}>
                <View style={styles.additionalHeader}>
                  <SafeIcon name="document-text" size={24} color={CustomColors.activeColor} />
                  <View style={styles.additionalInfo}>
                    <Text style={styles.additionalTitle}>Contratos Adicionais</Text>
                    <Text style={styles.additionalSubtitle}>
                      {availableLimits.contracts.used}/{availableLimits.contracts.total_limit} utilizados
                    </Text>
                  </View>
                  <Text style={styles.additionalPrice}>
                    R$ {additionalPrices.contracts.unit_price.toFixed(2).replace('.', ',')}/unidade
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => {
                    console.log('🔴 BOTÃO CLICADO - Comprar Mais Contratos');
                    console.log('🔴 Estado antes:', { additionalType, showAdditionalPurchase });
                    openAdditionalPurchaseModal('contracts');
                    console.log('🔴 Estado depois (pode não estar atualizado ainda):', { additionalType, showAdditionalPurchase });
                  }}
                >
                  <Text style={styles.buyButtonText}>Comprar Mais Contratos</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Conexões Adicionais */}
            {(() => {
              // Sempre mostrar o botão se houver preços disponíveis, independente de ser ilimitado ou não
              const shouldShow = additionalPrices && additionalPrices.connections;
              console.log('🔴🔴🔴 RENDERIZAÇÃO - Botão Conexões:', {
                showAdditionalPurchase,
                is_unlimited: availableLimits.connections.is_unlimited,
                total_limit: availableLimits.connections.total_limit,
                hasPrices: !!additionalPrices?.connections,
                shouldShow: shouldShow
              });
              return shouldShow;
            })() && (
              <View style={styles.additionalCard}>
                <View style={styles.additionalHeader}>
                  <SafeIcon name="connections" size={24} color={CustomColors.activeColor} />
                  <View style={styles.additionalInfo}>
                    <Text style={styles.additionalTitle}>Conexões Adicionais</Text>
                    <Text style={styles.additionalSubtitle}>
                      {availableLimits.connections.used}/{availableLimits.connections.total_limit} utilizadas
                    </Text>
                  </View>
                  <Text style={styles.additionalPrice}>
                    R$ {additionalPrices.connections.unit_price.toFixed(2).replace('.', ',')}/unidade
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.buyButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('🔴🔴🔴🔴🔴 BOTÃO CLICADO - Comprar Mais Conexões 🔴🔴🔴🔴🔴');
                    console.log('🔴 Estado ANTES:', { additionalType, showAdditionalPurchase, modalKey });
                    
                    // Fechar modal se estiver aberto
                    if (showAdditionalPurchase) {
                      console.log('🔴 Fechando modal primeiro...');
                      setShowAdditionalPurchase(false);
                    }
                    
                    // Incrementar key
                    const newKey = modalKey + 1;
                    setModalKey(newKey);
                    console.log('🔴 Nova modalKey:', newKey);
                    
                    // Aguardar um pouco e então abrir com o tipo correto
                    setTimeout(() => {
                      console.log('🔴🔴🔴 Definindo type como connections 🔴🔴🔴');
                      setAdditionalType('connections');
                      setAdditionalQuantity(1);
                      console.log('🔴🔴🔴 Abrindo modal com type: connections 🔴🔴🔴');
                      setShowAdditionalPurchase(true);
                    }, 150);
                  }}
                >
                  <Text style={styles.buyButtonText}>Comprar Mais Conexões</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="document" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyTitle}>Nenhum plano disponível</Text>
            <Text style={styles.emptyText}>
              Não há planos disponíveis no momento.
            </Text>
          </View>
        ) : (
          plans.map((plan) => {
            const isActive = isPlanActive(plan.id);
            const isSelected = isPlanSelected(plan.id);
            
            return (
            <TouchableOpacity
              key={plan.id}
              style={getPlanCardStyle(plan)}
              onPress={() => handleSelectPlan(plan)}
              activeOpacity={0.7}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <View style={styles.planNameContainer}>
                    <Text style={[styles.planName, (isActive || isSelected) && styles.planNameHighlighted]}>
                      {plan.name}
                    </Text>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Ativo</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planDescription, (isActive || isSelected) && styles.planDescriptionHighlighted]}>
                    {plan.description}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{formatPrice(getPrice(plan))}</Text>
                  {autoRenewal && billingCycle !== 'one_time' && (
                    <Text style={styles.pricePeriod}>/{getBillingLabel()}</Text>
                  )}
                  {(!autoRenewal || billingCycle === 'one_time') && (
                    <Text style={styles.pricePeriod}> único</Text>
                  )}
                </View>
              </View>

              {plan.features && plan.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <SafeIcon name="check" size={16} color={CustomColors.activeColor} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                  {plan.features.length > 3 && (
                    <Text style={styles.moreFeatures}>
                      +{plan.features.length - 3} funcionalidades
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.limitsContainer}>
                {plan.seals_limit !== null && (
                  <View style={styles.limitItem}>
                    <SafeIcon name="shield" size={16} color={CustomColors.activeGreyed} />
                    <Text style={styles.limitText}>
                      {plan.seals_limit === 0 ? 'Ilimitado' : `${plan.seals_limit} selos`}
                    </Text>
                  </View>
                )}
                {plan.contracts_limit !== null && (
                  <View style={styles.limitItem}>
                    <SafeIcon name="document-text" size={16} color={CustomColors.activeGreyed} />
                    <Text style={styles.limitText}>
                      {plan.contracts_limit === 0 ? 'Ilimitado' : `${plan.contracts_limit} contratos`}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  (isActive || isSelected) && styles.selectButtonHighlighted
                ]}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text style={styles.selectButtonText}>
                  {isActive ? 'Plano Ativo' : isSelected ? 'Plano Selecionado' : 'Escolher Plano'}
                </Text>
                {!isActive && (
                  <SafeIcon name="arrow-forward" size={20} color={CustomColors.white} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
            );
          })
        )}
        </ScrollView>
      ) : null}
    </CustomScaffold>

    {/* Modal para comprar recursos adicionais - Componente Separado - FORA do CustomScaffold */}
    {(() => {
      const shouldRenderModal = showAdditionalPurchase && additionalPrices;
      console.log('🔴🔴🔴 RENDERIZAÇÃO - Modal:', {
        showAdditionalPurchase,
        additionalPrices: !!additionalPrices,
        additionalType,
        modalKey,
        shouldRenderModal
      });
      return shouldRenderModal;
    })() && (
      <AdditionalPurchaseModal
        key={`modal-${additionalType}-${modalKey}`}
        visible={showAdditionalPurchase}
        type={additionalType}
        prices={additionalPrices}
        onClose={() => {
          console.log('🔵 PlansScreen - Modal fechado');
          setShowAdditionalPurchase(false);
          setAdditionalQuantity(1);
        }}
        onPurchase={handleModalPurchase}
      />
    )}
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  contentHidden: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
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
  billingSelector: {
    flexDirection: 'row',
    backgroundColor: CustomColors.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    position: 'relative',
  },
  billingOptionActive: {
    backgroundColor: CustomColors.activeColor,
  },
  billingText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeGreyed,
  },
  billingTextActive: {
    color: CustomColors.white,
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: CustomColors.white,
    fontSize: 10,
    fontWeight: 'bold',
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
  autoRenewalContainer: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    backgroundColor: CustomColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: CustomColors.activeColor,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    flex: 1,
  },
  checkboxDescription: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    marginTop: 8,
    marginLeft: 36,
  },
  planCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardHighlighted: {
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    backgroundColor: '#F0F9FF',
    shadowColor: CustomColors.activeColor,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  planCardDimmed: {
    opacity: 0.5,
  },
  planHeader: {
    marginBottom: 16,
  },
  planInfo: {
    marginBottom: 12,
  },
  planNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  planNameHighlighted: {
    color: CustomColors.activeColor,
  },
  planDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  planDescriptionHighlighted: {
    color: CustomColors.black,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: CustomColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  pricePeriod: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: CustomColors.black,
    marginLeft: 8,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    fontStyle: 'italic',
    marginTop: 4,
  },
  limitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  limitText: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    marginLeft: 6,
  },
  selectButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  selectButtonHighlighted: {
    backgroundColor: '#4CAF50',
  },
  selectButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  additionalSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 16,
    lineHeight: 20,
  },
  additionalCard: {
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
  additionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  additionalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 4,
  },
  additionalSubtitle: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  additionalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  buyButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buyButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  modalHeaderFull: {
    backgroundColor: CustomColors.activeColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalBackButton: {
    padding: 4,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
    flex: 1,
  },
  modalProfileButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
    paddingBottom: 120, // Espaço para o menu inferior (tabs)
  },
  modalDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 24,
    lineHeight: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: CustomColors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 80,
    height: 48,
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginHorizontal: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: CustomColors.black,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  purchaseButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlansScreen;

