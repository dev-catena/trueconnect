import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import CustomScaffold from '../../../components/CustomScaffold';

type PlanDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlanDetail'>;
type PlanDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlanDetail'>;

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

const PlanDetailScreen: React.FC = () => {
  const navigation = useNavigation<PlanDetailScreenNavigationProp>();
  const route = useRoute<PlanDetailScreenRouteProp>();
  const { plan, billingCycle } = route.params;

  const getPrice = () => {
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
        return 'mensal';
      case 'semiannual':
        return 'semestral';
      case 'annual':
        return 'anual';
      default:
        return 'mensal';
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleSubscribe = () => {
    navigation.navigate('Subscription', { plan, billingCycle });
  };

  return (
    <CustomScaffold title={plan.name} showBackButton>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Preço {getBillingLabel()}</Text>
          <Text style={styles.price}>{formatPrice(getPrice())}</Text>
          <Text style={styles.pricePeriod}>por {getBillingLabel()}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Plano</Text>
          <Text style={styles.description}>{plan.description}</Text>
        </View>

        {/* Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limites</Text>
          <View style={styles.limitsContainer}>
            <View style={styles.limitCard}>
              <SafeIcon name="shield" size={24} color={CustomColors.activeColor} />
              <Text style={styles.limitLabel}>Selos</Text>
              <Text style={styles.limitValue}>
                {plan.seals_limit === null || plan.seals_limit === 0 ? 'Ilimitado' : `${plan.seals_limit}`}
              </Text>
            </View>
            <View style={styles.limitCard}>
              <SafeIcon name="document-text" size={24} color={CustomColors.activeColor} />
              <Text style={styles.limitLabel}>Contratos</Text>
              <Text style={styles.limitValue}>
                {plan.contracts_limit === null || plan.contracts_limit === 0 ? 'Ilimitado' : `${plan.contracts_limit}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Funcionalidades Incluídas</Text>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <SafeIcon name="check" size={20} color={CustomColors.activeColor} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Subscribe Button */}
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <SafeIcon name="card" size={24} color={CustomColors.white} />
          <Text style={styles.subscribeButtonText}>Assinar Plano</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <SafeIcon name="alert-circle" size={20} color={CustomColors.activeGreyed} />
          <Text style={styles.infoText}>
            A assinatura será processada através da loja de aplicativos (App Store ou Google Play)
          </Text>
        </View>
      </ScrollView>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  priceSection: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 42,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    marginBottom: 4,
  },
  pricePeriod: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  section: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    lineHeight: 24,
  },
  limitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  limitCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    minWidth: 120,
  },
  limitLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginTop: 8,
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  featureText: {
    fontSize: 16,
    color: CustomColors.black,
    marginLeft: 12,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  subscribeButtonText: {
    color: CustomColors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default PlanDetailScreen;

