import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';
import { useUser } from '../../../core/context/UserContext';

type StorePurchaseMockupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StorePurchaseMockup'>;
type StorePurchaseMockupScreenRouteProp = RouteProp<RootStackParamList, 'StorePurchaseMockup'>;

const StorePurchaseMockupScreen: React.FC = () => {
  const navigation = useNavigation<StorePurchaseMockupScreenNavigationProp>();
  const route = useRoute<StorePurchaseMockupScreenRouteProp>();
  const { plan, billingCycle, price, seal, requestId, isSeal, additionalPurchase } = route.params;
  const { refreshUserData } = useUser();
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
      
      if (isSeal && requestId) {
        try {
          const response = await api.post('/selos/confirm-store-payment', {
            seal_request_id: requestId,
          });
          if (response.success) {
            await refreshUserData();
            const successMessage = response.message || 'Seu pagamento foi processado com sucesso! O selo está sendo avaliado e aparecerá em Meus Selos.';
            Alert.alert(
              'Pagamento Confirmado',
              successMessage,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Resetar o stack para evitar voltar à tela de pagamento com spinner travado
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [
                          { name: 'Main' },
                          { name: 'MySeals' },
                        ],
                      })
                    );
                  }
                }
              ]
            );
          } else {
            throw new Error(response.message || 'Erro ao confirmar pagamento');
          }
        } catch (error: any) {
          console.error('Erro ao confirmar pagamento do selo:', error);
          Alert.alert(
            'Erro',
            error.response?.data?.message || 'Erro ao confirmar pagamento do selo. Tente novamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Main' }],
                    })
                  );
                },
              }
            ]
          );
        }
      } else if (additionalPurchase) {
        // Confirmar compra adicional no backend
        try {
          const response = await api.post('/additional-purchases/confirm-store-purchase', {
            purchase_id: additionalPurchase.purchaseId,
            payment_method: 'store',
            payment_id: `mock_${Date.now()}`,
          });
          
          if (response.success) {
            // Atualizar dados do usuário para refletir a nova compra
            try {
              await refreshUserData();
              console.log('Dados do usuário atualizados após compra adicional');
            } catch (e) {
              console.warn('Erro ao atualizar dados do usuário após compra adicional:', e);
            }
            
            const typeLabel = additionalPurchase.type === 'contracts' ? 'contrato(s)' : additionalPurchase.type === 'connections' ? 'conexão(ões) ativa(s)' : 'solicitação(ões) pendente(s)';
            Alert.alert(
              'Compra Confirmada',
              `${additionalPurchase.quantity} ${typeLabel} adicional(is) comprado(s) com sucesso!`,
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    // Pequeno delay para garantir que o backend processou a compra
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Navegar para MyPlans para que o usuário veja os dados atualizados
                    navigation.navigate('MyPlans');
                  }
                }
              ]
            );
          } else {
            throw new Error('Erro ao confirmar compra adicional');
          }
        } catch (error: any) {
          console.error('Erro ao confirmar compra adicional:', error);
          Alert.alert(
            'Erro',
            error.response?.data?.message || 'Erro ao confirmar compra adicional. Tente novamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Main');
                }
              }
            ]
          );
        }
      } else {
        // Confirmar assinatura no backend
        try {
          const response = await api.post('/subscriptions/confirm-store-purchase', {
            plan_id: plan.id,
            billing_cycle: billingCycle,
            payment_method: Platform.OS === 'ios' ? 'app_store' : 'google_play',
            payment_id: `mock_${Date.now()}`,
          });
          
          if (response.success) {
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
          } else {
            throw new Error('Erro ao confirmar assinatura');
          }
        } catch (error: any) {
          console.error('Erro ao confirmar assinatura:', error);
          Alert.alert(
            'Erro',
            error.response?.data?.message || 'Erro ao confirmar assinatura. Tente novamente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Main');
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      Alert.alert('Erro', 'Erro ao confirmar. Entre em contato com o suporte.');
    }
  };

  const formatPrice = (price: number | null | undefined): string => {
    // Garantir que price é um número válido
    const numPrice = price != null && !isNaN(Number(price)) ? Number(price) : 0;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const getBillingLabel = () => {
    if (isSeal) return ''; // Selos não têm ciclo de cobrança
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

  const getPurchaseTitle = () => {
    if (additionalPurchase) {
      const label = additionalPurchase.type === 'contracts' ? 'Contrato(s)' : additionalPurchase.type === 'connections' ? 'Conexão(ões) ativa(s)' : 'Solicitação(ões) pendente(s)';
      return `${additionalPurchase.quantity} ${label} Adicional(is)`;
    }
    if (isSeal && seal) {
      return seal.nome || seal.descricao || seal.codigo || 'Selo';
    }
    return plan?.name || 'Plano';
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
                <Text style={styles.purchaseItem}>{getPurchaseTitle()}</Text>
                {isSeal && seal?.codigo && (
                  <Text style={styles.purchaseSubtitle}>Código: {seal.codigo}</Text>
                )}
                {additionalPurchase && (
                  <Text style={styles.purchaseSubtitle}>
                    {additionalPurchase.type === 'contracts' ? 'Contratos' : additionalPurchase.type === 'connections' ? 'Conexões ativas' : 'Solicitações pendentes'} adicionais para seu plano
                  </Text>
                )}
                <Text style={styles.purchasePrice}>{formatPrice(price)}</Text>
                {!isSeal && !additionalPurchase && getBillingLabel() && (
                  <Text style={styles.purchasePeriod}>por {getBillingLabel()}</Text>
                )}
                {additionalPurchase && (
                  <Text style={styles.purchasePeriod}>pagamento único</Text>
                )}
              </View>

              <View style={styles.purchaseInfo}>
                {additionalPurchase ? (
                  <>
                    <Text style={styles.purchaseInfoText}>
                      • Os recursos serão adicionados imediatamente após o pagamento
                    </Text>
                    <Text style={styles.purchaseInfoText}>
                      • Os recursos adicionais são permanentes enquanto seu plano estiver ativo
                    </Text>
                    <Text style={styles.purchaseInfoText}>
                      • O pagamento será cobrado na sua conta da loja
                    </Text>
                  </>
                ) : isSeal ? (
                  <>
                    <Text style={styles.purchaseInfoText}>
                      • O pagamento será processado imediatamente
                    </Text>
                    <Text style={styles.purchaseInfoText}>
                      • O selo será analisado após confirmação do pagamento
                    </Text>
                    <Text style={styles.purchaseInfoText}>
                      • O pagamento será cobrado na sua conta da loja
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.purchaseInfoText}>
                      • A assinatura será renovada automaticamente
                    </Text>
                    <Text style={styles.purchaseInfoText}>
                      • Você pode cancelar a qualquer momento
                    </Text>
                    <Text style={styles.purchaseInfoText}>
                      • O pagamento será cobrado na sua conta da loja
                    </Text>
                  </>
                )}
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
              {isSeal 
                ? 'Seu pagamento foi processado com sucesso! O selo está aguardando análise.'
                : 'Sua assinatura foi ativada com sucesso.'}
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
    marginBottom: 4,
    textAlign: 'center',
  },
  purchaseSubtitle: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 8,
    textAlign: 'center',
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

