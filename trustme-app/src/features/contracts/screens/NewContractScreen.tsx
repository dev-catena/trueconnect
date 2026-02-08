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
import { ContractsStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import FormInput from '../../../components/forms/FormInput';
import FormDatePicker from '../../../components/forms/FormDatePicker';
import FormSelect from '../../../components/forms/FormSelect';
import { useUser } from '../../../core/context/UserContext';
import { User, ContractType, Connection } from '../../../types';
import ApiProvider from '../../../core/api/ApiProvider';

type NewContractScreenNavigationProp = NativeStackNavigationProp<
  ContractsStackParamList,
  'NewContract'
>;

interface NewContractFormData {
  stakeHolderId: number | null;
  contractTypeId: number | null;
  validity: number;
  startDate: Date | null;
  endDate: Date | null;
}

const NewContractScreen: React.FC = () => {
  const navigation = useNavigation<NewContractScreenNavigationProp>();
  const { connections, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<NewContractFormData>({
    stakeHolderId: null,
    contractTypeId: null,
    validity: 24,
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    loadContractTypes();
  }, []);

  const loadContractTypes = async () => {
    try {
      const api = new ApiProvider(true);
      const response = await api.get<{ result: ContractType[] }>('contrato/tipos');
      setContractTypes(response.result || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de contrato:', error);
    }
  };

  // Garantir que connections é um array válido
  const safeConnections = connections && Object.prototype.toString.call(connections) === '[object Array]' 
    ? connections 
    : [];
  
  const acceptedConnections = safeConnections.filter(
    (conn) => conn.aceito === true
  );

  const availableUsers = acceptedConnections.map((conn) => {
    const otherUser = conn.solicitante_id === user?.id ? conn.destinatario : conn.solicitante;
    return otherUser;
  }).filter((u): u is User => u !== undefined);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.stakeHolderId) {
      newErrors.stakeHolderId = 'Selecione uma parte interessada';
    }
    if (!formData.contractTypeId) {
      newErrors.contractTypeId = 'Selecione um tipo de contrato';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Selecione a data de início';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Selecione a data de término';
    }
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'Data de término deve ser posterior à data de início';
    }
    if (formData.validity <= 0) {
      newErrors.validity = 'Duração deve ser maior que zero';
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
      const response = await api.post('contrato/criar', {
        contratante_id: user?.id,
        participante_id: formData.stakeHolderId,
        contrato_tipo_id: formData.contractTypeId,
        duracao: formData.validity,
        dt_inicio: formData.startDate?.toISOString(),
        dt_fim: formData.endDate?.toISOString(),
      });

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

  const selectedStakeHolder = availableUsers.find((u) => u.id === formData.stakeHolderId);
  const selectedContractType = contractTypes.find((t) => t.id === formData.contractTypeId);

  return (
    <CustomScaffold title="Novo Contrato">
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <HeaderLine title="Criação de Contrato" icon="📝" />

        <FormSelect
          label="Parte Interessada"
          value={formData.stakeHolderId || undefined}
          options={availableUsers.map((u) => ({
            label: u.nome_completo || u.name || 'Usuário',
            value: u.id,
          }))}
          onChange={(value) => setFormData({ ...formData, stakeHolderId: value })}
          error={errors.stakeHolderId}
          required
          placeholder="Selecione uma pessoa"
        />

        <FormSelect
          label="Tipo de Contrato"
          value={formData.contractTypeId || undefined}
          options={contractTypes.map((t) => ({
            label: t.descricao,
            value: t.id,
          }))}
          onChange={(value) => setFormData({ ...formData, contractTypeId: value })}
          error={errors.contractTypeId}
          required
          placeholder="Selecione um tipo"
        />

        <FormInput
          label="Duração do Contrato (horas)"
          value={formData.validity.toString()}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num > 0) {
              setFormData({ ...formData, validity: num });
            } else if (text === '') {
              setFormData({ ...formData, validity: 0 });
            }
          }}
          error={errors.validity}
          required
          keyboardType="numeric"
        />

        <FormDatePicker
          label="Data de Início"
          value={formData.startDate || undefined}
          onChange={(date) => setFormData({ ...formData, startDate: date })}
          error={errors.startDate}
          required
          minimumDate={new Date()}
        />

        <FormDatePicker
          label="Data de Término"
          value={formData.endDate || undefined}
          onChange={(date) => setFormData({ ...formData, endDate: date })}
          error={errors.endDate}
          required
          minimumDate={formData.startDate || new Date()}
        />

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
});

export default NewContractScreen;
