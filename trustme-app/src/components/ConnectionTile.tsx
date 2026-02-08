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
  const otherUser = connection.solicitante || connection.destinatario;
  const isPending = connection.aceito === null || connection.aceito === undefined;
  const isAccepted = connection.aceito === true;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          {otherUser?.caminho_foto ? (
            <Image
              source={{ uri: otherUser.caminho_foto }}
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
        <View style={styles.info}>
          <Text style={styles.name}>
            {otherUser?.nome_completo || otherUser?.name || 'Usuário'}
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


