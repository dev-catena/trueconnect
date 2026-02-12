import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import FilterChips from '../../../components/FilterChips';
import SearchBar from '../../../components/SearchBar';
import ConnectionTile from '../../../components/ConnectionTile';
import { Connection } from '../../../types';
import ApiProvider from '../../../core/api/ApiProvider';
import SafeIcon from '../../../components/SafeIcon';
import { formatUserCodeDisplay } from '../../../utils/formatters';

type ConnectionPanelScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ConnectionPanel'
>;
type ConnectionPanelScreenRouteProp = RouteProp<HomeStackParamList, 'ConnectionPanel'>;

const ConnectionPanelScreen: React.FC = () => {
  const navigation = useNavigation<ConnectionPanelScreenNavigationProp>();
  const route = useRoute<ConnectionPanelScreenRouteProp>();
  const { connections, refreshUserData, isLoading, user } = useUser();
  const initialFilter = route.params?.initialFilter;
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [connectionCode, setConnectionCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filters = ['Todas', 'Pendentes', 'Aceitas', 'Aguardando'];

  // TEMPORARIAMENTE DESABILITADO para evitar loops infinitos
  // Atualizar dados automaticamente quando a tela volta ao foco
  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Atualizar conexões quando a tela volta ao foco
  //     // Isso garante que se alguém aceitou uma conexão em outro dispositivo,
  //     // os dados serão atualizados quando o usuário voltar para esta tela
  //     if (user?.id) {
  //       // Adicionar delay para evitar chamadas imediatas
  //       const timeoutId = setTimeout(() => {
  //         refreshUserData();
  //       }, 500);
  //       
  //       // Configurar atualização periódica a cada 30 segundos enquanto a tela estiver em foco
  //       // Aumentado de 10 para 30 segundos para reduzir carga no servidor
  //       const intervalId = setInterval(() => {
  //         if (user?.id) {
  //           refreshUserData();
  //         }
  //       }, 30000); // 30 segundos

  //       // Limpar o intervalo e timeout quando a tela perder o foco
  //       return () => {
  //         clearTimeout(timeoutId);
  //         clearInterval(intervalId);
  //       };
  //     }
  //   }, [refreshUserData, user?.id])
  // );

  const filteredConnections = useMemo(() => {
    // Garantir que connections é um array válido
    if (!connections || Object.prototype.toString.call(connections) !== '[object Array]') {
      return [];
    }
    
    let filtered = connections;

    // Aplicar filtro de status
    if (selectedFilter === 'Pendentes') {
      filtered = filtered.filter((conn) => conn.aceito === null || conn.aceito === undefined);
    } else if (selectedFilter === 'Aceitas') {
      filtered = filtered.filter((conn) => conn.aceito === true);
    } else if (selectedFilter === 'Aguardando') {
      // Conexões que o usuário enviou e estão aguardando resposta
      filtered = filtered.filter(
        (conn) => conn.solicitante_id === user?.id && (conn.aceito === null || conn.aceito === undefined)
      );
    }

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conn) => {
        const otherUser = conn.solicitante_id === user?.id ? conn.destinatario : conn.solicitante;
        return (
          otherUser?.nome_completo?.toLowerCase().includes(query) ||
          otherUser?.name?.toLowerCase().includes(query) ||
          otherUser?.email?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [connections, selectedFilter, searchQuery, user]);

  const handleRefresh = async () => {
    await refreshUserData();
  };

  const handleAccept = async (connectionId: number) => {
    try {
      const api = new ApiProvider(true);
      const response = await api.post('conexao/responder', {
        conexao_id: connectionId,
        aceito: true
      });
      
      if (response.success || response.message) {
        // Aguardar um pouco para garantir que o backend processou
        await new Promise(resolve => setTimeout(resolve, 500));
        // Atualizar os dados do usuário
        await refreshUserData();
      }
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
      Alert.alert('Erro', 'Não foi possível aceitar a conexão. Tente novamente.');
    }
  };

  const handleReject = async (connectionId: number) => {
    try {
      const api = new ApiProvider(true);
      await api.post('conexao/responder', {
        conexao_id: connectionId,
        aceito: false
      });
      await refreshUserData();
    } catch (error) {
      console.error('Erro ao rejeitar conexão:', error);
    }
  };

  const handleRequestConnection = async () => {
    if (!connectionCode.trim() || connectionCode.length !== 6) {
      Alert.alert('Erro', 'Por favor, insira um código de 6 dígitos');
      return;
    }

    setSubmitting(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.post('conexao/solicitar', {
        usuario_codigo: connectionCode.trim()
      });

      if (response.success || response.message) {
        Alert.alert(
          'Sucesso',
          'Solicitação de conexão enviada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCodeModal(false);
                setConnectionCode('');
                refreshUserData();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Erro ao solicitar conexão:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erro ao solicitar conexão. Verifique o código e tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderConnection = ({ item }: { item: Connection }) => {
    const otherUser = item.solicitante_id === user?.id ? item.destinatario : item.solicitante;
    return (
      <ConnectionTile
        connection={{ ...item, solicitante: otherUser }}
        onPress={() => navigation.navigate('ConnectionDetail', { connection: item })}
        onAccept={() => handleAccept(item.id)}
        onReject={() => handleReject(item.id)}
      />
    );
  };

  return (
    <CustomScaffold title="Conexões">
      <HeaderLine title="Minhas Conexões" icon="connections" />
      
      {/* Código de Conexão do Usuário */}
      {user?.codigo && (
        <View style={styles.userCodeContainer}>
          <Text style={styles.userCodeLabel}>Meu Código de Conexão</Text>
          <View style={styles.userCodeDisplay}>
            <Text style={styles.userCodeText}>
              {formatUserCodeDisplay(user.codigo)}
            </Text>
          </View>
          <Text style={styles.userCodeHint}>
            Compartilhe este código para receber solicitações de conexão
          </Text>
        </View>
      )}
      
      {/* Botão para solicitar conexão por código */}
      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => setShowCodeModal(true)}
      >
        <SafeIcon name="plus-circle" size={24} color={CustomColors.white} />
        <Text style={styles.requestButtonText}>Solicitar Conexão por Código</Text>
      </TouchableOpacity>

      <SearchBar
        placeholder="Buscar conexões..."
        onSearch={setSearchQuery}
      />
      <FilterChips
        filters={filters}
        initialFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <FlatList
        data={filteredConnections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConnection}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedFilter !== 'Todas'
                ? 'Nenhuma conexão encontrada com os filtros aplicados'
                : 'Nenhuma conexão encontrada'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[CustomColors.activeColor]}
          />
        }
      />

      {/* Modal para inserir código */}
      <Modal
        visible={showCodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar Conexão</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCodeModal(false);
                  setConnectionCode('');
                }}
                style={styles.closeButton}
              >
                <SafeIcon name="close" size={24} color={CustomColors.activeGreyed} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Digite o código de 6 dígitos fornecido pelo contato com o qual você deseja se conectar.
              </Text>

              <View style={styles.codeInputContainer}>
                <TextInput
                  style={styles.codeInput}
                  value={connectionCode}
                  onChangeText={(text) => {
                    // Permitir apenas números e limitar a 6 dígitos
                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setConnectionCode(numericText);
                  }}
                  placeholder="000000"
                  placeholderTextColor={CustomColors.activeGreyed}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleRequestConnection}
                disabled={submitting || connectionCode.length !== 6}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={CustomColors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Solicitar Conexão</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
  userCodeContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    alignItems: 'center',
  },
  userCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CustomColors.activeGreyed,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userCodeDisplay: {
    backgroundColor: CustomColors.backgroundPrimaryColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  userCodeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  userCodeHint: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
    lineHeight: 16,
  },
  requestButton: {
    backgroundColor: CustomColors.activeColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 8,
    borderRadius: 8,
  },
  requestButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: CustomColors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: CustomColors.backgroundPrimaryColor,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 24,
    lineHeight: 20,
  },
  codeInputContainer: {
    marginBottom: 24,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    color: CustomColors.black,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  submitButton: {
    backgroundColor: CustomColors.activeColor,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConnectionPanelScreen;
