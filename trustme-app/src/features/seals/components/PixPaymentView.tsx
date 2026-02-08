import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';

interface PixPaymentViewProps {
  pixCode: string;
  qrCode: string;
  amount: number;
  expiresAt: string;
  onBack: () => void;
}

const PixPaymentView: React.FC<PixPaymentViewProps> = ({
  pixCode,
  qrCode,
  amount,
  expiresAt,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  // Gerar URL do QR Code usando API pública
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`;

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(pixCode);
      setCopied(true);
      Alert.alert('Sucesso', 'Código PIX copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      Alert.alert('Erro', 'Não foi possível copiar o código PIX.');
    }
  };

  const formatExpiresAt = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento PIX</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instruções */}
        <View style={styles.instructionsCard}>
          <SafeIcon name="info-circle" size={24} color={CustomColors.activeColor} />
          <Text style={styles.instructionsText}>
            Escaneie o QR Code ou copie o código PIX para realizar o pagamento
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrCodeCard}>
          <Text style={styles.qrCodeTitle}>Escaneie com seu app de pagamento</Text>
          <View style={styles.qrCodeContainer}>
            <Image
              source={{ uri: qrCodeUrl }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Código PIX */}
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>Ou copie o código PIX</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText} selectable>
              {pixCode}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonCopied]}
            onPress={handleCopyCode}
          >
            <SafeIcon
              name={copied ? 'check-circle' : 'copy'}
              size={20}
              color={copied ? CustomColors.white : CustomColors.activeColor}
            />
            <Text
              style={[
                styles.copyButtonText,
                copied && styles.copyButtonTextCopied,
              ]}
            >
              {copied ? 'Copiado!' : 'Copiar código'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informações */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor:</Text>
            <Text style={styles.infoValue}>
              R$ {amount.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expira em:</Text>
            <Text style={styles.infoValue}>{formatExpiresAt(expiresAt)}</Text>
          </View>
        </View>

        {/* Aviso */}
        <View style={styles.warningCard}>
          <SafeIcon name="warning" size={20} color={CustomColors.activeColor} />
          <Text style={styles.warningText}>
            Após realizar o pagamento, aguarde a confirmação. Seu selo será ativado automaticamente.
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
  instructionsCard: {
    backgroundColor: CustomColors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: CustomColors.black,
    lineHeight: 20,
  },
  qrCodeCard: {
    backgroundColor: CustomColors.white,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 20,
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CustomColors.backgroundPrimaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: 250,
    height: 250,
  },
  codeCard: {
    backgroundColor: CustomColors.white,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CustomColors.activeGreyed,
  },
  codeText: {
    fontSize: 12,
    color: CustomColors.black,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  copyButtonCopied: {
    backgroundColor: CustomColors.activeColor,
    borderColor: CustomColors.activeColor,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.activeColor,
  },
  copyButtonTextCopied: {
    color: CustomColors.white,
  },
  infoCard: {
    backgroundColor: CustomColors.white,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
  },
  warningCard: {
    backgroundColor: CustomColors.pastelGreen,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: CustomColors.black,
    lineHeight: 20,
  },
});

export default PixPaymentView;

