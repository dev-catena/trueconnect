import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SafeIconProps {
  name: string;
  size?: number;
  color?: string;
}

// Mapeamento de nomes de ícones para MaterialCommunityIcons
const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  home: 'home',
  'document-text': 'file-document',
  document: 'file-pdf-box',
  notifications: 'bell',
  profile: 'account-circle',
  connections: 'link',
  seals: 'shield-check', // Nível de segurança e confiabilidade
  seal: 'shield-check', // Nível de segurança e confiabilidade autenticada
  shield: 'shield',
  'arrow-back': 'arrow-left',
  'add-circle': 'plus-circle',
  'plus-circle': 'plus-circle',
  'clock-outline': 'clock-outline',
  'check-circle': 'check-circle',
  'close-circle': 'close-circle',
  'alert-circle': 'alert-circle',
  camera: 'camera',
  'qr-code': 'qrcode',
  card: 'credit-card',
  lock: 'lock',
  'arrow-forward': 'arrow-right',
  'eye': 'eye',
  'eye-off': 'eye-off',
  'check': 'check',
  'close': 'close',
  'account': 'account',
  'clock': 'clock-outline',
  'time': 'clock-outline',
  'logout': 'logout',
  'shield-off': 'shield-off',
  'calendar': 'calendar',
  'link-off': 'link-off',
  star: 'star',
  'star-outline': 'star-outline',
};

const SafeIcon: React.FC<SafeIconProps> = ({ 
  name, 
  size = 24, 
  color = '#000' 
}) => {
  const iconName = iconMap[name] || 'circle';
  
  return (
    <MaterialCommunityIcons 
      name={iconName} 
      size={size} 
      color={color} 
    />
  );
};

export default SafeIcon;


