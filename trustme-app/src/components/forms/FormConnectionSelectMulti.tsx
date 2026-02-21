import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { CustomColors } from '../../core/colors';
import SafeIcon from '../SafeIcon';
import { Connection, User } from '../../types';
import { BACKEND_BASE_URL } from '../../utils/constants';

interface FormConnectionSelectMultiProps {
  label: string;
  value?: number[];
  connections: Connection[];
  currentUserId?: number;
  onChange: (userIds: number[]) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const FormConnectionSelectMulti: React.FC<FormConnectionSelectMultiProps> = ({
  label,
  value = [],
  connections,
  currentUserId,
  onChange,
  error,
  required = false,
  placeholder = 'Selecione as partes interessadas',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(value);

  const activeConnections = connections.filter((conn) => {
    const aceitoValue = conn.aceito;
    return aceitoValue === true || aceitoValue === 1 || aceitoValue === 'true' || aceitoValue === '1';
  });

  const availableUsers = activeConnections.map((conn) => {
    const otherUser = conn.solicitante_id === currentUserId ? conn.destinatario : conn.solicitante;
    return { user: otherUser, connection: conn };
  }).filter((item): item is { user: User; connection: Connection } => item.user !== undefined);

  const toggleUser = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleConfirm = () => {
    onChange(selectedIds);
    setModalVisible(false);
  };

  const handleOpen = () => {
    setSelectedIds(value);
    setModalVisible(true);
  };

  const getPhotoUrl = (caminhoFoto?: string) => {
    if (!caminhoFoto) return null;
    if (caminhoFoto.startsWith('http')) return caminhoFoto;
    return BACKEND_BASE_URL + (caminhoFoto.startsWith('/') ? caminhoFoto : '/' + caminhoFoto);
  };

  const selectedUsers = availableUsers.filter((item) => value.includes(item.user.id));

  const renderConnectionItem = ({ item }: { item: { user: User; connection: Connection } }) => {
    const photoUrl = getPhotoUrl(item.user.caminho_foto);
    const userName = item.user.nome_completo || item.user.name || 'Usuário';
    const userInitial = userName.charAt(0).toUpperCase();
    const isSelected = selectedIds.includes(item.user.id);

    return (
      <TouchableOpacity
        style={[styles.connectionItem, isSelected && styles.connectionItemSelected]}
        onPress={() => toggleUser(item.user.id)}
        activeOpacity={0.7}
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
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <SafeIcon name="checkmark" size={14} color={CustomColors.white} />}
        </View>
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
        onPress={handleOpen}
      >
        {selectedUsers.length > 0 ? (
          <View style={styles.selectedUsersContainer}>
            <Text style={styles.inputText}>
              {selectedUsers.length === 1
                ? selectedUsers[0].user.nome_completo || selectedUsers[0].user.name || 'Usuário'
                : `${selectedUsers.length} pessoas selecionadas`}
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
                <Text style={styles.emptyText}>Nenhuma conexão ativa disponível</Text>
                <Text style={styles.emptySubtext}>
                  Você precisa ter conexões aceitas para criar um contrato
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={availableUsers}
                  keyExtractor={(item) => item.user.id.toString()}
                  renderItem={renderConnectionItem}
                  contentContainerStyle={styles.listContent}
                />
                <View style={styles.modalFooter}>
                  <Text style={styles.selectedCount}>
                    {selectedIds.length} selecionada{selectedIds.length !== 1 ? 's' : ''}
                  </Text>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: CustomColors.black,
  },
  required: { color: CustomColors.vividRed },
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
  inputError: { borderColor: CustomColors.vividRed },
  selectedUsersContainer: { flex: 1 },
  inputText: { fontSize: 16, color: CustomColors.black },
  placeholder: { color: CustomColors.activeGreyed },
  errorText: { color: CustomColors.vividRed, fontSize: 12, marginTop: 4 },
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: CustomColors.black },
  listContent: { paddingBottom: 8 },
  connectionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionItemSelected: { backgroundColor: CustomColors.activeColor + '20' },
  connectionItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarImage: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: CustomColors.white, fontSize: 20, fontWeight: 'bold' },
  connectionInfo: { flex: 1 },
  connectionName: { fontSize: 16, color: CustomColors.black, fontWeight: '500', marginBottom: 4 },
  connectionNameSelected: { color: CustomColors.activeColor, fontWeight: '600' },
  connectionEmail: { fontSize: 14, color: CustomColors.activeGreyed },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: CustomColors.activeColor,
    borderColor: CustomColors.activeColor,
  },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: CustomColors.black, marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: CustomColors.activeGreyed, textAlign: 'center' },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedCount: { fontSize: 14, color: CustomColors.activeGreyed },
  confirmButton: {
    backgroundColor: CustomColors.activeColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonText: { color: CustomColors.white, fontWeight: '600' },
});

export default FormConnectionSelectMulti;
