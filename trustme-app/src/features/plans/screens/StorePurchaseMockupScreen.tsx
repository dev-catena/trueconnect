import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';

type StorePurchaseMockupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StorePurchaseMockup'>;
type StorePurchaseMockupScreenRouteProp = RouteProp<RootStackParamList, 'StorePurchaseMockup'>;

const StorePurchaseMockupScreen: React.FC = () => {
  const navigation = useNavigation<StorePurchaseMockupScreenNavigationProp>();
  const route = useRoute<StorePurchaseMockupScreenRouteProp>();
  const { plan, billingCycle, price } = route.params;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'authenticate' | 'confirm' | 'processing' | 'success'>('authenticate');

  useEffect(() => {
    // Simular autenticação automática após 1 segundo
    const timer = setTimeout(() => {
      setStep('confirm');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    setStep('processing');
    // Simular processamento
    setTimeout(() => {
      setStep('success');
      // Após sucesso, simular confirmação no backend
      setTimeout(() => {
        handleSuccess();
      }, 2000);
    }, 3000);
  };

  const handleSuccess = async () => {
    try {
      // MOCKUP: Em produção, aqui seria a confirmação real com o backend
      // após receber a confirmação da loja
      const api = new ApiProvider(true);
      // Simular chamada de API para confirmar assinatura
      // await api.post('/subscriptions/confirm-store-purchase', { ... });
      
      Alert.alert(
        'Assinatura Confirmada',
        'Sua assinatura foi ativada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Main');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao confirmar assinatura:', error);
      Alert.alert('Erro', 'Erro ao confirmar assinatura. Entre em contato com o suporte.');
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

  const renderContent = () => {
    switch (step) {
      case 'authenticate':
        return (
          <View style={styles.stepContainer}>
            <ActivityIndicator size="large" color={CustomColors.activeColor} />
            <Text style={styles.stepTitle}>Autenticando...</Text>
            <Text style={styles.stepDescription}>
              Conectando com {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
            </Text>
          </View>
        );

      case 'confirm':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.storeHeader}>
              <SafeIcon 
                name={Platform.OS === 'ios' ? 'card' : 'card'} 
                size={48} 
                color={Platform.OS === 'ios' ? '#007AFF' : '#01875F'} 
              />
              <Text style={styles.storeTitle}>
                {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}
              </Text>
            </View>

            <View style={styles.purchaseCard}>
              <Text style={styles.purchaseTitle}>Confirmar Compra</Text>
              <View style={styles.purchaseDetails}>
                <Text style={styles.purchaseItem}>{plan.name}</Text>
                <Text style={styles.purchasePrice}>{formatPrice(price)}</Text>
                <Text style={styles.purchasePeriod}>por {getBillingLabel()}</Text>
              </View>

              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseInfoText}>
                  • A assinatura será renovada automaticamente
                </Text>
                <Text style={styles.purchaseInfoText}>
                  • Você pode cancelar a qualquer momento
                </Text>
                <Text style={styles.purchaseInfoText}>
                  • O pagamento será cobrado na sua conta da loja
                </Text>
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>
                  Confirmar Compra
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'processing':
        return (
          <View style={styles.stepContainer}>
            <ActivityIndicator size="large" color={CustomColors.activeColor} />
            <Text style={styles.stepTitle}>Processando...</Text>
            <Text style={styles.stepDescription}>
              Aguarde enquanto processamos sua compra
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.successIcon}>
              <SafeIcon name="check-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Compra Confirmada!</Text>
            <Text style={styles.successDescription}>
              Sua assinatura foi ativada com sucesso.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* MOCK Banner */}
      <View style={styles.mockBanner}>
        <Text style={styles.mockText}>MOCK - Simulação de Integração com Loja</Text>
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  mockBanner: {
    backgroundColor: '#FF9800',
    padding: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  mockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  header: {
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#01875F',
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
    padding: 20,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginTop: 24,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
  storeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  storeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginTop: 16,
  },
  purchaseCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  purchaseDetails: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: CustomColors.backgroundPrimaryColor,
  },
  purchaseItem: {
    fontSize: 18,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 8,
  },
  purchasePrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    marginBottom: 4,
  },
  purchasePeriod: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  purchaseInfo: {
    marginBottom: 24,
  },
  purchaseInfoText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 8,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#01875F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: CustomColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: CustomColors.activeGreyed,
    fontSize: 16,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
});

export default StorePurchaseMockupScreen;

