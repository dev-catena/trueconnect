import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import ApiProvider from '../../../core/api/ApiProvider';
import SafeIcon from '../../../components/SafeIcon';
import PixPaymentView from '../components/PixPaymentView';
import CardPaymentView from '../components/CardPaymentView';

type PaymentScreenRouteProp = RouteProp<HomeStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Payment'>;

type PaymentMethod = 'pix' | 'card' | null;

interface PixData {
  qr_code: string;
  code: string;
  expires_at: string;
}

interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  installments: number;
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { selo, requestId } = route.params;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const handlePaymentMethodSelection = async () => {
    if (!selectedMethod) {
      Alert.alert('Atenção', 'Por favor, selecione um método de pagamento.');
      return;
    }

    setProcessing(true);

    try {
      const api = new ApiProvider();
      const amount = selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' 
        ? selo.custo_obtencao 
        : 0;

      if (selectedMethod === 'pix') {
        // Gerar dados PIX
        const response = await api.post('selos/pagamento', {
          seal_request_id: requestId,
          payment_method: 'pix',
          amount: amount,
        });

        if (response.success && response.data?.pix_data) {
          setPixData(response.data.pix_data);
        } else {
          Alert.alert('Erro', response.message || 'Não foi possível gerar o código PIX.');
        }
      } else if (selectedMethod === 'card') {
        // Mostrar formulário de cartão
        setShowCardForm(true);
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível processar o pagamento.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async (cardData: CardData) => {
    setProcessing(true);

    try {
      const api = new ApiProvider();
      const amount = selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' 
        ? selo.custo_obtencao 
        : 0;

      const response = await api.post('selos/pagamento', {
        seal_request_id: requestId,
        payment_method: 'credit_card',
        amount: amount,
        card_data: cardData,
      });

      if (response.success) {
        Alert.alert(
          'Sucesso',
          'Pagamento processado com sucesso! Seu selo está aguardando análise.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Seals');
              },
            },
          ]
        );
      } else {
        Alert.alert('Erro', response.message || 'Não foi possível processar o pagamento.');
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível processar o pagamento.');
    } finally {
      setProcessing(false);
    }
  };

  // Se PIX foi gerado, mostrar tela de PIX
  if (pixData) {
    return (
      <PixPaymentView
        pixCode={pixData.code}
        qrCode={pixData.qr_code}
        amount={selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' ? selo.custo_obtencao : 0}
        expiresAt={pixData.expires_at}
        onBack={() => {
          setPixData(null);
          setSelectedMethod(null);
        }}
      />
    );
  }

  // Se cartão foi selecionado, mostrar formulário de cartão
  if (showCardForm) {
    return (
      <CardPaymentView
        amount={selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' ? selo.custo_obtencao : 0}
        onBack={() => {
          setShowCardForm(false);
          setSelectedMethod(null);
        }}
        onSubmit={handleCardPayment}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../../assets/images/trustme-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              tintColor={CustomColors.white}
            />
          </View>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo do Selo */}
        <View style={styles.summaryCard}>
          <View style={styles.sealIconContainer}>
            <SafeIcon name="seal" size={32} color={CustomColors.activeColor} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{selo.nome || selo.descricao || selo.codigo}</Text>
            <Text style={styles.summaryCode}>Código: {selo.codigo}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total:</Text>
              <Text style={styles.priceValue}>
                R$ {selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' 
                  ? selo.custo_obtencao.toFixed(2).replace('.', ',') 
                  : '0,00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Métodos de Pagamento */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Selecione o método de pagamento</Text>

          {/* PIX */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedMethod === 'pix' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedMethod('pix')}
          >
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodIcon}>
                <SafeIcon
                  name="qr-code"
                  size={32}
                  color={selectedMethod === 'pix' ? CustomColors.white : CustomColors.activeColor}
                />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text
                  style={[
                    styles.paymentMethodName,
                    selectedMethod === 'pix' && styles.paymentMethodNameSelected,
                  ]}
                >
                  PIX
                </Text>
                <Text
                  style={[
                    styles.paymentMethodDescription,
                    selectedMethod === 'pix' && styles.paymentMethodDescriptionSelected,
                  ]}
                >
                  Aprovação instantânea
                </Text>
              </View>
              {selectedMethod === 'pix' && (
                <SafeIcon name="check-circle" size={24} color={CustomColors.white} />
              )}
            </View>
          </TouchableOpacity>

          {/* Cartão de Crédito */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedMethod === 'card' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setSelectedMethod('card')}
          >
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodIcon}>
                <SafeIcon
                  name="card"
                  size={32}
                  color={selectedMethod === 'card' ? CustomColors.white : CustomColors.activeColor}
                />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text
                  style={[
                    styles.paymentMethodName,
                    selectedMethod === 'card' && styles.paymentMethodNameSelected,
                  ]}
                >
                  Cartão de Crédito
                </Text>
                <Text
                  style={[
                    styles.paymentMethodDescription,
                    selectedMethod === 'card' && styles.paymentMethodDescriptionSelected,
                  ]}
                >
                  Parcelamento disponível
                </Text>
              </View>
              {selectedMethod === 'card' && (
                <SafeIcon name="check-circle" size={24} color={CustomColors.white} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Botão Continuar */}
        <TouchableOpacity
          style={[styles.payButton, (!selectedMethod || processing) && styles.payButtonDisabled]}
          onPress={handlePaymentMethodSelection}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <ActivityIndicator color={CustomColors.activeColor} />
          ) : (
            <>
              <Text style={styles.payButtonText}>Continuar</Text>
              <SafeIcon name="arrow-forward" size={20} color={CustomColors.activeColor} />
            </>
          )}
        </TouchableOpacity>
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: CustomColors.white,
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
  },
  summaryCard: {
    backgroundColor: CustomColors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sealIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  summaryCode: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  priceLabel: {
    fontSize: 16,
    color: CustomColors.black,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  paymentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 16,
  },
  paymentMethodCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: CustomColors.backgroundPrimaryColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodCardSelected: {
    borderColor: CustomColors.activeColor,
    backgroundColor: CustomColors.activeColor,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentMethodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  paymentMethodNameSelected: {
    color: CustomColors.white,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  paymentMethodDescriptionSelected: {
    color: CustomColors.white,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomColors.pastelPurple,
    borderRadius: 12,
    paddingVertical: 16,
    margin: 16,
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
});

export default PaymentScreen;

