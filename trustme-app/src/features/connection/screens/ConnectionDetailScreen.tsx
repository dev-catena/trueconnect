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
import { HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import SafeIcon from '../../../components/SafeIcon';
import { Connection } from '../../../types';
import { formatDate, formatTimeAgo } from '../../../utils/dateParser';
import ApiProvider from '../../../core/api/ApiProvider';
import { useUser } from '../../../core/context/UserContext';

type ConnectionDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ConnectionDetail'>;
type ConnectionDetailScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ConnectionDetail'
>;

interface Props {
  route: ConnectionDetailScreenRouteProp;
}

const ConnectionDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<ConnectionDetailScreenNavigationProp>();
  const { connection: initialConnection } = route.params;
  const { user, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const otherUser =
    initialConnection.solicitante_id === user?.id
      ? initialConnection.destinatario
      : initialConnection.solicitante;

  const isPending = initialConnection.aceito === null || initialConnection.aceito === undefined;
  const isAccepted = initialConnection.aceito === true;
  const isRequestedByMe = initialConnection.solicitante_id === user?.id;

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const api = new ApiProvider(true);
      await api.post(`usuario/conexoes/${initialConnection.id}/aceitar`, {});
      Alert.alert('Sucesso', 'Conexão aceita com sucesso!');
      await refreshUserData();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao aceitar conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja rejeitar esta conexão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.delete(`usuario/conexoes/${initialConnection.id}`);
              Alert.alert('Sucesso', 'Conexão rejeitada');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao rejeitar conexão');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemove = async () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja remover esta conexão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.delete(`usuario/conexoes/${initialConnection.id}`);
              Alert.alert('Sucesso', 'Conexão removida');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao remover conexão');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <CustomScaffold title="Detalhes da Conexão">
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {otherUser?.caminho_foto ? (
              <Image
                source={{ uri: otherUser.caminho_foto }}
                style={styles.avatarImage}
              />
            ) : (
              <SafeIcon
                name="account"
                size={40}
                color={CustomColors.white}
              />
            )}
          </View>
          <Text style={styles.userName}>
            {otherUser?.nome_completo || otherUser?.name || 'Usuário'}
          </Text>
          {isAccepted && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Conectado</Text>
            </View>
          )}
          {isPending && !isRequestedByMe && (
            <View style={styles.statusBadgePending}>
              <Text style={styles.statusTextPending}>Pendente</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{otherUser?.email || 'N/A'}</Text>
          </View>
          {otherUser?.CPF && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CPF:</Text>
              <Text style={styles.infoValue}>{otherUser.CPF}</Text>
            </View>
          )}
        </View>

        {otherUser?.cidade && otherUser?.estado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cidade:</Text>
              <Text style={styles.infoValue}>{otherUser.cidade}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <Text style={styles.infoValue}>{otherUser.estado}</Text>
            </View>
            {otherUser.pais && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>País:</Text>
                <Text style={styles.infoValue}>{otherUser.pais}</Text>
              </View>
            )}
          </View>
        )}

        {otherUser?.profissao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profissional</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Profissão:</Text>
              <Text style={styles.infoValue}>{otherUser.profissao}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Conexão</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>
              {isAccepted
                ? 'Aceita'
                : isPending
                ? isRequestedByMe
                  ? 'Aguardando resposta'
                  : 'Pendente'
                : 'Rejeitada'}
            </Text>
          </View>
          {initialConnection.created_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criada em:</Text>
              <Text style={styles.infoValue}>
                {formatDate(initialConnection.created_at)} ({formatTimeAgo(initialConnection.created_at)})
              </Text>
            </View>
          )}
        </View>

        {isPending && !isRequestedByMe && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Aceitar Conexão</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Rejeitar Conexão</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Remover Conexão</Text>
              )}
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
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: CustomColors.black,
  },
  statusBadge: {
    backgroundColor: CustomColors.successGreen + '33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusBadgePending: {
    backgroundColor: CustomColors.pendingYellow + '33',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: CustomColors.successGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextPending: {
    color: CustomColors.pendingYellow,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
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
    flex: 1,
    textAlign: 'right',
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
  removeButton: {
    backgroundColor: CustomColors.vividRed,
  },
  actionButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConnectionDetailScreen;
