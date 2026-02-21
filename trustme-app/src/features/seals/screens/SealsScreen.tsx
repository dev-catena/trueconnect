import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import ApiProvider from '../../../core/api/ApiProvider';
import SafeIcon from '../../../components/SafeIcon';
import { useUser } from '../../../core/context/UserContext';

type SealsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Seals'>;

interface Selo {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  validade?: number;
  documentos_evidencias?: (string | { nome: string; obrigatorio?: boolean })[];
  descricao_como_obter?: string;
  custo_obtencao?: number;
  ativo: boolean;
}

interface UserSeal {
  id: number;
  selo_id: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  created_at: string;
}

const SealsScreen: React.FC = () => {
  const navigation = useNavigation<SealsScreenNavigationProp>();
  const { user } = useUser();
  const [selos, setSelos] = useState<Selo[]>([]);
  const [userSeals, setUserSeals] = useState<UserSeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelos();
    loadUserSeals();
  }, []);

  // Recarregar quando voltar para a tela
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSelos();
      loadUserSeals();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSelos = async () => {
    try {
      // Verificar se o usuário está autenticado
      if (!user?.id) {
        console.warn('Usuário não autenticado, não é possível carregar selos');
        setLoading(false);
        return;
      }

      const api = new ApiProvider(true); // Garantir que usa token
      const response = await api.get<{ success: boolean; data: Selo[] }>('selos/listar');
      
      if (response.success && Array.isArray(response.data)) {
        // Converter custo_obtencao de string para number se necessário
        const selosProcessados = response.data
          .filter((s: Selo) => s.ativo !== false)
          .map((s: any) => ({
            ...s,
            custo_obtencao: s.custo_obtencao != null 
              ? (typeof s.custo_obtencao === 'string' ? parseFloat(s.custo_obtencao) : s.custo_obtencao)
              : 0
          }));
        setSelos(selosProcessados);
      } else {
        console.warn('Resposta inválida ao carregar selos:', response);
      }
    } catch (error: any) {
      console.error('Erro ao carregar selos:', error);
      if (error.response?.status === 401) {
        Alert.alert('Erro de autenticação', 'Sua sessão expirou. Por favor, faça login novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os selos');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserSeals = async () => {
    if (!user?.id) return;
    
    try {
      const api = new ApiProvider(true); // Garantir que usa token
      const response = await api.get<{ success: boolean; result: any }>(`usuario/${user.id}/selos`);
      
      if (response.success && response.result) {
        // Processar selos do usuário
        const seals: UserSeal[] = [];
        if (response.result.ativos) {
          seals.push(...response.result.ativos.map((s: any) => ({ 
            ...s, 
            status: 'aprovado' as const,
            selo_id: s.selo_id || s.selo?.id || null
          })));
        }
        if (response.result.pendentes) {
          seals.push(...response.result.pendentes.map((s: any) => ({ 
            ...s, 
            status: 'pendente' as const,
            selo_id: s.selo_id || s.selo?.id || null
          })));
        }
        if (response.result.expirados) {
          seals.push(...response.result.expirados.map((s: any) => ({ 
            ...s, 
            status: 'expirado' as const,
            selo_id: s.selo_id || s.selo?.id || null
          })));
        }
        if (response.result.cancelados) {
          seals.push(...response.result.cancelados.map((s: any) => ({ 
            ...s, 
            status: 'rejeitado' as const,
            selo_id: s.selo_id || s.selo?.id || null
          })));
        }
        
        // Também verificar se há selos com status 'under_review' e mapear para 'pendente'
        // Isso pode vir de SealRequest se o sistema estiver usando o novo modelo
        if (response.result.under_review) {
          seals.push(...response.result.under_review.map((s: any) => ({ 
            ...s, 
            status: 'pendente' as const,
            selo_id: s.selo_id || s.selo?.id || null
          })));
        }
        
        if (__DEV__) console.log('Selos do usuário carregados:', seals.length, 'selos');
        setUserSeals(seals);
      }
    } catch (error: any) {
      // Não mostrar erro para o usuário, apenas logar silenciosamente
      // O erro 401 é esperado se o token expirou, mas não deve quebrar a aplicação
      if (error.response?.status === 401) {
        console.warn('Token expirado ou não autenticado ao carregar selos do usuário');
      } else {
        console.error('Erro ao carregar selos do usuário:', error);
      }
      // Não definir userSeals como vazio, manter o estado anterior
    }
  };

  const getUserSealStatus = (seloId: number): 'pendente' | 'aprovado' | 'rejeitado' | 'expirado' | null => {
    // Buscar o selo atual para obter o código
    const selo = selos.find(s => s.id === seloId);
    if (!selo) return null;
    
    // Buscar por selo_id diretamente
    let userSeal = userSeals.find(us => us.selo_id === seloId);
    
    // Se não encontrar, tentar buscar pelo código do selo no objeto selo dentro do userSeal
    if (!userSeal && selo.codigo) {
      userSeal = userSeals.find(us => {
        const sealSelo = (us as any).selo;
        return sealSelo && (sealSelo.id === seloId || sealSelo.codigo === selo.codigo);
      });
    }
    
    if (__DEV__ && userSeal) {
      console.log(`Status encontrado para selo ${seloId} (${selo.codigo}):`, userSeal.status);
    }
    
    return userSeal ? userSeal.status : null;
  };

  const handleAcquireSeal = (selo: Selo) => {
    navigation.navigate('SealAcquisition', { selo });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;

    const statusConfig: Record<string, { color: string; label: string; icon: string; bgColor: string }> = {
      pendente: { 
        color: '#FF9800', 
        label: 'Em análise', 
        icon: 'hourglass',
        bgColor: '#FFF3E0'
      },
      aprovado: { 
        color: '#4CAF50', 
        label: 'Concedido', 
        icon: 'checkmark-circle',
        bgColor: '#E8F5E9'
      },
      rejeitado: { 
        color: '#F44336', 
        label: 'Rejeitado', 
        icon: 'close-circle',
        bgColor: '#FFEBEE'
      },
      expirado: { 
        color: '#9E9E9E', 
        label: 'Expirado', 
        icon: 'alert-circle',
        bgColor: '#F5F5F5'
      },
    };

    const config = statusConfig[status];
    if (!config) return null;

    // Componente animado para status "pendente"
    if (status === 'pendente') {
      return <AnimatedStatusBadge config={config} />;
    }

    // Componente especial para status "aprovado"
    if (status === 'aprovado') {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeApproved, { backgroundColor: config.bgColor }]}>
          <SafeIcon name={config.icon} size={18} color={config.color} />
          <Text style={[styles.statusText, styles.statusTextApproved, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <SafeIcon name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando selos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={CustomColors.white} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../../assets/images/trustme-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              tintColor={CustomColors.white}
            />
          </View>
          <Text style={styles.headerTitle}>Selos Disponíveis</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SafeIcon name="seal" size={64} color={CustomColors.activeGreyed} />
            <Text style={styles.emptyText}>Nenhum selo disponível no momento</Text>
          </View>
        ) : (
          selos.map((selo) => {
            const status = getUserSealStatus(selo.id);
            const hasSeal = status !== null;

            return (
              <View 
                key={selo.id} 
                style={[
                  styles.sealCard,
                  status === 'aprovado' && styles.sealCardApproved,
                  status === 'pendente' && styles.sealCardPending
                ]}
              >
                {status === 'aprovado' && (
                  <View style={styles.approvedBanner}>
                    <SafeIcon name="checkmark-circle" size={20} color={CustomColors.white} />
                    <Text style={styles.approvedBannerText}>Selo Concedido</Text>
                  </View>
                )}
                {status === 'pendente' && (
                  <View style={styles.pendingBanner}>
                    <ActivityIndicator size="small" color="#FF9800" />
                    <Text style={styles.pendingBannerText}>Selo em Análise</Text>
                  </View>
                )}
                <View style={styles.sealHeader}>
                  <View style={[
                    styles.sealIconContainer,
                    status === 'aprovado' && styles.sealIconContainerApproved
                  ]}>
                    <SafeIcon 
                      name="seal" 
                      size={32} 
                      color={status === 'aprovado' ? '#4CAF50' : CustomColors.activeColor} 
                    />
                  </View>
                  <View style={styles.sealInfo}>
                    <Text style={styles.sealName}>{selo.nome || selo.descricao || selo.codigo}</Text>
                    <Text style={styles.sealCode}>Código: {selo.codigo}</Text>
                    {selo.descricao && (
                      <Text style={styles.sealDescription} numberOfLines={2}>
                        {selo.descricao}
                      </Text>
                    )}
                  </View>
                </View>

                {selo.descricao_como_obter && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Como obter:</Text>
                    <Text style={styles.sectionText}>{selo.descricao_como_obter}</Text>
                  </View>
                )}

                {selo.documentos_evidencias && selo.documentos_evidencias.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documentos necessários:</Text>
                    {selo.documentos_evidencias.map((doc, index) => {
                      const label = typeof doc === 'string' 
                        ? doc 
                        : (doc && typeof doc === 'object' && 'nome' in doc ? doc.nome : String(doc));
                      return (
                        <Text key={index} style={styles.documentItem}>• {label}</Text>
                      );
                    })}
                  </View>
                )}

                <View style={styles.sealFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Custo:</Text>
                    <Text style={styles.priceValue}>
                      R$ {selo.custo_obtencao != null && typeof selo.custo_obtencao === 'number' 
                        ? selo.custo_obtencao.toFixed(2).replace('.', ',') 
                        : '0,00'}
                    </Text>
                  </View>
                  {getStatusBadge(status)}
                </View>

                {(!hasSeal || status === 'rejeitado' || status === 'expirado') && (
                  <View style={styles.acquireButtonContainer}>
                    <TouchableOpacity
                      style={styles.acquireButton}
                      onPress={() => handleAcquireSeal(selo)}
                    >
                      <SafeIcon name="add-circle" size={16} color={CustomColors.activeColor} />
                      <Text style={styles.acquireButtonText}>
                        {status === 'rejeitado' || status === 'expirado' ? 'Solicitar novamente' : 'Adquirir Selo'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Componente animado para status "pendente"
const AnimatedStatusBadge: React.FC<{ config: { color: string; label: string; icon: string; bgColor: string } }> = ({ config }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View 
      style={[
        styles.statusBadge, 
        styles.statusBadgePending,
        { 
          backgroundColor: config.bgColor,
          transform: [{ scale: pulseAnim }]
        }
      ]}
    >
      <ActivityIndicator size="small" color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  header: {
    backgroundColor: CustomColors.activeColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginLeft: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: CustomColors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
  sealCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sealCardApproved: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  sealCardPending: {
    borderWidth: 2,
    borderColor: '#FF9800',
    borderStyle: 'dashed',
  },
  approvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  approvedBannerText: {
    color: CustomColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  pendingBannerText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
  sealHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  sealIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sealIconContainerApproved: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  sealInfo: {
    flex: 1,
  },
  sealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  sealCode: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    marginBottom: 4,
  },
  sealDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    lineHeight: 20,
  },
  documentItem: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 4,
    lineHeight: 20,
  },
  sealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusBadgeApproved: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statusBadgePending: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextApproved: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  acquireButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  acquireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomColors.pastelBlue,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  acquireButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeColor,
  },
});

export default SealsScreen;

