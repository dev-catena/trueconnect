import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractsStackParamList, HomeStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import FilterChips from '../../../components/FilterChips';
import SearchBar from '../../../components/SearchBar';
import ContractCard from '../../../components/ContractCard';
import SafeIcon from '../../../components/SafeIcon';
import { Contract } from '../../../types';

type ContractsScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList & ContractsStackParamList,
  'ContractsMain' | 'Contracts'
>;

const ContractsScreen: React.FC = () => {
  const navigation = useNavigation<ContractsScreenNavigationProp>();
  const route = useRoute<any>();
  const { contracts, refreshUserData, isLoading } = useUser();
  const initialFilter = route.params?.initialFilter as string | undefined;
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'Todos');

  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['Todos', 'Pendente', 'Ativo', 'Concluído', 'Expirado'];

  const filteredContracts = useMemo(() => {
    // Garantir que contracts é um array válido
    if (!contracts || Object.prototype.toString.call(contracts) !== '[object Array]') {
      return [];
    }
    
    let filtered = contracts;

    // Aplicar filtro de status
    if (selectedFilter !== 'Todos') {
      filtered = filtered.filter((contract) => contract.status === selectedFilter);
    }

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contract) =>
          contract.codigo?.toLowerCase().includes(query) ||
          contract.tipo?.descricao?.toLowerCase().includes(query) ||
          contract.contratante?.nome_completo?.toLowerCase().includes(query) ||
          contract.contratante?.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [contracts, selectedFilter, searchQuery]);

  const handleRefresh = async () => {
    await refreshUserData();
  };

  const renderContract = ({ item }: { item: Contract }) => (
    <ContractCard contract={item} />
  );

  return (
    <CustomScaffold
      title="Contratos"
      floatingActionButton={
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('NewContract')}
        >
          <SafeIcon
            name="add-circle"
            size={32}
            color={CustomColors.white}
          />
        </TouchableOpacity>
      }
    >
      <HeaderLine title="Meus Contratos" icon="document-text" />
      <SearchBar
        placeholder="Buscar contratos..."
        onSearch={setSearchQuery}
      />
      <FilterChips
        filters={filters}
        initialFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <FlatList
        data={filteredContracts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderContract}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedFilter !== 'Todos'
                ? 'Nenhum contrato encontrado com os filtros aplicados'
                : 'Nenhum contrato encontrado'}
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
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ContractsScreen;
