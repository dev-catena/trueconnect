import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import CustomScaffold from '../../../components/CustomScaffold';
import ApiProvider from '../../../core/api/ApiProvider';

type SubscriptionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Subscription'>;
type SubscriptionScreenRouteProp = RouteProp<RootStackParamList, 'Subscription'>;

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

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<SubscriptionScreenNavigationProp>();
  const route = useRoute<SubscriptionScreenRouteProp>();
  const { plan, billingCycle } = route.params;
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
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

  const handleStorePurchase = async () => {
    setProcessing(true);
    
    try {
      // MOCKUP: Simulação de integração com loja
      // Em produção, aqui seria a integração real com react-native-iap ou similar
      
      Alert.alert(
        'Integração com Loja',
        'Esta é uma simulação da integração com a loja de aplicativos.\n\n' +
        `Plano: ${plan.name}\n` +
        `Ciclo: ${getBillingLabel()}\n` +
        `Valor: ${formatPrice(getPrice())}\n\n` +
        'Em produção, aqui seria aberta a interface nativa da App Store (iOS) ou Google Play (Android) para processar a compra.',
        [
          {
            text: 'Simular Compra',
            onPress: () => {
              simulateStorePurchase();
            }
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setProcessing(false)
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro ao iniciar compra:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o processo de compra.');
      setProcessing(false);
    }
  };

  const simulateStorePurchase = async () => {
    // MOCKUP: Simulação do processo de compra
    setLoading(true);
    
    try {
      // Simular delay da loja
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mostrar mockup da interface da loja
      navigation.navigate('StorePurchaseMockup', {
        plan,
        billingCycle,
        price: getPrice(),
      });
    } catch (error) {
      console.error('Erro na simulação:', error);
      Alert.alert('Erro', 'Erro ao processar a compra.');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  return (
    <CustomScaffold title="Assinar Plano" showBackButton>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo da Assinatura</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plano:</Text>
            <Text style={styles.summaryValue}>{plan.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ciclo:</Text>
            <Text style={styles.summaryValue}>{getBillingLabel()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Valor:</Text>
            <Text style={styles.summaryValueBold}>{formatPrice(getPrice())}</Text>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <SafeIcon 
              name={Platform.OS === 'ios' ? 'card' : 'card'} 
              size={24} 
              color={CustomColors.activeColor} 
            />
            <Text style={styles.infoTitle}>
              {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}
            </Text>
          </View>
          <Text style={styles.infoText}>
            A assinatura será processada através da {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}.
            O pagamento será cobrado na sua conta da loja.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefícios da Assinatura</Text>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Renovação automática</Text>
          </View>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Cancelamento a qualquer momento</Text>
          </View>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Acesso imediato após confirmação</Text>
          </View>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Suporte prioritário</Text>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, (loading || processing) && styles.buttonDisabled]}
          onPress={handleStorePurchase}
          disabled={loading || processing}
        >
          {loading || processing ? (
            <ActivityIndicator color={CustomColors.white} />
          ) : (
            <>
              <SafeIcon name="card" size={24} color={CustomColors.white} />
              <Text style={styles.subscribeButtonText}>
                Assinar na {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Ao assinar, você concorda com os termos de serviço e política de privacidade.
            A assinatura será renovada automaticamente a menos que seja cancelada.
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
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  summaryValue: {
    fontSize: 16,
    color: CustomColors.black,
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize: 20,
    color: CustomColors.activeColor,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    lineHeight: 20,
  },
  benefitsCard: {
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
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: CustomColors.black,
    marginLeft: 12,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: CustomColors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  termsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;

