import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import CustomScaffold from '../../../components/CustomScaffold';
import ApiProvider from '../../../core/api/ApiProvider';

type AdditionalPurchaseQuantityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdditionalPurchaseQuantity'>;
type AdditionalPurchaseQuantityScreenRouteProp = RouteProp<RootStackParamList, 'AdditionalPurchaseQuantity'>;

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

const AdditionalPurchaseQuantityScreen: React.FC = () => {
  const navigation = useNavigation<AdditionalPurchaseQuantityScreenNavigationProp>();
  const route = useRoute<AdditionalPurchaseQuantityScreenRouteProp>();
  const { type } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<AdditionalPurchasePrices | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ success: boolean; data: AdditionalPurchasePrices }>('additional-purchases/prices');

      if (response.success && response.data) {
        setPrices(response.data);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os preços. Tente novamente mais tarde.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os preços. Tente novamente mais tarde.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!prices) return;

    setPurchasing(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.post('additional-purchases', {
        type: type,
        quantity: quantity,
      });

      if (response.success) {
        // Navegar para tela de pagamento (store purchase mockup)
        const unitPrice = type === 'contracts'
          ? prices.contracts.unit_price
          : prices.connections.unit_price;
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
    } finally {
      setPurchasing(false);
    }
  };

  // Calcular labels e valores baseado no tipo
  const { typeLabel, typeLabelPlural, headerTitle, descriptionText, unitPrice, maxQuantity } = useMemo(() => {
    const getLabels = () => {
      if (type === 'contracts') return { label: 'contratos', labelPlural: 'Contratos', desc: 'contratos' };
      return { label: 'conexões', labelPlural: 'Conexões', desc: 'conexões' };
    };
    const { label, labelPlural, desc } = getLabels();

    if (!prices) {
      return {
        typeLabel: label,
        typeLabelPlural: labelPlural,
        headerTitle: `Comprar ${labelPlural} Adicionais`,
        descriptionText: `Quantas ${desc} adicionais você deseja comprar?`,
        unitPrice: 0,
        maxQuantity: 100,
      };
    }

    const price = type === 'contracts' ? prices.contracts.unit_price : prices.connections.unit_price;
    const max = type === 'contracts' ? prices.contracts.max_quantity : prices.connections.max_quantity;

    return {
      typeLabel: label,
      typeLabelPlural: labelPlural,
      headerTitle: `Comprar ${labelPlural} Adicionais`,
      descriptionText: `Quantas ${desc} adicionais você deseja comprar?`,
      unitPrice: price,
      maxQuantity: max,
    };
  }, [type, prices]);

  const totalPrice = unitPrice * quantity;

  if (loading) {
    return (
      <CustomScaffold title={headerTitle} showBackButton={true} showProfileButton={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </CustomScaffold>
    );
  }

  if (!prices) {
    return (
      <CustomScaffold title={headerTitle} showBackButton={true} showProfileButton={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar preços</Text>
        </View>
      </CustomScaffold>
    );
  }

  return (
    <CustomScaffold title={headerTitle} showBackButton={true} showProfileButton={true}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          {descriptionText}
        </Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={purchasing}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.quantityInput}
            value={quantity.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 1;
              setQuantity(Math.min(Math.max(1, num), maxQuantity));
            }}
            keyboardType="numeric"
            editable={!purchasing}
          />
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => {
              setQuantity(Math.min(quantity + 1, maxQuantity));
            }}
            disabled={purchasing}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>
            R$ {totalPrice.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator size="small" color={CustomColors.white} />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Continuar para Pagamento
            </Text>
          )}
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: CustomColors.vividRed,
  },
  description: {
    fontSize: 16,
    color: CustomColors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    backgroundColor: CustomColors.lightGrey,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: CustomColors.lightGrey,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    width: 80,
    color: CustomColors.black,
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: CustomColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdditionalPurchaseQuantityScreen;


