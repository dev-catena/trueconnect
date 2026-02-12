import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ContractsStackParamList, HomeStackParamList } from '../../../types/navigation';
import { CustomColors } from '../../../core/colors';
import CustomScaffold from '../../../components/CustomScaffold';
import HeaderLine from '../../../components/HeaderLine';
import SafeIcon from '../../../components/SafeIcon';
import SignatureCountdown from '../../../components/SignatureCountdown';
import { Contract, Clause } from '../../../types';
import { formatDate, formatDateTime } from '../../../utils/dateParser';
import ApiProvider from '../../../core/api/ApiProvider';
import { useUser } from '../../../core/context/UserContext';

type ContractDetailScreenRouteProp = RouteProp<ContractsStackParamList | HomeStackParamList, 'ContractDetail'>;
type ContractDetailScreenNavigationProp = NativeStackNavigationProp<
  ContractsStackParamList | HomeStackParamList,
  'ContractDetail'
>;

interface Props {
  route: ContractDetailScreenRouteProp;
}

const ContractDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<ContractDetailScreenNavigationProp>();
  const { contract: initialContract } = route.params;
  const { refreshUserData, user } = useUser();
  const [contract, setContract] = useState<Contract>(initialContract);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClauses, setIsLoadingClauses] = useState(false);
  const [updatingClause, setUpdatingClause] = useState<number | null>(null);

  // Carregar dados completos do contrato uma vez ao abrir a tela
  useEffect(() => {
    loadContractDetails();
    // Não manter polling contínuo para evitar loop de requisições;
    // atualizações pontuais já são feitas após cada ação (aprovar/rejeitar/assinar).
  }, [initialContract.id]);

  const loadContractDetails = async () => {
    setIsLoadingClauses(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get(`contrato/buscar-completo/${initialContract.id}`);
      if (response && response.result) {
        setContract(response.result as Contract);
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do contrato:', error);
    } finally {
      setIsLoadingClauses(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return CustomColors.successGreen;
      case 'Pendente':
        return CustomColors.pendingYellow;
      case 'Concluído':
        return CustomColors.activeGreyed;
      case 'Expirado':
        return CustomColors.vividRed;
      default:
        return CustomColors.activeGreyed;
    }
  };

  const handleSetClause = async (clause: Clause, aceito: boolean) => {
    const aceitoValue = aceito ? 1 : 0;
    
    setUpdatingClause(clause.id);
    try {
      const api = new ApiProvider(true);
      await api.post('contrato/clausula/aceitar', [{
        contrato_id: contract.id,
        clausula_id: clause.id,
        aceito: aceitoValue,
      }]);
      
      // Atualizar estado local otimisticamente
      if (user) {
        setContract((prev) => {
          if (!prev || !prev.clausulas) return prev;
          const updatedClausulas = prev.clausulas.map((c) => {
            if (c.id !== clause.id) return c;

            const aceito_por = Array.isArray(c.aceito_por) ? [...c.aceito_por] : [];
            const recusado_por = Array.isArray(c.recusado_por) ? [...c.recusado_por] : [];
            const pendente_para = Array.isArray(c.pendente_para) ? [...c.pendente_para] : [];

            const userId = user.id;
            const removeUser = (arr: number[]) => arr.filter((id) => id !== userId);

            let novaAceitoPor = removeUser(aceito_por);
            let novaRecusadoPor = removeUser(recusado_por);
            let novaPendentePara = removeUser(pendente_para);

            if (aceitoValue === 1) {
              novaAceitoPor = [...novaAceitoPor, userId];
            } else if (aceitoValue === 0) {
              novaRecusadoPor = [...novaRecusadoPor, userId];
            }

            return {
              ...c,
              aceito_por: novaAceitoPor,
              recusado_por: novaRecusadoPor,
              pendente_para: novaPendentePara,
            };
          });

          return {
            ...prev,
            clausulas: updatedClausulas,
          };
        });
      }
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao atualizar cláusula');
      // Recarregar em caso de erro para garantir sincronização
      await loadContractDetails();
    } finally {
      setUpdatingClause(null);
    }
  };

  const handleAcceptContract = async () => {
    setIsLoading(true);
    try {
      const api = new ApiProvider(true);
      await api.post(`contrato/${contract.id}/aceitar`, { aceito: true });
      Alert.alert('Sucesso', 'Contrato assinado com sucesso!');
      await refreshUserData();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao assinar contrato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectContract = async () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja rejeitar este contrato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.post(`contrato/${contract.id}/rejeitar`, { aceito: false });
              Alert.alert('Sucesso', 'Contrato rejeitado');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao rejeitar contrato');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteContract = async () => {
    Alert.alert(
      'Excluir Contrato',
      'Tem certeza que deseja excluir este contrato? Ele será removido apenas da sua lista.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.delete(`contrato/excluir/${contract.id}`);
              Alert.alert('Sucesso', 'Contrato excluído da sua lista');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao excluir contrato');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const isPending = contract.status === 'Pendente';
  const isSigningExpired =
    !!contract.dt_prazo_assinatura &&
    new Date(contract.dt_prazo_assinatura).getTime() < Date.now();
  const isParticipant =
    contract.participantes?.some(
      (p) =>
        Number(p.usuario_id) === Number(user?.id) ||
        Number((p as any).usuario?.id) === Number(user?.id)
    ) || Number(contract.contratante_id) === Number(user?.id);

  // Verificar se o usuário já aprovou uma cláusula específica (true=concordo, false=discordo, null=pendente)
  const isClauseApprovedByUser = (clause: Clause): boolean | null => {
    if (!user) return null;
    if (Array.isArray(clause.aceito_por) && clause.aceito_por.includes(user.id)) return true;
    if (Array.isArray(clause.recusado_por) && clause.recusado_por.includes(user.id)) return false;
    return null; // Pendente
  };

  // Obter todos os participantes do contrato (contratante + participantes)
  const getAllParticipants = () => {
    const participants: Array<{ id: number; nome: string; isCurrentUser: boolean }> = [];
    const addedIds = new Set<number>(); // Para evitar duplicatas
    
    if (!user) return participants;

    // Adicionar contratante
    if (contract.contratante && contract.contratante.id) {
      const contratanteId = contract.contratante.id;
      if (!addedIds.has(contratanteId)) {
        const isCurrentUser = Number(contract.contratante_id) === Number(user.id);
        participants.push({
          id: contratanteId,
          nome: contract.contratante.nome_completo || contract.contratante.name || 'Contratante',
          isCurrentUser: isCurrentUser,
        });
        addedIds.add(contratanteId);
      }
    }

    // Fallback: se contratante não veio no objeto mas o usuário é o contratante
    if (!addedIds.has(user.id) && Number(contract.contratante_id) === Number(user.id)) {
      participants.push({
        id: user.id,
        nome: user.nome_completo || user.name || 'Você',
        isCurrentUser: true,
      });
      addedIds.add(user.id);
    }
    
    // Adicionar participantes - suporta múltiplas estruturas possíveis
    if (contract.participantes && Array.isArray(contract.participantes)) {
      contract.participantes.forEach((p: any) => {
        // Tentar diferentes estruturas possíveis
        let participanteId: number | undefined;
        let nome: string | undefined;
        
        // Estrutura 1: { usuario_id, usuario: { id, nome_completo } }
        if (p.usuario_id && p.usuario) {
          participanteId = p.usuario_id;
          nome = p.usuario.nome_completo || p.usuario.name;
        }
        // Estrutura 2: { id, nome_completo } (diretamente)
        else if (p.id) {
          participanteId = p.id;
          nome = p.nome_completo || p.name;
        }
        // Estrutura 3: { usuario: { id, nome_completo } }
        else if (p.usuario && p.usuario.id) {
          participanteId = p.usuario.id;
          nome = p.usuario.nome_completo || p.usuario.name;
        }
        
        if (participanteId && !addedIds.has(participanteId)) {
          const isCurrentUser = Number(participanteId) === Number(user.id);
          participants.push({
            id: participanteId,
            nome: nome || 'Participante',
            isCurrentUser: isCurrentUser,
          });
          addedIds.add(participanteId);
        }
      });
    }

    // Ordenar: usuário logado primeiro, depois os outros
    participants.sort((a, b) => {
      if (a.isCurrentUser && !b.isCurrentUser) return -1;
      if (!a.isCurrentUser && b.isCurrentUser) return 1;
      return 0;
    });

    return participants;
  };

  // Verificar status de aprovação de uma cláusula por um usuário específico
  const getClauseStatusByUserId = (clause: Clause, userId: number): boolean | null => {
    if (!Array.isArray(clause.aceito_por)) return null;
    if (clause.aceito_por.includes(userId)) return true;
    if (Array.isArray(clause.recusado_por) && clause.recusado_por.includes(userId)) return false;
    return null; // Pendente
  };

  // Verificar se pode editar (até assinatura)
  const canEditClause = (): boolean => {
    return isPending && isParticipant && !contract.pode_assinar;
  };

  // Verificar se uma cláusula está em desacordo
  const isClauseInDisagreement = (clause: Clause): boolean => {
    if (!contract.clausulas_em_desacordo) return false;
    return contract.clausulas_em_desacordo.includes(clause.id);
  };

  // Verificar se uma cláusula está coincidente (todos aprovaram ou todos rejeitaram)
  const isClauseCoincident = (clause: Clause): boolean => {
    if (!contract.participantes) {
      return false;
    }
    
    // Total de participantes (incluindo contratante)
    const totalParticipants = contract.participantes.length + 1;
    
    // Contar aprovações e rejeições
    const totalAprovacoes = clause.aceito_por?.length || 0;
    const totalRejeicoes = clause.recusado_por?.length || 0;
    const totalPendentes = clause.pendente_para?.length || 0;
    const totalRespostas = totalAprovacoes + totalRejeicoes;
    
    // Se nem todos responderam, não está coincidente
    if (totalRespostas < totalParticipants || totalPendentes > 0) {
      return false;
    }
    
    // Está coincidente se todos aprovaram OU todos rejeitaram
    return totalAprovacoes === totalParticipants || totalRejeicoes === totalParticipants;
  };

  // Gerar cabeçalho do contrato com as partes
  const getContractHeader = (): string => {
    // Parte A: Contratante
    const nomeParteA = contract.contratante?.nome_completo || contract.contratante?.name;
    
    // Parte B: Participantes
    let nomesParteB: string[] = [];
    if (contract.participantes && contract.participantes.length > 0) {
      nomesParteB = contract.participantes
        .map(p => p.usuario?.nome_completo || p.usuario?.name)
        .filter((nome): nome is string => Boolean(nome && nome !== 'N/A'));
    }
    
    // Montar o texto do cabeçalho
    if (nomeParteA && nomesParteB.length > 0) {
      // Formatar nomes da Parte B
      let parteBTexto = '';
      if (nomesParteB.length === 1) {
        parteBTexto = `"${nomesParteB[0]}"`;
      } else {
        const ultimoNome = nomesParteB[nomesParteB.length - 1];
        const outrosNomes = nomesParteB.slice(0, -1).join('", "');
        parteBTexto = `"${outrosNomes}" e "${ultimoNome}"`;
      }
      
      return `Contrato que entre si celebram "${nomeParteA}" doravante designado Parte A e ${parteBTexto}, doravante designada Parte B acordando o seguinte:`;
    } else if (nomeParteA) {
      return `Contrato que entre si celebram "${nomeParteA}" doravante designado Parte A acordando o seguinte:`;
    } else if (nomesParteB.length > 0) {
      const parteBTexto = nomesParteB.length === 1 
        ? `"${nomesParteB[0]}"`
        : `"${nomesParteB.join('", "')}"`;
      return `Contrato que entre si celebram ${parteBTexto} doravante designada Parte B acordando o seguinte:`;
    }
    
    return 'Contrato que entre si celebram as partes acordando o seguinte:';
  };

  return (
    <CustomScaffold title="Detalhes do Contrato">
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
          <Text style={styles.contractCode}>{contract.codigo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) + '33' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
              {contract.status}
            </Text>
          </View>
        </View>

        {isPending && contract.dt_prazo_assinatura && (
          <SignatureCountdown dtPrazoAssinatura={contract.dt_prazo_assinatura} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{contract.tipo?.descricao || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duração:</Text>
            <Text style={styles.infoValue}>{contract.duracao} horas</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Início:</Text>
            <Text style={styles.infoValue}>{formatDate(contract.dt_inicio)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Término:</Text>
            <Text style={styles.infoValue}>{formatDate(contract.dt_fim)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contratante</Text>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              {contract.contratante?.caminho_foto ? (
                <Image
                  source={{ uri: contract.contratante.caminho_foto }}
                  style={styles.avatarImage}
                />
              ) : (
                <SafeIcon
                  name="account"
                  size={28}
                  color={CustomColors.white}
                />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {contract.contratante?.nome_completo || contract.contratante?.name || 'N/A'}
              </Text>
              <Text style={styles.userEmail}>{contract.contratante?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {contract.participantes && contract.participantes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participantes</Text>
            {contract.participantes.map((participant, index) => (
              <View key={index} style={styles.userCard}>
                <View style={styles.avatar}>
                  {participant.usuario?.caminho_foto ? (
                    <Image
                      source={{ uri: participant.usuario.caminho_foto }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <SafeIcon
                      name="account"
                      size={28}
                      color={CustomColors.white}
                    />
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {participant.usuario?.nome_completo || participant.usuario?.name || 'N/A'}
                  </Text>
                  <Text style={styles.userEmail}>{participant.usuario?.email || 'N/A'}</Text>
                  {participant.aceito !== null && (
                    <View style={styles.acceptanceStatusContainer}>
                      <SafeIcon
                        name={participant.aceito ? 'check' : 'close'}
                        size={14}
                        color={participant.aceito ? CustomColors.successGreen : CustomColors.vividRed}
                      />
                      <Text style={[styles.acceptanceStatus, { color: participant.aceito ? CustomColors.successGreen : CustomColors.vividRed }]}>
                        {participant.aceito ? ' Aceito' : ' Rejeitado'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {contract.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{contract.descricao}</Text>
          </View>
        )}

        {/* Seção de Cláusulas */}
        {contract.clausulas && contract.clausulas.length > 0 && (
          <View style={styles.section}>
            {/* Cabeçalho do Contrato - acima do título, não é cláusula */}
            <View style={styles.contractHeader}>
              <Text style={styles.contractHeaderText}>
                {getContractHeader()}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Cláusulas do Contrato</Text>
            
            {isLoadingClauses ? (
              <ActivityIndicator size="small" color={CustomColors.activeColor} />
            ) : (
              contract.clausulas.map((clause, index) => {
                const userApprovalStatus = isClauseApprovedByUser(clause);
                const canEdit = canEditClause();
                const inDisagreement = isClauseInDisagreement(clause);

                return (
                  <View 
                    key={clause.id || index} 
                    style={[
                      styles.clauseCard,
                      inDisagreement && styles.clauseCardDisagreement
                    ]}
                  >
                    <View style={styles.clauseHeader}>
                      <View style={styles.clauseTitleRow}>
                        <Text style={styles.clauseCode}>{clause.codigo}</Text>
                        <Text style={styles.clauseName}>{clause.nome}</Text>
                      </View>
                    </View>
                    <Text style={styles.clauseDescription}>{clause.descricao}</Text>
                    
                    {/* Lista de participantes com seus ícones de aprovação - sempre visível */}
                    <View style={styles.clauseParticipantsList}>
                      {getAllParticipants().map((participant) => {
                        const participantStatus = getClauseStatusByUserId(clause, participant.id);
                        const isMyStatus = participant.isCurrentUser;
                        const isUpdatingMyClause = isMyStatus && updatingClause === clause.id;

                        const checkboxStyle = [
                          styles.clauseCheckbox,
                          participantStatus === true && styles.clauseCheckboxChecked,
                          participantStatus === false && styles.clauseCheckboxRejected,
                          !isMyStatus && styles.clauseCheckboxReadOnly,
                          isUpdatingMyClause && styles.clauseIconButtonDisabled,
                        ];

                        return (
                          <View key={participant.id} style={styles.clauseParticipantRow}>
                            <View style={checkboxStyle}>
                              {isUpdatingMyClause ? (
                                <ActivityIndicator size="small" color={CustomColors.white} />
                              ) : (
                                <SafeIcon
                                  name={participantStatus === true ? "check" : participantStatus === false ? "close" : "remove"}
                                  size={18}
                                  color={
                                    participantStatus === true ? CustomColors.white :
                                    participantStatus === false ? CustomColors.white :
                                    CustomColors.activeGreyed
                                  }
                                />
                              )}
                            </View>
                            <Text style={styles.clauseParticipantName}>{participant.nome}</Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Botões Concordar/Discordar - apenas para o usuário logado em contrato pendente */}
                    {isPending &&
                      isParticipant &&
                      !isLoading && (
                        <View style={styles.clauseToggleButtons}>
                          <TouchableOpacity
                            style={[
                              styles.clauseToggleButton,
                              styles.clauseToggleConcordar,
                              userApprovalStatus === true && { backgroundColor: CustomColors.successGreen },
                            ]}
                            onPress={() => handleSetClause(clause, true)}
                            disabled={updatingClause === clause.id || isSigningExpired}
                          >
                            <SafeIcon
                              name="check"
                              size={20}
                              color={userApprovalStatus === true ? CustomColors.white : CustomColors.successGreen}
                            />
                            <Text
                              style={[
                                styles.clauseToggleButtonText,
                                { color: userApprovalStatus === true ? CustomColors.white : CustomColors.successGreen },
                              ]}
                            >
                              Concordar
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.clauseToggleButton,
                              styles.clauseToggleDiscordar,
                              userApprovalStatus === false && { backgroundColor: CustomColors.vividRed },
                            ]}
                            onPress={() => handleSetClause(clause, false)}
                            disabled={updatingClause === clause.id || isSigningExpired}
                          >
                            <SafeIcon
                              name="close"
                              size={20}
                              color={userApprovalStatus === false ? CustomColors.white : CustomColors.vividRed}
                            />
                            <Text
                              style={[
                                styles.clauseToggleButtonText,
                                { color: userApprovalStatus === false ? CustomColors.white : CustomColors.vividRed },
                              ]}
                            >
                              Discordar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    
                    {/* Indicador de desacordo */}
                    {inDisagreement && (
                      <View style={styles.disagreementIndicator}>
                        <SafeIcon name="alert-circle" size={16} color={CustomColors.pendingYellow} />
                        <Text style={styles.disagreementText}>
                          Há desacordo nesta cláusula. Todos devem concordar ou discordar para assinar o contrato.
                        </Text>
                      </View>
                    )}
                    
                    {/* Status visual quando não pode editar mais */}
                    {!canEdit && userApprovalStatus !== null && (
                      <View style={styles.clauseStatusView}>
                        <View style={[
                          styles.statusIndicator,
                          userApprovalStatus 
                            ? { backgroundColor: CustomColors.successGreen + '33' }
                            : { backgroundColor: CustomColors.vividRed + '33' }
                        ]}>
                          <SafeIcon
                            name={userApprovalStatus ? 'check' : 'close'}
                            size={16}
                            color={userApprovalStatus ? CustomColors.successGreen : CustomColors.vividRed}
                          />
                          <Text style={[
                            styles.statusIndicatorText,
                            { color: userApprovalStatus ? CustomColors.successGreen : CustomColors.vividRed }
                          ]}>
                            {userApprovalStatus ? ' Aprovada' : ' Rejeitada'}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Botão de Assinar - só aparece se todas as cláusulas foram aprovadas */}
        {isPending && isParticipant && contract.pode_assinar && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptContract}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Assinar Contrato</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Mensagem informativa se não pode assinar ainda */}
        {isPending && isParticipant && !contract.pode_assinar && (
          <View style={styles.infoBox}>
            <SafeIcon name="information" size={20} color={CustomColors.pendingYellow} />
            <Text style={styles.infoText}>
              {contract.clausulas_em_desacordo && contract.clausulas_em_desacordo.length > 0
                ? `Há ${contract.clausulas_em_desacordo.length} cláusula(s) em desacordo. Todos devem concordar ou discordar de cada cláusula para assinar o contrato.`
                : 'Todas as cláusulas devem estar coincidentes (todos devem aprovar ou todos devem rejeitar cada cláusula) antes de assinar o contrato.'}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteContract}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={CustomColors.white} />
            ) : (
              <>
                <SafeIcon name="trash" size={18} color={CustomColors.white} />
                <Text style={styles.actionButtonText}>Excluir Contrato</Text>
              </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  contractCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.black,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: CustomColors.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: CustomColors.black,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CustomColors.activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  acceptanceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  acceptanceStatus: {
    fontSize: 12,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: CustomColors.black,
    lineHeight: 20,
  },
  actions: {
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: CustomColors.successGreen,
  },
  rejectButton: {
    backgroundColor: CustomColors.vividRed,
  },
  deleteButton: {
    backgroundColor: CustomColors.vividRed,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  clauseCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: CustomColors.activeColor,
  },
  clauseCardDisagreement: {
    backgroundColor: CustomColors.pendingYellow + '15',
    borderLeftColor: CustomColors.pendingYellow,
    borderWidth: 1,
    borderColor: CustomColors.pendingYellow + '66',
  },
  disagreementIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: CustomColors.pendingYellow + '20',
    borderRadius: 6,
    gap: 6,
  },
  disagreementText: {
    flex: 1,
    fontSize: 12,
    color: CustomColors.pendingYellow,
    fontWeight: '500',
  },
  clauseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clauseTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clauseCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    marginRight: 8,
  },
  clauseName: {
    fontSize: 16,
    fontWeight: '600',
    color: CustomColors.black,
    flex: 1,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  clauseDescription: {
    fontSize: 14,
    color: CustomColors.black,
    lineHeight: 20,
    marginBottom: 12,
  },
  clauseParticipantsList: {
    marginTop: 12,
    gap: 8,
  },
  clauseParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
    marginBottom: 6,
  },
  clauseParticipantName: {
    fontSize: 15,
    fontWeight: '500',
    color: CustomColors.black,
    flex: 1,
  },
  clauseCheckbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: CustomColors.activeGreyed,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clauseToggleButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  clauseToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 2,
  },
  clauseToggleConcordar: {
    borderColor: CustomColors.successGreen,
    backgroundColor: 'transparent',
  },
  clauseToggleDiscordar: {
    borderColor: CustomColors.vividRed,
    backgroundColor: 'transparent',
  },
  clauseToggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  clauseCheckboxChecked: {
    backgroundColor: CustomColors.successGreen,
    borderColor: CustomColors.successGreen,
  },
  clauseCheckboxRejected: {
    backgroundColor: CustomColors.vividRed,
    borderColor: CustomColors.vividRed,
  },
  clauseCheckboxReadOnly: {
    opacity: 0.7,
  },
  clauseIconButtonDisabled: {
    opacity: 0.5,
  },
  clauseStatusView: {
    marginTop: 12,
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: CustomColors.pendingYellow + '33',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: CustomColors.black,
  },
  contractHeader: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    borderRadius: 8,
  },
  contractHeaderText: {
    fontSize: 15,
    color: CustomColors.black,
    lineHeight: 22,
    textAlign: 'justify',
    fontWeight: '500',
  },
});

export default ContractDetailScreen;
