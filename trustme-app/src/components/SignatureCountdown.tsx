import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomColors } from '../core/colors';
import SafeIcon from './SafeIcon';

interface SignatureCountdownProps {
  dtPrazoAssinatura: string | null | undefined;
  compact?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

const SignatureCountdown: React.FC<SignatureCountdownProps> = ({
  dtPrazoAssinatura,
  compact = false,
}) => {
  const [remaining, setRemaining] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!dtPrazoAssinatura) {
      setRemaining(null);
      return;
    }

    const deadline = new Date(dtPrazoAssinatura).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setExpired(true);
        setRemaining(null);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining(`${pad(h)}:${pad(m)}:${pad(s)}`);
      setExpired(false);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [dtPrazoAssinatura]);

  if (!dtPrazoAssinatura) return null;

  if (expired) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={[styles.label, compact && styles.labelCompact]}>Tempo para assinatura</Text>
        <SafeIcon name="time" size={compact ? 20 : 28} color={CustomColors.vividRed} />
        <Text style={[styles.expired, compact && styles.expiredCompact]}>Expirado</Text>
      </View>
    );
  }

  if (!remaining) return null;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>Tempo para assinatura</Text>
      <Text style={[styles.value, compact && styles.valueCompact]}>{remaining}</Text>
      <SafeIcon name="time" size={compact ? 18 : 24} color={CustomColors.pendingYellow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: CustomColors.pendingYellow + '25',
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: CustomColors.pendingYellow,
  },
  containerCompact: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 8,
  },
  labelCompact: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: CustomColors.pendingYellow,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  valueCompact: {
    fontSize: 22,
    letterSpacing: 1,
  },
  expired: {
    fontSize: 24,
    fontWeight: '700',
    color: CustomColors.vividRed,
  },
  expiredCompact: {
    fontSize: 18,
  },
});

export default SignatureCountdown;
