import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomColors } from '../core/colors';
import SafeIcon from './SafeIcon';

interface ContractValidityCountdownProps {
  dtFim: string | null | undefined;
  compact?: boolean;
}

const ContractValidityCountdown: React.FC<ContractValidityCountdownProps> = ({
  dtFim,
  compact = false,
}) => {
  const [remaining, setRemaining] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!dtFim) {
      setRemaining(null);
      return;
    }

    const deadline = new Date(dtFim).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setExpired(true);
        setRemaining(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setRemaining(`${hours}h ${mins}m`);
      } else {
        setRemaining(`${mins}m`);
      }
      setExpired(false);
    };

    tick();
    const timer = setInterval(tick, 60000); // atualiza a cada minuto
    return () => clearInterval(timer);
  }, [dtFim]);

  if (!dtFim) return null;

  if (expired) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <SafeIcon name="time" size={compact ? 14 : 18} color={CustomColors.vividRed} />
        <Text style={[styles.expired, compact && styles.expiredCompact]}>Expirado</Text>
      </View>
    );
  }

  if (!remaining) return null;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <SafeIcon name="time" size={compact ? 14 : 18} color={CustomColors.successGreen} />
      <Text style={[styles.value, compact && styles.valueCompact]}>Restante: {remaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  containerCompact: {
    gap: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: CustomColors.successGreen,
  },
  valueCompact: {
    fontSize: 10,
  },
  expired: {
    fontSize: 12,
    fontWeight: '600',
    color: CustomColors.vividRed,
  },
  expiredCompact: {
    fontSize: 10,
  },
});

export default ContractValidityCountdown;
