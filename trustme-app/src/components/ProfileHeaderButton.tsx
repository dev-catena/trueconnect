import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CustomColors } from '../core/colors';
import SafeIcon from './SafeIcon';
import { BACKEND_BASE_URL } from '../utils/constants';
import { User } from '../types';

const getPhotoUrl = (caminhoFoto?: string) => {
  if (!caminhoFoto) return null;
  if (caminhoFoto.startsWith('http')) return caminhoFoto;
  return BACKEND_BASE_URL + (caminhoFoto.startsWith('/') ? caminhoFoto : '/' + caminhoFoto);
};

const getPrimeiroSegundoNome = (nomeCompleto?: string) => {
  if (!nomeCompleto || !nomeCompleto.trim()) return null;
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length >= 2) return `${partes[0]} ${partes[1]}`;
  return partes[0];
};

interface ProfileHeaderButtonProps {
  user?: User | null;
  onPress?: () => void;
}

const ProfileHeaderButton: React.FC<ProfileHeaderButtonProps> = ({ user, onPress }) => {
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [user?.caminho_foto]);

  const photoUrl = user && !photoError ? getPhotoUrl(user.caminho_foto) : null;
  const displayName = getPrimeiroSegundoNome(user?.nome_completo || user?.name) || user?.nome_completo || user?.name;

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.8}>
      {displayName ? (
        <Text style={styles.nameText} numberOfLines={1}>
          {displayName}
        </Text>
      ) : null}
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.avatar}
          onError={() => setPhotoError(true)}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <SafeIcon name="profile" size={24} color={CustomColors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 4,
    minHeight: 40,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.white,
    maxWidth: 120,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileHeaderButton;
