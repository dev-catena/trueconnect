import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

type ConnectionPanelScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ConnectionPanel'
>;

const ConnectionPanelScreen: React.FC = () => {
  const navigation = useNavigation<ConnectionPanelScreenNavigationProp>();
  const { connections, refreshUserData, isLoading, user } = useUser();
  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['Todas', 'Pendentes', 'Aceitas', 'Aguardando'];

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
      await api.post(`usuario/conexoes/${connectionId}/aceitar`, {});
      await refreshUserData();
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
    }
  };

  const handleReject = async (connectionId: number) => {
    try {
      const api = new ApiProvider(true);
      await api.delete(`usuario/conexoes/${connectionId}`);
      await refreshUserData();
    } catch (error) {
      console.error('Erro ao rejeitar conexão:', error);
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
});

export default ConnectionPanelScreen;
