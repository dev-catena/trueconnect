import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import ApiProvider from '../../../core/api/ApiProvider';
import SafeIcon from '../../../components/SafeIcon';
import CustomScaffold from '../../../components/CustomScaffold';

type PaymentScreenRouteProp = RouteProp<HomeStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Payment'>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { selo, requestId } = route.params;
  const [processing, setProcessing] = useState(false);

  // Resetar loading ao voltar para a tela (evita spinner travado)
  useFocusEffect(
    React.useCallback(() => {
      return () => setProcessing(false);
    }, [])
  );

  const amount = selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' 
    ? selo.custo_obtencao 
    : 0;

  const formatPrice = (price: number | null | undefined): string => {
    const numPrice = price != null && !isNaN(Number(price)) ? Number(price) : 0;
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
  };

  const handleStorePurchase = async () => {
    setProcessing(true);
    
    try {
      // MOCKUP: Em produção, aqui seria a integração real com react-native-iap ou similar
      // que abriria a interface nativa da App Store (iOS) ou Google Play (Android)
      
      // Navegar diretamente para mockup da interface da loja
      rootNavigation.navigate('StorePurchaseMockup', {
        plan: null, // Não é um plano
        billingCycle: 'monthly', // Não usado para selos, mas obrigatório no tipo
        price: amount,
        seal: selo,
        requestId: requestId,
        isSeal: true, // Flag para indicar que é pagamento de selo
      });
    } catch (error: any) {
      console.error('Erro ao iniciar compra:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o processo de compra.');
      setProcessing(false);
    }
  };

  return (
    <CustomScaffold title="Pagamento do Selo" showBackButton>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo do Selo */}
        <View style={styles.summaryCard}>
          <View style={styles.sealIconContainer}>
            <SafeIcon name="seal" size={48} color={CustomColors.activeColor} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{selo.nome || selo.descricao || selo.codigo}</Text>
            <Text style={styles.summaryCode}>Código: {selo.codigo}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total:</Text>
              <Text style={styles.priceValue}>{formatPrice(amount)}</Text>
            </View>
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
            O pagamento será processado através da {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}.
            O valor será cobrado na sua conta da loja.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Informações do Pagamento</Text>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Pagamento seguro através da loja oficial</Text>
          </View>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Processamento imediato</Text>
          </View>
          <View style={styles.benefitItem}>
            <SafeIcon name="check-circle" size={20} color={CustomColors.activeColor} />
            <Text style={styles.benefitText}>Selo será analisado após confirmação do pagamento</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handleStorePurchase}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={CustomColors.white} />
          ) : (
            <>
              <SafeIcon name="card" size={24} color={CustomColors.white} />
              <Text style={styles.payButtonText}>
                Pagar na {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Ao confirmar o pagamento, você será redirecionado para a {Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}.
            O pagamento será processado pela loja e seu selo será analisado após a confirmação.
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sealIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryInfo: {
    width: '100%',
    alignItems: 'center',
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
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
    width: '100%',
  },
  priceLabel: {
    fontSize: 16,
    color: CustomColors.black,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
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
  payButton: {
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
    gap: 12,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: CustomColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;

