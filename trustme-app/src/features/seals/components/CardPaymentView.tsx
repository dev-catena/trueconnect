import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';

interface CardPaymentViewProps {
  amount: number;
  onBack: () => void;
  onSubmit: (cardData: CardData) => Promise<void>;
}

interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  installments: number;
}

const CardPaymentView: React.FC<CardPaymentViewProps> = ({
  amount,
  onBack,
  onSubmit,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    // Limita a 16 dígitos
    const limited = numbers.slice(0, 16);
    // Adiciona espaços a cada 4 dígitos
    return limited.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (text: string) => {
    const numbers = text.replace(/\D/g, '').slice(0, 4);
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2);
    }
    return numbers;
  };

  const formatCVV = (text: string) => {
    return text.replace(/\D/g, '').slice(0, 3);
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  const handleCvvChange = (text: string) => {
    setCvv(formatCVV(text));
  };

  const validateForm = (): boolean => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Erro', 'Por favor, informe o número completo do cartão.');
      return false;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do portador do cartão.');
      return false;
    }
    if (expiryDate.length < 5) {
      Alert.alert('Erro', 'Por favor, informe a data de validade completa.');
      return false;
    }
    if (cvv.length < 3) {
      Alert.alert('Erro', 'Por favor, informe o CVV completo.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    try {
      await onSubmit({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder: cardHolder.trim(),
        expiryDate: expiryDate,
        cvv: cvv,
        installments: installments,
      });
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setProcessing(false);
    }
  };

  const installmentsOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cartão de Crédito</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo do Valor */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Valor total</Text>
          <Text style={styles.summaryValue}>
            R$ {amount.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.formSection}>
          {/* Número do Cartão */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número do Cartão *</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
              placeholderTextColor={CustomColors.activeGreyed}
            />
          </View>

          {/* Nome do Portador */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome no Cartão *</Text>
            <TextInput
              style={styles.input}
              placeholder="NOME COMPLETO"
              value={cardHolder}
              onChangeText={setCardHolder}
              autoCapitalize="characters"
              placeholderTextColor={CustomColors.activeGreyed}
            />
          </View>

          {/* Validade e CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Validade *</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/AA"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor={CustomColors.activeGreyed}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV *</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                placeholderTextColor={CustomColors.activeGreyed}
              />
            </View>
          </View>

          {/* Parcelas */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parcelas</Text>
            <View style={styles.installmentsContainer}>
              {installmentsOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.installmentButton,
                    installments === option && styles.installmentButtonSelected,
                  ]}
                  onPress={() => setInstallments(option)}
                >
                  <Text
                    style={[
                      styles.installmentButtonText,
                      installments === option && styles.installmentButtonTextSelected,
                    ]}
                  >
                    {option}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.installmentValue}>
              {installments}x de R$ {(amount / installments).toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Botão Pagar */}
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handleSubmit}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={CustomColors.activeColor} />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pagar</Text>
              <SafeIcon name="lock" size={20} color={CustomColors.activeColor} />
            </>
          )}
        </TouchableOpacity>

        {/* Segurança */}
        <View style={styles.securityCard}>
          <SafeIcon name="lock" size={20} color={CustomColors.activeColor} />
          <Text style={styles.securityText}>
            Seus dados estão protegidos e criptografados
          </Text>
        </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
    textAlign: 'center',
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
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  formSection: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: CustomColors.white,
    borderWidth: 1,
    borderColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: CustomColors.black,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  installmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  installmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CustomColors.backgroundPrimaryColor,
    backgroundColor: CustomColors.white,
  },
  installmentButtonSelected: {
    borderColor: CustomColors.activeColor,
    backgroundColor: CustomColors.activeColor,
  },
  installmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.black,
  },
  installmentButtonTextSelected: {
    color: CustomColors.white,
  },
  installmentValue: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginTop: 8,
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
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
  },
});

export default CardPaymentView;

