import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import FormInput from '../../../components/forms/FormInput';
import FormDatePicker from '../../../components/forms/FormDatePicker';
import FormSelect from '../../../components/forms/FormSelect';
import { CpfValidator } from '../../../utils/cpfValidator';
import { formatCPF, formatCEP } from '../../../utils/formatters';
import { buscarCEP } from '../../../utils/cepService';
import ApiProvider from '../../../core/api/ApiProvider';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterFormData {
  nome_completo: string;
  CPF: string;
  email: string;
  dt_nascimento: Date | null;
  password: string;
  password_confirmation: string;
  cep: string;
  endereco: string;
  endereco_numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  profissao: string;
  renda_classe: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailExists, setEmailExists] = useState(false);
  const [cpfExists, setCpfExists] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    nome_completo: '',
    CPF: '',
    email: '',
    dt_nascimento: null,
    password: '',
    password_confirmation: '',
    cep: '',
    endereco: '',
    endereco_numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    profissao: '',
    renda_classe: '',
  });

  const totalSteps = 5;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Confirmação de idade
        if (!formData.dt_nascimento) {
          newErrors.dt_nascimento = 'Data de nascimento é obrigatória';
        } else {
          const age = new Date().getFullYear() - formData.dt_nascimento.getFullYear();
          if (age < 18) {
            newErrors.dt_nascimento = 'Você deve ter pelo menos 18 anos';
          }
        }
        break;

      case 1: // Dados pessoais
        if (!formData.nome_completo.trim()) {
          newErrors.nome_completo = 'Nome completo é obrigatório';
        }
        if (!formData.CPF.trim()) {
          newErrors.CPF = 'CPF é obrigatório';
        } else if (!CpfValidator.validarCPF(formData.CPF)) {
          newErrors.CPF = 'CPF inválido';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email é obrigatório';
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
          newErrors.email = 'Email inválido';
        }
        if (emailExists) {
          newErrors.email = 'Este email já está cadastrado';
        }
        if (cpfExists) {
          newErrors.CPF = 'Este CPF já está cadastrado';
        }
        break;

      case 2: // Endereço
        if (!formData.cep.trim()) {
          newErrors.cep = 'CEP é obrigatório';
        }
        if (!formData.endereco.trim()) {
          newErrors.endereco = 'Endereço é obrigatório';
        }
        if (!formData.endereco_numero.trim()) {
          newErrors.endereco_numero = 'Número é obrigatório';
        }
        if (!formData.bairro.trim()) {
          newErrors.bairro = 'Bairro é obrigatório';
        }
        if (!formData.cidade.trim()) {
          newErrors.cidade = 'Cidade é obrigatória';
        }
        if (!formData.estado.trim()) {
          newErrors.estado = 'Estado é obrigatório';
        }
        break;

      case 3: // Informações complementares
        // Opcional, não precisa validação
        break;

      case 4: // Senha
        if (!formData.password.trim()) {
          newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
        }
        if (!formData.password_confirmation.trim()) {
          newErrors.password_confirmation = 'Confirmação de senha é obrigatória';
        } else if (formData.password !== formData.password_confirmation) {
          newErrors.password_confirmation = 'Senhas não coincidem';
        }
        break;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    // Se houver erros, mostrar o primeiro
    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      if (firstError) {
        Alert.alert('Erro de Validação', firstError);
      }
    }
    
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const api = new ApiProvider(false);
      const response = await api.post('auth/register', {
        nome_completo: formData.nome_completo,
        CPF: formData.CPF.replace(/\D/g, ''),
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        dt_nascimento: formData.dt_nascimento?.toISOString(),
        cep: formData.cep,
        endereco: formData.endereco,
        endereco_numero: formData.endereco_numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        pais: formData.pais,
        profissao: formData.profissao,
        renda_classe: formData.renda_classe,
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? 
                            Object.values(error.response.data.errors).flat().join('\n') : 
                            'Erro ao realizar cadastro');
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailExists = async (email: string) => {
    // TODO: Implementar verificação de email existente
  };

  const checkCpfExists = async (cpf: string) => {
    // TODO: Implementar verificação de CPF existente
  };

  const handleCepBlur = async () => {
    const cleanCEP = formData.cep.replace(/\D/g, '');
    
    // Só busca se o CEP tiver 8 dígitos
    if (cleanCEP.length === 8) {
      setIsLoading(true);
      try {
        const cepData = await buscarCEP(cleanCEP);
        
        if (cepData) {
          setFormData({
            ...formData,
            endereco: cepData.logradouro || '',
            bairro: cepData.bairro || '',
            cidade: cepData.localidade || '',
            estado: cepData.uf || '',
          });
        } else {
          Alert.alert('CEP não encontrado', 'Por favor, verifique o CEP digitado e preencha os campos manualmente.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar o CEP. Por favor, preencha os campos manualmente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>Confirmação de Idade</Text>
            <Text style={styles.stepDescription}>
              Você precisa ter pelo menos 18 anos para se cadastrar
            </Text>
            <FormDatePicker
              label="Data de Nascimento"
              value={formData.dt_nascimento || undefined}
              onChange={(date) => setFormData({ ...formData, dt_nascimento: date })}
              error={errors.dt_nascimento}
              required
              maximumDate={new Date()}
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Dados Pessoais</Text>
            <FormInput
              label="Nome Completo"
              value={formData.nome_completo}
              onChangeText={(text) => setFormData({ ...formData, nome_completo: text })}
              error={errors.nome_completo}
              required
            />
            <FormInput
              label="CPF"
              value={formatCPF(formData.CPF)}
              onChangeText={(text) => {
                const cpf = text.replace(/\D/g, '');
                setFormData({ ...formData, CPF: cpf });
                if (CpfValidator.validarCPF(cpf)) {
                  checkCpfExists(cpf);
                }
              }}
              error={errors.CPF}
              required
              keyboardType="numeric"
              maxLength={14}
            />
            <FormInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(text)) {
                  checkEmailExists(text);
                }
              }}
              error={errors.email}
              required
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Endereço</Text>
            <FormInput
              label="CEP"
              value={formatCEP(formData.cep)}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                setFormData({ ...formData, cep: cleaned });
              }}
              onBlur={handleCepBlur}
              error={errors.cep}
              required
              keyboardType="numeric"
              maxLength={9}
            />
            <FormInput
              label="Endereço"
              value={formData.endereco}
              onChangeText={(text) => setFormData({ ...formData, endereco: text })}
              error={errors.endereco}
              required
            />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Número"
                  value={formData.endereco_numero}
                  onChangeText={(text) => setFormData({ ...formData, endereco_numero: text })}
                  error={errors.endereco_numero}
                  required
                />
              </View>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Complemento"
                  value={formData.complemento}
                  onChangeText={(text) => setFormData({ ...formData, complemento: text })}
                />
              </View>
            </View>
            <FormInput
              label="Bairro"
              value={formData.bairro}
              onChangeText={(text) => setFormData({ ...formData, bairro: text })}
              error={errors.bairro}
              required
            />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Cidade"
                  value={formData.cidade}
                  onChangeText={(text) => setFormData({ ...formData, cidade: text })}
                  error={errors.cidade}
                  required
                />
              </View>
              <View style={styles.halfWidth}>
                <FormInput
                  label="Estado"
                  value={formData.estado}
                  onChangeText={(text) => setFormData({ ...formData, estado: text })}
                  error={errors.estado}
                  required
                />
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Informações Complementares</Text>
            <View style={{ marginBottom: 16, zIndex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: CustomColors.black }}>
                Profissão
              </Text>
              <TextInput
                value={formData.profissao}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, profissao: text }));
                }}
                placeholder="Digite sua profissão"
                placeholderTextColor={CustomColors.activeGreyed}
                autoCapitalize="words"
                returnKeyType="done"
                editable={true}
                keyboardType="default"
                autoCorrect={false}
                autoComplete="off"
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: CustomColors.white,
                  minHeight: 48,
                  zIndex: 2,
                }}
              />
            </View>
            <FormSelect
              label="Renda"
              value={formData.renda_classe}
              options={[
                { label: 'Até R$ 1.000', value: 'A' },
                { label: 'R$ 1.000 - R$ 2.000', value: 'B' },
                { label: 'R$ 2.000 - R$ 5.000', value: 'C' },
                { label: 'R$ 5.000 - R$ 10.000', value: 'D' },
                { label: 'Acima de R$ 10.000', value: 'E' },
              ]}
              onChange={(value) => setFormData({ ...formData, renda_classe: value })}
            />
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Senha</Text>
            <FormInput
              label="Senha"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              required
              secureTextEntry
            />
            <FormInput
              label="Confirmar Senha"
              value={formData.password_confirmation}
              onChangeText={(text) => setFormData({ ...formData, password_confirmation: text })}
              error={errors.password_confirmation}
              required
              secureTextEntry
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>TrueConnect</Text>
        <Text style={styles.subtitle}>Cadastro - Passo {currentStep + 1} de {totalSteps}</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handlePrevious}
          disabled={isLoading}
        >
          <Text style={styles.buttonTextSecondary}>
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={CustomColors.white} />
          ) : (
            <Text style={styles.buttonTextPrimary}>
              {currentStep === totalSteps - 1 ? 'Finalizar' : 'Próximo'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: CustomColors.activeGreyed,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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

export default RegisterScreen;
