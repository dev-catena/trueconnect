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
import FormInput from '../../../components/forms/FormInput';
import FormConnectionSelectMulti from '../../../components/forms/FormConnectionSelectMulti';
import { useUser } from '../../../core/context/UserContext';
import { User, ContractType, Connection } from '../../../types';
import ApiProvider from '../../../core/api/ApiProvider';
import SafeIcon from '../../../components/SafeIcon';

type NewContractScreenNavigationProp = NativeStackNavigationProp<
  ContractsStackParamList | HomeStackParamList,
  'NewContract'
>;

type ValidityUnit = 'horas' | 'dias' | 'meses';

interface NewContractFormData {
  stakeHolderIds: number[];
  contractTypeId: number | null;
  validityValue: string; // Valor numérico livre
  validityUnit: ValidityUnit;
}

const NewContractScreen: React.FC = () => {
  const navigation = useNavigation<NewContractScreenNavigationProp>();
  const { connections, user, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<NewContractFormData>({
    stakeHolderIds: [],
    contractTypeId: null,
    validityValue: '24',
    validityUnit: 'horas',
  });

  const validityUnitOptions: { label: string; value: ValidityUnit }[] = [
    { label: 'Horas', value: 'horas' },
    { label: 'Dias', value: 'dias' },
    { label: 'Meses', value: 'meses' },
  ];
  const [defaultClauses, setDefaultClauses] = useState<number[]>([]);

  useEffect(() => {
    loadContractTypes();
  }, []);
  // Conexões vêm do UserContext (carregado no app + WebSocket) - evitar refreshUserData aqui para não causar loop

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

  const validityToHours = (): number => {
    const v = parseFloat(formData.validityValue?.replace(',', '.') || '0');
    const n = Math.floor(v);
    if (n <= 0) return 0;
    switch (formData.validityUnit) {
      case 'horas':
        return n;
      case 'dias':
        return n * 24;
      case 'meses':
        return n * 24 * 30;
      default:
        return n;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.stakeHolderIds || formData.stakeHolderIds.length === 0) {
      newErrors.stakeHolderIds = 'Selecione pelo menos uma parte interessada';
    }
    if (!formData.contractTypeId) {
      newErrors.contractTypeId = 'Selecione um tipo de contrato';
    }
    const hours = validityToHours();
    if (!hours || hours <= 0) {
      newErrors.validity = 'Informe a duração do contrato (número maior que zero)';
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
        participantes: formData.stakeHolderIds || [],
        contrato_tipo_id: formData.contractTypeId,
        duracao: validityToHours(),
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

  return (
    <CustomScaffold 
      title="Novo Contrato"
      showBackButton={true}
      showProfileButton={true}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <HeaderLine title="Criação de Contrato" icon="document-text" />

        <FormConnectionSelectMulti
          label="Partes Interessadas"
          value={formData.stakeHolderIds}
          connections={acceptedConnections}
          currentUserId={user?.id}
          onChange={(userIds) => setFormData({ ...formData, stakeHolderIds: userIds })}
          error={errors.stakeHolderIds}
          required
          placeholder="Selecione as partes interessadas (conexões ativas)"
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

        <View style={styles.validityRow}>
          <View style={styles.validityInputWrap}>
            <FormInput
              label="Duração do Contrato"
              value={formData.validityValue}
              onChangeText={(text) => setFormData({ ...formData, validityValue: text.replace(/[^0-9,]/g, '') })}
              keyboardType="numeric"
              placeholder="Ex: 24"
              error={errors.validity}
              required
            />
          </View>
          <View style={styles.validityUnitWrap}>
            <FormSelect
              label="Unidade"
              value={formData.validityUnit}
              options={validityUnitOptions}
              onChange={(value) => setFormData({ ...formData, validityUnit: value as ValidityUnit })}
              placeholder="Unidade"
            />
          </View>
        </View>
        
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
  validityRow: {
    flexDirection: 'row',
    gap: 16,
  },
  validityInputWrap: {
    flex: 1,
  },
  validityUnitWrap: {
    flex: 1,
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
