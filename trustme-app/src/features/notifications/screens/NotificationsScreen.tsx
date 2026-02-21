import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomScaffold from '../../../components/CustomScaffold';
import { CustomColors } from '../../../core/colors';
import SafeIcon from '../../../components/SafeIcon';
import ApiProvider from '../../../core/api/ApiProvider';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: {
    solicitante_id?: number;
    solicitante_nome?: string;
    contrato_id?: number;
    contrato_codigo?: string;
  };
  read_at: string | null;
  created_at: string;
}

interface NotificationsResponse {
  success?: boolean;
  result?: {
    data: Notification[];
    unread_count: number;
  };
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<any>('user/notifications');

      // Backend retorna { data: [...], unread_count: N }
      const data = response?.data ?? response?.result?.data;
      const count = response?.unread_count ?? response?.result?.unread_count ?? 0;

      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(typeof count === 'number' ? count : 0);
      }
    } catch (error: any) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadNotifications();
    }, [loadNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id: number) => {
    try {
      const api = new ApiProvider(true);
      await api.put(`user/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const api = new ApiProvider(true);
      await api.put('user/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleNotificationPress = (n: Notification) => {
    if (!n.read_at) {
      markAsRead(n.id);
    }
    if (n.type === 'clausula_revogada' && n.data?.contrato_id) {
      (navigation as any).navigate('Contracts', {
        screen: 'ContractDetail',
        params: {
          contract: {
            id: n.data.contrato_id,
            codigo: n.data.contrato_codigo || `#${n.data.contrato_id}`,
            status: 'Ativo',
            duracao: 0,
            dt_inicio: '',
            dt_fim: '',
            contratante_id: 0,
            contrato_tipo_id: 0,
          },
        },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return 'Agora';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)} dias atrás`;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading && !refreshing) {
    return (
      <CustomScaffold title="Notificações">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CustomColors.activeColor} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </CustomScaffold>
    );
  }

  return (
    <CustomScaffold title="Notificações">
      {notifications.length > 0 ? (
        <>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[CustomColors.activeColor]} />
            }
          >
            {notifications.map((n) => (
              <View key={n.id} style={[styles.card, !n.read_at && styles.cardUnread]}>
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => handleNotificationPress(n)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardIcon}>
                    <SafeIcon
                      name={
                        n.type === 'conexao_sem_slots' ? 'people' :
                        n.type === 'clausula_revogada' ? 'link-off' : 'notifications'
                      }
                      size={24}
                      color={CustomColors.activeColor}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, !n.read_at && styles.cardTitleUnread]}>{n.title}</Text>
                    <Text style={styles.cardMessage}>{n.message}</Text>
                    <Text style={styles.cardDate}>{formatDate(n.created_at)}</Text>
                  </View>
                </TouchableOpacity>
                {n.type === 'conexao_sem_slots' && (
                  <TouchableOpacity
                    style={styles.verPlanosBtn}
                    onPress={() => navigation.navigate('Home', { screen: 'Plans' })}
                  >
                    <Text style={styles.verPlanosText}>Ver planos</Text>
                    <SafeIcon name="arrow-forward" size={16} color={CustomColors.activeColor} />
                  </TouchableOpacity>
                )}
                {n.type === 'clausula_revogada' && (
                  <TouchableOpacity
                    style={styles.verPlanosBtn}
                    onPress={() => handleNotificationPress(n)}
                  >
                    <Text style={styles.verPlanosText}>Ver contrato</Text>
                    <SafeIcon name="arrow-forward" size={16} color={CustomColors.activeColor} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <SafeIcon name="notifications" size={64} color={CustomColors.activeGreyed} />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptySubtitle}>Você não tem notificações no momento</Text>
        </View>
      )}
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  markAllBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  markAllText: {
    fontSize: 14,
    color: CustomColors.activeColor,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderLeftWidth: 4,
    borderLeftColor: CustomColors.activeColor,
  },
  cardTouchable: {
    flexDirection: 'row',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CustomColors.activeColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    marginBottom: 4,
  },
  cardTitleUnread: {
    fontWeight: '700',
  },
  cardMessage: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    opacity: 0.8,
  },
  verPlanosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CustomColors.backgroundPrimaryColor,
  },
  verPlanosText: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeColor,
    marginRight: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
