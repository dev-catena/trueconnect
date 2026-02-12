import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractsStackParamList, HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import FormSelect from '../../../components/forms/FormSelect';
import FormConnectionSelect from '../../../components/forms/FormConnectionSelect';
import { useUser } from '../../../core/context/UserContext';
import { User, ContractType, Connection } from '../../../types';
import ApiProvider from '../../../core/api/ApiProvider';
import SafeIcon from '../../../components/SafeIcon';

type NewContractScreenNavigationProp = NativeStackNavigationProp<
  ContractsStackParamList | HomeStackParamList,
  'NewContract'
>;

interface NewContractFormData {
  stakeHolderId: number | null;
  contractTypeId: number | null;
  validity: number; // Duração em horas (1, 2, 6 ou 24)
}

const NewContractScreen: React.FC = () => {
  const navigation = useNavigation<NewContractScreenNavigationProp>();
  const { connections, user, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<NewContractFormData>({
    stakeHolderId: null,
    contractTypeId: null,
    validity: 24, // Valor padrão: 24 horas
  });

  // Opções predefinidas de duração do contrato
  const durationOptions = [
    { label: '1 hora', value: 1 },
    { label: '2 horas', value: 2 },
    { label: '6 horas', value: 6 },
    { label: '24 horas', value: 24 },
  ];
  const [defaultClauses, setDefaultClauses] = useState<number[]>([]);

  useEffect(() => {
    loadContractTypes();
  }, []);

  // Atualizar conexões quando a tela é montada para garantir dados atualizados
  useEffect(() => {
    if (user?.id) {
      refreshUserData();
    }
  }, [user?.id]);

  // Log quando contractTypes mudar
  useEffect(() => {
    if (__DEV__) {
      console.log('NewContractScreen - contractTypes atualizado:', contractTypes.length, contractTypes);
    }
  }, [contractTypes]);

  useEffect(() => {
    if (formData.contractTypeId) {
      loadDefaultClauses(formData.contractTypeId);
    } else {
      setDefaultClauses([]);
    }
  }, [formData.contractTypeId]);

  const loadContractTypes = async () => {
    try {
      const api = new ApiProvider(true);
      // Buscar tipos de contrato cadastrados na web-admin
      // Usar apenas o endpoint /listar que é acessível para usuários do app
      console.log('🔍 Buscando tipos de contrato em: contrato-tipos/listar');
      const response = await api.get('contrato-tipos/listar');
      console.log('✅ Resposta recebida:', JSON.stringify(response, null, 2));
      
      // A resposta do método ok() vem como { success: true, message: '...', result: [...] }
      let types: ContractType[] = [];
      
      if (response) {
        if (response.result && Array.isArray(response.result)) {
          console.log('✅ Encontrado response.result (array) com', response.result.length, 'tipos');
          types = response.result;
        } else if (response.data && Array.isArray(response.data)) {
          console.log('✅ Encontrado response.data (array) com', response.data.length, 'tipos');
          types = response.data;
        } else if (Array.isArray(response)) {
          console.log('✅ response é array direto com', response.length, 'tipos');
          types = response;
        } else {
          console.warn('⚠️ Estrutura de resposta não reconhecida:', Object.keys(response));
        }
      } else {
        console.warn('⚠️ response é null ou undefined');
      }
      
      console.log('📊 Tipos de contrato processados:', types.length);
      if (types.length > 0) {
        console.log('📊 Tipos encontrados:', types.map(t => ({ id: t.id, codigo: t.codigo, descricao: t.descricao })));
      } else {
        console.warn('⚠️ Nenhum tipo de contrato encontrado após processamento');
      }
      
      setContractTypes(types);
    } catch (error: any) {
      console.error('❌ Erro ao carregar tipos de contrato:', error);
      console.error('❌ Erro detalhado:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os tipos de contrato. Tente novamente.');
    }
  };

  const loadDefaultClauses = async (contractTypeId: number) => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ result: { clausulas: any[] } }>(`contrato-tipos/${contractTypeId}/clausulas-perguntas`);
      if (response.result && response.result.clausulas) {
        const clauseIds = response.result.clausulas.map((c: any) => c.id).filter((id: any): id is number => id !== undefined);
        setDefaultClauses(clauseIds);
      }
    } catch (error) {
      console.error('Erro ao carregar cláusulas padrão:', error);
      setDefaultClauses([]);
    }
  };

  // Garantir que connections é um array válido
  const safeConnections = connections && Object.prototype.toString.call(connections) === '[object Array]' 
    ? connections 
    : [];
  
  if (__DEV__) {
    console.log('NewContractScreen - Todas as conexões recebidas:', safeConnections.map(c => ({
      id: c.id,
      aceito: c.aceito,
      tipo_aceito: typeof c.aceito,
      solicitante_id: c.solicitante_id,
      destinatario_id: c.destinatario_id,
      solicitante_nome: c.solicitante?.nome_completo,
      destinatario_nome: c.destinatario?.nome_completo,
    })));
  }
  
  // Filtrar apenas conexões ativas (aceitas)
  // Verificar tanto true quanto 1 (pode vir do backend como número) ou string "true"
  const acceptedConnections = safeConnections.filter(
    (conn) => {
      const aceitoValue = conn.aceito;
      const isAccepted = aceitoValue === true || aceitoValue === 1 || aceitoValue === 'true' || aceitoValue === '1';
      if (__DEV__) {
        console.log('NewContractScreen - Verificando conexão:', {
          id: conn.id,
          aceito: aceitoValue,
          tipo: typeof aceitoValue,
          isAccepted,
          solicitante_id: conn.solicitante_id,
          destinatario_id: conn.destinatario_id,
          tem_solicitante: !!conn.solicitante,
          tem_destinatario: !!conn.destinatario,
          solicitante_nome: conn.solicitante?.nome_completo,
          destinatario_nome: conn.destinatario?.nome_completo,
        });
      }
      return isAccepted;
    }
  );

  if (__DEV__) {
    console.log('NewContractScreen - Total de conexões:', safeConnections.length);
    console.log('NewContractScreen - Conexões ativas:', acceptedConnections.length);
    console.log('NewContractScreen - Conexões ativas detalhes:', acceptedConnections.map(c => ({
      id: c.id,
      aceito: c.aceito,
      solicitante_id: c.solicitante_id,
      destinatario_id: c.destinatario_id,
      solicitante_nome: c.solicitante?.nome_completo,
      destinatario_nome: c.destinatario?.nome_completo,
    })));
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.stakeHolderId) {
      newErrors.stakeHolderId = 'Selecione uma parte interessada';
    }
    if (!formData.contractTypeId) {
      newErrors.contractTypeId = 'Selecione um tipo de contrato';
    }
    if (!formData.validity || formData.validity <= 0) {
      newErrors.validity = 'Selecione a duração do contrato';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const api = new ApiProvider(true);
      // O endpoint espera participantes como array e clausulas como array
      // Por enquanto, vamos enviar apenas o participante e deixar o backend criar as cláusulas padrão
      const response = await api.post('contrato/gravar', {
        contratante_id: user?.id,
        participantes: formData.stakeHolderId ? [formData.stakeHolderId] : [],
        contrato_tipo_id: formData.contractTypeId,
        duracao: formData.validity,
        // dt_inicio e dt_fim serão calculados pelo backend quando o contrato for assinado
        clausulas: defaultClauses.length > 0 ? defaultClauses : [], // Cláusulas padrão do tipo de contrato
      });

      // Atualizar dados do usuário (inclusive lista de contratos) antes de voltar
      try {
        await refreshUserData();
      } catch (e) {
        console.warn('NewContractScreen - erro ao atualizar dados do usuário após criar contrato:', e);
      }

      Alert.alert('Sucesso', 'Contrato criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao criar contrato'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedContractType = contractTypes.find((t) => t.id === formData.contractTypeId);
  
  // Encontrar o usuário selecionado a partir das conexões
  const selectedConnection = acceptedConnections.find((conn) => {
    const otherUser = conn.solicitante_id === user?.id ? conn.destinatario : conn.solicitante;
    return otherUser?.id === formData.stakeHolderId;
  });
  const selectedStakeHolder = selectedConnection 
    ? (selectedConnection.solicitante_id === user?.id ? selectedConnection.destinatario : selectedConnection.solicitante)
    : undefined;

  return (
    <CustomScaffold 
      title="Novo Contrato"
      showBackButton={true}
      showProfileButton={true}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <HeaderLine title="Criação de Contrato" icon="document-text" />

        <FormConnectionSelect
          label="Parte Interessada"
          value={formData.stakeHolderId || undefined}
          connections={acceptedConnections}
          currentUserId={user?.id}
          onChange={(userId) => setFormData({ ...formData, stakeHolderId: userId })}
          error={errors.stakeHolderId}
          required
          placeholder="Selecione uma conexão ativa"
        />

        {contractTypes.length > 0 ? (
          <FormSelect
            label="Tipo de Contrato"
            value={formData.contractTypeId || undefined}
            options={contractTypes.map((t) => ({
              label: t.descricao || t.codigo || `Tipo ${t.id}`,
              value: t.id,
            }))}
            onChange={(value) => setFormData({ ...formData, contractTypeId: value })}
            error={errors.contractTypeId}
            required
            placeholder="Selecione um tipo"
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Carregando tipos de contrato...</Text>
          </View>
        )}

        <FormSelect
          label="Duração do Contrato"
          value={formData.validity || undefined}
          options={durationOptions}
          onChange={(value) => setFormData({ ...formData, validity: value })}
          error={errors.validity}
          required
          placeholder="Selecione a duração"
        />
        
        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>
            O contrato começará a contar a partir do momento em que for assinado por todas as partes
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.buttonTextSecondary}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={CustomColors.white} />
            ) : (
              <Text style={styles.buttonTextPrimary}>Criar Contrato</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </CustomScaffold>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonPrimary: {
    backgroundColor: CustomColors.activeColor,
  },
  buttonSecondary: {
    backgroundColor: CustomColors.white,
    borderWidth: 1,
    borderColor: CustomColors.activeColor,
  },
  buttonTextPrimary: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: CustomColors.activeColor,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  emptyText: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
  helperTextContainer: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    lineHeight: 16,
  },
});

export default NewContractScreen;
