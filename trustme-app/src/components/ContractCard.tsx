import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractsStackParamList, HomeStackParamList } from '../types/navigation';
import { Contract } from '../types';
import { CustomColors } from '../core/colors';
import { formatDate } from '../utils/dateParser';
import SafeIcon from './SafeIcon';
import SignatureCountdown from './SignatureCountdown';

interface ContractCardProps {
  contract: Contract;
  onPress?: () => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onPress }) => {
  const navigation = useNavigation<NativeStackNavigationProp<ContractsStackParamList | HomeStackParamList>>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ContractDetail', { contract });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return CustomColors.successGreen;
      case 'Pendente':
        return CustomColors.pendingYellow;
      case 'Concluído':
        return CustomColors.activeGreyed;
      case 'Expirado':
        return CustomColors.vividRed;
      default:
        return CustomColors.activeGreyed;
    }
  };

  const isExpired = contract.dt_fim && new Date(contract.dt_fim) < new Date();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: getStatusColor(contract.status) }]}
      onPress={handlePress}
    >
      <Text style={styles.contractCode}>{contract.codigo}</Text>
      <Text style={styles.contractType}>{contract.tipo?.descricao || 'Sem tipo'}</Text>
      
      {contract.participantes && contract.participantes.length > 0 && (
        <View style={styles.participants}>
          {contract.participantes.slice(0, 2).map((participant, index) => (
            <Text key={index} style={styles.participantName}>
              {participant.usuario?.nome_completo || 'Usuário'}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.status, { color: getStatusColor(contract.status) }]}>
            {contract.status}
          </Text>
        </View>
        
        {contract.status === 'Pendente' && contract.dt_prazo_assinatura && (
          <SignatureCountdown
            dtPrazoAssinatura={contract.dt_prazo_assinatura}
            compact
          />
        )}
        {(contract.status === 'Ativo' || contract.status === 'Pendente') && !isExpired && contract.dt_fim && !contract.dt_prazo_assinatura && (
          <View style={styles.timeContainer}>
            <SafeIcon
              name="clock"
              size={16}
              color={CustomColors.activeGreyed}
            />
            <Text style={styles.timeText}>
              {formatDate(contract.dt_fim)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CustomColors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 150,
  },
  contractCode: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  contractType: {
    fontSize: 12,
    textAlign: 'center',
    color: CustomColors.activeGreyed,
    marginBottom: 8,
  },
  participants: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 8,
  },
  participantName: {
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    color: CustomColors.activeGreyed,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: CustomColors.activeGreyed,
  },
});

export default ContractCard;

