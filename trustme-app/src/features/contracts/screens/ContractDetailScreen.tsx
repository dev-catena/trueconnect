import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractsStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import SafeIcon from '../../../components/SafeIcon';
import { Contract } from '../../../types';
import { formatDate, formatDateTime } from '../../../utils/dateParser';
import ApiProvider from '../../../core/api/ApiProvider';
import { useUser } from '../../../core/context/UserContext';

type ContractDetailScreenRouteProp = RouteProp<ContractsStackParamList, 'ContractDetail'>;
type ContractDetailScreenNavigationProp = NativeStackNavigationProp<
  ContractsStackParamList,
  'ContractDetail'
>;

interface Props {
  route: ContractDetailScreenRouteProp;
}

const ContractDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<ContractDetailScreenNavigationProp>();
  const { contract: initialContract } = route.params;
  const { refreshUserData } = useUser();
  const [contract, setContract] = useState<Contract>(initialContract);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAcceptContract = async () => {
    setIsLoading(true);
    try {
      const api = new ApiProvider(true);
      await api.post(`contrato/${contract.id}/aceitar`, {});
      Alert.alert('Sucesso', 'Contrato aceito com sucesso!');
      await refreshUserData();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao aceitar contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectContract = async () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja rejeitar este contrato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.post(`contrato/${contract.id}/rejeitar`, {});
              Alert.alert('Sucesso', 'Contrato rejeitado');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao rejeitar contrato');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const isPending = contract.status === 'Pendente';
  const isParticipant = contract.participantes?.some(
    (p) => p.usuario_id === contract.contratante_id
  );

  return (
    <CustomScaffold title="Detalhes do Contrato">
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.contractCode}>{contract.codigo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) + '33' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
              {contract.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{contract.tipo?.descricao || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duração:</Text>
            <Text style={styles.infoValue}>{contract.duracao} horas</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Início:</Text>
            <Text style={styles.infoValue}>{formatDate(contract.dt_inicio)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Término:</Text>
            <Text style={styles.infoValue}>{formatDate(contract.dt_fim)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contratante</Text>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              {contract.contratante?.caminho_foto ? (
                <Image
                  source={{ uri: contract.contratante.caminho_foto }}
                  style={styles.avatarImage}
                />
              ) : (
                <SafeIcon
                  name="account"
                  size={28}
                  color={CustomColors.white}
                />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {contract.contratante?.nome_completo || contract.contratante?.name || 'N/A'}
              </Text>
              <Text style={styles.userEmail}>{contract.contratante?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {contract.participantes && contract.participantes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participantes</Text>
            {contract.participantes.map((participant, index) => (
              <View key={index} style={styles.userCard}>
                <View style={styles.avatar}>
                  {participant.usuario?.caminho_foto ? (
                    <Image
                      source={{ uri: participant.usuario.caminho_foto }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <SafeIcon
                      name="account"
                      size={28}
                      color={CustomColors.white}
                    />
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {participant.usuario?.nome_completo || participant.usuario?.name || 'N/A'}
                  </Text>
                  <Text style={styles.userEmail}>{participant.usuario?.email || 'N/A'}</Text>
                  {participant.aceito !== null && (
                    <View style={styles.acceptanceStatusContainer}>
                      <SafeIcon
                        name={participant.aceito ? 'check' : 'close'}
                        size={14}
                        color={participant.aceito ? CustomColors.successGreen : CustomColors.vividRed}
                      />
                      <Text style={[styles.acceptanceStatus, { color: participant.aceito ? CustomColors.successGreen : CustomColors.vividRed }]}>
                        {participant.aceito ? ' Aceito' : ' Rejeitado'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {contract.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{contract.descricao}</Text>
          </View>
        )}

        {isPending && isParticipant && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptContract}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Aceitar Contrato</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectContract}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Rejeitar Contrato</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  contractCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: CustomColors.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: CustomColors.black,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  acceptanceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  acceptanceStatus: {
    fontSize: 12,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: CustomColors.black,
    lineHeight: 20,
  },
  actions: {
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: CustomColors.successGreen,
  },
  rejectButton: {
    backgroundColor: CustomColors.vividRed,
  },
  actionButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContractDetailScreen;
