import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';

type AdditionalPurchaseModalNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AdditionalPurchasePrices {
  contracts: {
    unit_price: number;
    max_quantity: number;
  };
  connections: {
    unit_price: number;
    max_quantity: number;
  };
}

interface AdditionalPurchaseModalProps {
  visible: boolean;
  type: 'contracts' | 'connections';
  prices: AdditionalPurchasePrices | null;
  onClose: () => void;
  onPurchase: (type: 'contracts' | 'connections', quantity: number) => void;
}

const AdditionalPurchaseModal: React.FC<AdditionalPurchaseModalProps> = ({
  visible,
  type,
  prices,
  onClose,
  onPurchase,
}) => {
  const navigation = useNavigation<AdditionalPurchaseModalNavigationProp>();
  const [quantity, setQuantity] = useState(1);

  // Log para debug
  React.useEffect(() => {
    console.log('🔴🔴🔴 AdditionalPurchaseModal - useEffect:', {
      type,
      visible,
      hasPrices: !!prices
    });
  }, [type, visible, prices]);

  // Resetar quantidade quando o tipo mudar
  React.useEffect(() => {
    setQuantity(1);
  }, [type]);

  console.log('🔴🔴🔴 AdditionalPurchaseModal - Renderização:', {
    type,
    visible,
    hasPrices: !!prices,
    willRender: prices && visible
  });

  if (!prices) {
    console.log('🔴 AdditionalPurchaseModal - Sem preços, não renderizando');
    return null;
  }

  if (!visible) {
    console.log('🔴 AdditionalPurchaseModal - Não visível, não renderizando');
    return null;
  }

  console.log('🔴🔴🔴 AdditionalPurchaseModal - RENDERIZANDO MODAL com type:', type);

  const unitPrice = type === 'contracts' 
    ? prices.contracts.unit_price 
    : prices.connections.unit_price;
  
  const maxQuantity = type === 'contracts' 
    ? prices.contracts.max_quantity 
    : prices.connections.max_quantity;

  const totalPrice = unitPrice * quantity;

  // Calcular labels baseado no type recebido usando useMemo para garantir que seja recalculado
  const { typeLabel, typeLabelPlural, headerTitle, descriptionText } = useMemo(() => {
    const label = type === 'contracts' ? 'contratos' : 'conexões';
    const labelPlural = type === 'contracts' ? 'Contratos' : 'Conexões';
    const title = `Comprar ${labelPlural} Adicionais`;
    const desc = `Quantos ${label} adicionais você deseja comprar?`;
    
    console.log('🔵 AdditionalPurchaseModal - useMemo calculando com type:', type);
    console.log('🔵 AdditionalPurchaseModal - labelPlural:', labelPlural);
    console.log('🔵 AdditionalPurchaseModal - title:', title);
    
    return {
      typeLabel: label,
      typeLabelPlural: labelPlural,
      headerTitle: title,
      descriptionText: desc,
    };
  }, [type]);

  console.log('🔵 AdditionalPurchaseModal - Renderizando com type:', type);
  console.log('🔵 AdditionalPurchaseModal - headerTitle final:', headerTitle);

  return (
    <Modal
      key={`additional-purchase-modal-${type}`}
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']} pointerEvents="box-none">
          <View style={styles.modalContentWrapper} pointerEvents="auto">
          {/* Header do Modal */}
          <View style={styles.modalHeaderFull}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalHeaderLeft}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalBackButton}
                >
                  <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>
                  {headerTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.modalProfileButton}
              >
                <SafeIcon name="profile" size={28} color={CustomColors.white} />
              </TouchableOpacity>
            </View>
          </View>

        {/* Conteúdo do Modal */}
        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalDescription}>
            {descriptionText}
          </Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
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
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                setQuantity(Math.min(quantity + 1, maxQuantity));
              }}
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
            style={styles.purchaseButton}
            onPress={() => {
              console.log('🔵 Modal - Botão Continuar clicado com type:', type, 'quantity:', quantity);
              onPurchase(type, quantity);
            }}
          >
            <Text style={styles.purchaseButtonText}>
              Continuar para Pagamento
            </Text>
          </TouchableOpacity>
        </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: CustomColors.background,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: CustomColors.background,
    width: '100%',
    height: '100%',
  },
  modalContentWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalHeaderFull: {
    backgroundColor: CustomColors.activeColor,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalBackButton: {
    marginRight: 12,
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
    padding: 16,
  },
  modalDescription: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  quantityInput: {
    width: 80,
    height: 48,
    borderWidth: 1,
    borderColor: CustomColors.activeGreyed,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: CustomColors.text,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: CustomColors.white,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: CustomColors.text,
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
  purchaseButtonText: {
    color: CustomColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdditionalPurchaseModal;

