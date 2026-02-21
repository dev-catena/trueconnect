import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { CustomColors } from '../../core/colors';
import SafeIcon from '../SafeIcon';
import { Connection, User } from '../../types';
import { BACKEND_BASE_URL } from '../../utils/constants';

interface FormConnectionSelectProps {
  label: string;
  value?: number;
  connections: Connection[];
  currentUserId?: number;
  onChange: (userId: number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const FormConnectionSelect: React.FC<FormConnectionSelectProps> = ({
  label,
  value,
  connections,
  currentUserId,
  onChange,
  error,
  required = false,
  placeholder = 'Selecione uma conexão',
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Filtrar apenas conexões ativas (aceitas)
  // Verificar tanto true quanto 1 (pode vir do backend como número) ou string "true"
  const activeConnections = connections.filter((conn) => {
    // Normalizar o valor de aceito para comparação
    const aceitoValue = conn.aceito;
    const isAccepted = aceitoValue === true || aceitoValue === 1 || aceitoValue === 'true' || aceitoValue === '1';
    
    if (__DEV__) {
      console.log('FormConnectionSelect - Verificando conexão:', {
        id: conn.id,
        aceito: aceitoValue,
        tipo: typeof aceitoValue,
        isAccepted,
        solicitante_id: conn.solicitante_id,
        destinatario_id: conn.destinatario_id,
        tem_solicitante: !!conn.solicitante,
        tem_destinatario: !!conn.destinatario,
        solicitante_nome: conn.solicitante?.nome_completo,
        destinatario_nome: conn.destinatario?.nome_completo,
      });
    }
    return isAccepted;
  });

  if (__DEV__) {
    console.log('FormConnectionSelect - Total de conexões recebidas:', connections.length);
    console.log('FormConnectionSelect - Conexões ativas encontradas:', activeConnections.length);
    console.log('FormConnectionSelect - Todas as conexões:', connections.map(c => ({
      id: c.id,
      aceito: c.aceito,
      tipo_aceito: typeof c.aceito,
    })));
  }

  // Mapear conexões para usuários disponíveis
  const availableUsers = activeConnections.map((conn) => {
    const otherUser = conn.solicitante_id === currentUserId ? conn.destinatario : conn.solicitante;
    return {
      user: otherUser,
      connection: conn,
    };
  }).filter((item): item is { user: User; connection: Connection } => item.user !== undefined);

  const selectedUser = availableUsers.find((item) => item.user.id === value);

  const getPhotoUrl = (caminhoFoto?: string) => {
    if (!caminhoFoto) return null;
    if (caminhoFoto.startsWith('http')) return caminhoFoto;
    return BACKEND_BASE_URL + (caminhoFoto.startsWith('/') ? caminhoFoto : '/' + caminhoFoto);
  };

  const renderConnectionItem = ({ item }: { item: { user: User; connection: Connection } }) => {
    const photoUrl = getPhotoUrl(item.user.caminho_foto);
    const userName = item.user.nome_completo || item.user.name || 'Usuário';
    const userInitial = userName.charAt(0).toUpperCase();
    const isSelected = value === item.user.id;

    return (
      <TouchableOpacity
        style={[styles.connectionItem, isSelected && styles.connectionItemSelected]}
        onPress={() => {
          onChange(item.user.id);
          setModalVisible(false);
        }}
      >
        <View style={styles.connectionItemContent}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
          )}
          <View style={styles.connectionInfo}>
            <Text style={[styles.connectionName, isSelected && styles.connectionNameSelected]}>
              {userName}
            </Text>
            {item.user.email && (
              <Text style={styles.connectionEmail}>{item.user.email}</Text>
            )}
          </View>
        </View>
        {isSelected && (
          <SafeIcon name="checkmark-circle" size={24} color={CustomColors.activeColor} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        {selectedUser ? (
          <View style={styles.selectedUserContainer}>
            {getPhotoUrl(selectedUser.user.caminho_foto) ? (
              <Image
                source={{ uri: getPhotoUrl(selectedUser.user.caminho_foto)! }}
                style={styles.selectedAvatar}
              />
            ) : (
              <View style={styles.selectedAvatarPlaceholder}>
                <Text style={styles.selectedAvatarText}>
                  {(selectedUser.user.nome_completo || selectedUser.user.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.inputText}>
              {selectedUser.user.nome_completo || selectedUser.user.name || 'Usuário'}
            </Text>
          </View>
        ) : (
          <Text style={[styles.inputText, styles.placeholder]}>{placeholder}</Text>
        )}
        <SafeIcon name="chevron-down" size={20} color={CustomColors.activeGreyed} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <SafeIcon name="close" size={24} color={CustomColors.activeGreyed} />
              </TouchableOpacity>
            </View>
            {availableUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <SafeIcon name="people" size={48} color={CustomColors.activeGreyed} />
                <Text style={styles.emptyText}>
                  Nenhuma conexão ativa disponível
                </Text>
                <Text style={styles.emptySubtext}>
                  Você precisa ter conexões aceitas para criar um contrato
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableUsers}
                keyExtractor={(item) => item.user.id.toString()}
                renderItem={renderConnectionItem}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: CustomColors.black,
  },
  required: {
    color: CustomColors.vividRed,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: CustomColors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputError: {
    borderColor: CustomColors.vividRed,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedAvatarText: {
    color: CustomColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputText: {
    fontSize: 16,
    color: CustomColors.black,
    flex: 1,
  },
  placeholder: {
    color: CustomColors.activeGreyed,
  },
  errorText: {
    color: CustomColors.vividRed,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CustomColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  listContent: {
    paddingBottom: 16,
  },
  connectionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionItemSelected: {
    backgroundColor: CustomColors.activeColor + '20',
  },
  connectionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: CustomColors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    color: CustomColors.black,
    fontWeight: '500',
    marginBottom: 4,
  },
  connectionNameSelected: {
    color: CustomColors.activeColor,
    fontWeight: '600',
  },
  connectionEmail: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
});

export default FormConnectionSelect;

