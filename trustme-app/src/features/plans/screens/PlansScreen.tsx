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

type PlansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Plans'>;

interface Plan {
  id: number;
  name: string;
  description: string;
  monthly_price: number;
  semiannual_price: number;
  annual_price: number;
  seals_limit: number | null;
  contracts_limit: number | null;
  features: string[];
  is_active: boolean;
}

const PlansScreen: React.FC = () => {
  const navigation = useNavigation<PlansScreenNavigationProp>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'semiannual' | 'annual'>('monthly');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: Plan[] }>('plans');

      if (response.success && Array.isArray(response.data)) {
        setPlans(response.data.filter(plan => plan.is_active));
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os planos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: Plan) => {
    switch (billingCycle) {
      case 'monthly':
        return plan.monthly_price;
      case 'semiannual':
        return plan.semiannual_price;
      case 'annual':
        return plan.annual_price;
      default:
        return plan.monthly_price;
    }
  };

  const getBillingLabel = () => {
    switch (billingCycle) {
      case 'monthly':
        return 'mês';
      case 'semiannual':
        return '6 meses';
      case 'annual':
        return 'ano';
      default:
        return 'mês';
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleSelectPlan = (plan: Plan) => {
    navigation.navigate('PlanDetail', { plan, billingCycle });
  };

  if (loading) {
    return (
      <CustomScaffold title="Planos" showBackButton>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando planos...</Text>
        </View>
      </CustomScaffold>
    );
  }

  return (
    <CustomScaffold title="Planos Disponíveis" showBackButton>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Billing Cycle Selector */}
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
          plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              onPress={() => handleSelectPlan(plan)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{formatPrice(getPrice(plan))}</Text>
                  <Text style={styles.pricePeriod}>/{getBillingLabel()}</Text>
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
                style={styles.selectButton}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text style={styles.selectButtonText}>Escolher Plano</Text>
                <SafeIcon name="arrow-forward" size={20} color={CustomColors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
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
  planHeader: {
    marginBottom: 16,
  },
  planInfo: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
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
  selectButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PlansScreen;

