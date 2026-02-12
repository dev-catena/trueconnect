import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Connection, ConnectionStatus } from '../types';
import { CustomColors } from '../core/colors';
import { formatTimeAgo } from '../utils/dateParser';
import SafeIcon from './SafeIcon';

interface ConnectionTileProps {
  connection: Connection;
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

const ConnectionTile: React.FC<ConnectionTileProps> = ({
  connection,
  onPress,
  onAccept,
  onReject,
}) => {
  // Determinar qual usuário é o "outro" (não o usuário atual)
  // Se connection.solicitante existe e tem dados, usar ele, senão usar destinatario
  const otherUser = connection.solicitante?.id ? connection.solicitante : (connection.destinatario || connection.solicitante);
  const isPending = connection.aceito === null || connection.aceito === undefined;
  const isAccepted = connection.aceito === true;

  // Construir URL completa da foto se necessário
  const getPhotoUrl = (caminhoFoto?: string) => {
    if (!caminhoFoto) return null;
    if (caminhoFoto.startsWith('http')) return caminhoFoto;
    const BASE_URL = __DEV__ ? 'http://10.102.0.103:8001' : 'https://api-trustme.catenasystem.com.br';
    return BASE_URL + (caminhoFoto.startsWith('/') ? caminhoFoto : '/' + caminhoFoto);
  };

  const photoUrl = getPhotoUrl(otherUser?.caminho_foto);
  const userName = otherUser?.nome_completo || otherUser?.name || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  // Debug: log para verificar se caminho_foto está presente
  if (__DEV__ && otherUser) {
    console.log('ConnectionTile - otherUser:', {
      id: otherUser.id,
      nome: userName,
      caminho_foto: otherUser.caminho_foto,
      photoUrl: photoUrl,
    });
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatarImage}
              onError={(error) => {
                console.error('Erro ao carregar foto do usuário:', error);
              }}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {userName}
          </Text>
          <Text style={styles.email}>{otherUser?.email}</Text>
          {connection.created_at && (
            <Text style={styles.date}>{formatTimeAgo(connection.created_at)}</Text>
          )}
        </View>
        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={onAccept}
            >
              <SafeIcon
                name="check"
                size={20}
                color={CustomColors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={onReject}
            >
              <SafeIcon
                name="close"
                size={20}
                color={CustomColors.white}
              />
            </TouchableOpacity>
          </View>
        )}
        {isAccepted && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Conectado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: CustomColors.successGreen,
  },
  rejectButton: {
    backgroundColor: CustomColors.vividRed,
  },
  statusBadge: {
    backgroundColor: CustomColors.successGreen + '33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: CustomColors.successGreen,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConnectionTile;


