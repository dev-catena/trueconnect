import React, { useState, useEffect, useCallback } from 'react';
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
import { RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { webSocketService } from '../../../core/services/WebSocketService';

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

  // Carregar dados ao abrir e ao voltar (debounce para evitar loop com useFocusEffect)
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => loadContractDetails(), 300);
      return () => clearTimeout(t);
    }, [initialContract.id])
  );

  // Quando contrato é atualizado (revogação, participante removido, etc.) - recarregar detalhes
  useEffect(() => {
    const unsub = webSocketService.on('contrato.atualizado', (data: { id?: number; status?: string; acao?: string }) => {
      if (data?.id === initialContract.id) {
        const acoesQueRequeremReload = ['participante_removido', 'revogacao_retorno_pendente'];
        if (data?.status === 'Pendente' || acoesQueRequeremReload.includes(data?.acao ?? '')) {
          loadContractDetails();
        }
      }
    });
    return unsub;
  }, [initialContract.id]);

  // Atualização em tempo real quando outra parte altera concordar/discordar em cláusula (Reverb)
  useEffect(() => {
    const unsub = webSocketService.on(
      'clausula.contrato.atualizada',
      (data: { contrato_id: number; clausula_id: number; usuario_id: number; aceito: boolean | null }) => {
        if (data.contrato_id !== contract.id || data.usuario_id === user?.id) return;

        setContract((prev) => {
          if (!prev?.clausulas || !user?.id) return prev;
          const updatedClausulas = prev.clausulas.map((c) => {
            if (c.id !== data.clausula_id) return c;
            const aceito_por = Array.isArray(c.aceito_por) ? [...c.aceito_por] : [];
            const recusado_por = Array.isArray(c.recusado_por) ? [...c.recusado_por] : [];
            const pendente_para = Array.isArray(c.pendente_para) ? [...c.pendente_para] : [];
            const removeUser = (arr: number[]) => arr.filter((id) => id !== data.usuario_id);
            let novaAceitoPor = removeUser(aceito_por);
            let novaRecusadoPor = removeUser(recusado_por);
            let novaPendentePara = removeUser(pendente_para);
            if (data.aceito === true) {
              novaAceitoPor = [...novaAceitoPor, data.usuario_id];
            } else if (data.aceito === false) {
              novaRecusadoPor = [...novaRecusadoPor, data.usuario_id];
            } else {
              novaPendentePara = [...novaPendentePara, data.usuario_id];
            }
            return {
              ...c,
              aceito_por: novaAceitoPor,
              recusado_por: novaRecusadoPor,
              pendente_para: novaPendentePara,
            };
          });
          const next = { ...prev, clausulas: updatedClausulas };
          const computed = computePodeAssinarFromClauses(next, user.id);
          return { ...next, ...computed };
        });
      }
    );
    return unsub;
  }, [contract.id, user?.id, computePodeAssinarFromClauses]);

  const loadContractDetails = async () => {
    setIsLoadingClauses(true);
    try {
      const api = new ApiProvider(true);
      const response = await api.get(`contrato/buscar-completo/${initialContract.id}`);
      const data = (response as any)?.result ?? (response as any)?.data ?? response;
      if (data && typeof data === 'object' && (data.id || data.codigo)) {
        setContract(data as Contract);
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do contrato:', error);
    } finally {
      setIsLoadingClauses(false);
    }
  };

  /** Recalcula pode_assinar e campos relacionados com base no estado atual das cláusulas */
  const computePodeAssinarFromClauses = useCallback((
    c: Contract,
    currentUserId: number
  ): { pode_assinar: boolean; todas_clausulas_coincidentes: boolean; clausulas_em_desacordo: number[] } => {
    // Se o prazo de assinatura expirou, nunca pode assinar
    const prazoExpirado = !!c.dt_prazo_assinatura &&
      new Date(c.dt_prazo_assinatura).getTime() < Date.now();
    if (prazoExpirado) {
      return {
        pode_assinar: false,
        todas_clausulas_coincidentes: false,
        clausulas_em_desacordo: c.clausulas_em_desacordo ?? [],
      };
    }

    const participantes = c.participantes ?? (c as any).assinaturas ?? [];
    let totalParticipantes = Math.max(participantes.length, 1);
    const clausulas = c.clausulas ?? [];
    // Se participantes não veio na listagem, inferir total pelas cláusulas (evita bug quando outra parte vê via WebSocket)
    if (totalParticipantes < 2 && clausulas.length > 0) {
      const allUserIds = new Set<number>();
      for (const cl of clausulas) {
        (cl.aceito_por ?? []).forEach((id: number) => allUserIds.add(id));
        (cl.recusado_por ?? []).forEach((id: number) => allUserIds.add(id));
      }
      totalParticipantes = Math.max(allUserIds.size, totalParticipantes, 1);
    }

    let todasCoincidentes = clausulas.length > 0;
    const clausulasEmDesacordo: number[] = [];

    for (const clause of clausulas) {
      const aceitoPor = clause.aceito_por ?? [];
      const recusadoPor = clause.recusado_por ?? [];
      const respondidos = aceitoPor.length + recusadoPor.length;

      if (respondidos < totalParticipantes) {
        todasCoincidentes = false;
      } else if (aceitoPor.length === totalParticipantes || recusadoPor.length === totalParticipantes) {
        // coincidente - ok
      } else {
        todasCoincidentes = false;
        clausulasEmDesacordo.push(clause.id);
      }
    }

    const meuParticipante = participantes.find(
      (p: any) =>
        Number(p.usuario_id) === Number(currentUserId) ||
        Number(p.usuario?.id) === Number(currentUserId) ||
        Number(p.id) === Number(currentUserId)
    );
    const aceitoVal = meuParticipante?.aceito;
    const euAindaNaoAssinei = !meuParticipante || (aceitoVal !== true && aceitoVal !== false && aceitoVal !== 1 && aceitoVal !== 0);

    return {
      pode_assinar: todasCoincidentes && euAindaNaoAssinei,
      todas_clausulas_coincidentes: todasCoincidentes,
      clausulas_em_desacordo: clausulasEmDesacordo,
    };
  }, []);

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
      case 'Rescindido':
      case 'Excluída pela outra parte':
        return '#B45309';
      default:
        return CustomColors.activeGreyed;
    }
  };

  const handleRevogarClause = async (clause: Clause) => {
    setUpdatingClause(clause.id);
    try {
      const api = new ApiProvider(true);
      await api.post('contrato/clausula/revogar', {
        contrato_id: contract.id,
        clausula_ids: [clause.id],
      });
      // Recarregar do backend: status volta para Pendente, assinaturas zeradas, dt_prazo_assinatura renovada
      await loadContractDetails();
      await refreshUserData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao revogar cláusula');
      await loadContractDetails();
    } finally {
      setUpdatingClause(null);
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

          const next = { ...prev, clausulas: updatedClausulas };
          const computed = computePodeAssinarFromClauses(next, user.id);
          return { ...next, ...computed };
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

  // Criador = quem criou o contrato (contratante) - só ele pode cancelar/excluir.
  // Priorizar usuario_e_criador vindo do backend (buscar-completo) para evitar que
  // participantes como Amanda vejam o botão "Cancelar contrato" indevidamente.
  const isCreator =
    typeof contract.usuario_e_criador === 'boolean'
      ? contract.usuario_e_criador
      : !!(user?.id && (Number(contract.contratante_id) === Number(user.id) || Number(contract.contratante?.id) === Number(user.id)));
  const isPending = contract.status === 'Pendente';

  const handleDeleteContract = async () => {
    const cancelarParaTodos = isCreator && isPending;
    const title = cancelarParaTodos ? 'Cancelar Contrato' : 'Excluir';
    const message = cancelarParaTodos
      ? 'Tem certeza que deseja cancelar este contrato? Ele será removido para todas as partes e não poderá mais ser assinado.'
      : 'Tem certeza que deseja remover este contrato da sua lista?';
    const successMsg = cancelarParaTodos
      ? 'Contrato cancelado com sucesso.'
      : 'Contrato removido da sua lista.';

    Alert.alert(title, message, [
      { text: 'Não', style: 'cancel' },
      {
        text: cancelarParaTodos ? 'Cancelar para todos' : 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            const api = new ApiProvider(true);
            await api.delete(`contrato/excluir/${contract.id}`);
            Alert.alert('Sucesso', successMsg);
            await refreshUserData();
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Erro ao excluir contrato');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleRemoverParticipante = (participant: any) => {
    const nome = participant.usuario?.nome_completo || participant.usuario?.name || 'este participante';
    const usuarioId = participant.usuario_id ?? participant.usuario?.id;
    if (!usuarioId) return;
    const criadorId = contract.contratante_id ?? contract.contratante?.id;
    if (criadorId && Number(usuarioId) === Number(criadorId)) return;

    Alert.alert(
      'Remover participante',
      `Tem certeza que deseja remover ${nome} do contrato?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.post(`contrato/${contract.id}/remover-participante`, { usuario_id: usuarioId });
              await loadContractDetails();
              await refreshUserData();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao remover participante');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRescindContract = () => {
    Alert.alert(
      'Rescindir contrato',
      'Tem certeza que deseja rescindir (desistir) deste contrato? O contrato será encerrado para todas as partes. Esta ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Rescindir',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const api = new ApiProvider(true);
              await api.post(`contrato/rescindir/${contract.id}`);
              Alert.alert('Sucesso', 'Contrato rescindido com sucesso.');
              await refreshUserData();
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao rescindir contrato');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const isSigningExpired =
    !!contract.dt_prazo_assinatura &&
    new Date(contract.dt_prazo_assinatura).getTime() < Date.now();
  const isParticipant =
    contract.participantes?.some(
      (p) =>
        Number(p.usuario_id) === Number(user?.id) ||
        Number((p as any).usuario?.id) === Number(user?.id)
    ) || Number(contract.contratante_id) === Number(user?.id);

  // Usuário assinou o contrato - usado como fallback para exibir botão Revogar em cláusulas que concordou
  const userHasSignedContract = !!(
    user?.id &&
    (
      contract.participantes?.find(
        (p: any) =>
          (Number(p.usuario_id) === Number(user.id) || Number(p.usuario?.id) === Number(user.id) || Number(p.id) === Number(user.id)) &&
          (p.aceito === true || p.aceito === 1)
      ) ||
      (contract as any).assinaturas?.find(
        (a: any) => Number(a.usuario_id) === Number(user.id) && (a.aceito === true || a.aceito === 1)
      )
    )
  );

  // Verificar se o usuário já aprovou uma cláusula específica (true=concordo, false=discordo, null=pendente)
  const isClauseApprovedByUser = (clause: Clause): boolean | null => {
    if (!user?.id) return null;
    const uid = Number(user.id);
    if (Array.isArray(clause.aceito_por) && clause.aceito_por.some((id: any) => Number(id) === uid)) return true;
    if (Array.isArray(clause.recusado_por) && clause.recusado_por.some((id: any) => Number(id) === uid)) return false;
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
    const uid = Number(userId);
    if (clause.aceito_por.some((id: any) => Number(id) === uid)) return true;
    if (Array.isArray(clause.recusado_por) && clause.recusado_por.some((id: any) => Number(id) === uid)) return false;
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
    if (!contract.participantes || contract.participantes.length === 0) {
      return false;
    }
    
    // Total de participantes (participantes já inclui contratante + stakeholders)
    const totalParticipants = contract.participantes.length;
    
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
          <Text style={styles.sectionTitle}>
            Contratante {isCreator && '(você criou este contrato)'}
          </Text>
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
            {contract.participantes
              .filter((p: any) => {
                const pid = p.usuario_id ?? p.usuario?.id;
                const criadorId = contract.contratante_id ?? contract.contratante?.id;
                return pid && Number(pid) !== Number(criadorId);
              })
              .map((participant: any, index: number) => {
                const participanteId = participant.usuario_id ?? participant.usuario?.id;
                const criadorId = contract.contratante_id ?? contract.contratante?.id;
                const podeRemover = isCreator && isPending && participanteId && Number(participanteId) !== Number(criadorId);
                return (
                  <View key={participanteId || index} style={[styles.userCard, styles.participantRow]}>
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
                    <View style={[styles.userInfo, styles.participantInfo]}>
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
                    {podeRemover && (
                      <TouchableOpacity
                        style={styles.removeParticipantButton}
                        onPress={() => handleRemoverParticipante(participant)}
                        disabled={isLoading}
                      >
                        <SafeIcon name="account-minus" size={22} color={CustomColors.vividRed} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
          </View>
        )}

        {contract.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{contract.descricao}</Text>
          </View>
        )}

        {/* Alteração contratual de rescisão - manifestação formal do contratante */}
        {contract.alteracao_rescisao && (
          <View style={[styles.section, styles.alteracaoSection]}>
            <Text style={styles.sectionTitle}>Alteração Contratual - Rescisão</Text>
            <View style={styles.alteracaoBox}>
              <Text style={styles.alteracaoLabel}>Manifestação de vontade do contratante:</Text>
              <Text style={styles.alteracaoText}>{contract.alteracao_rescisao.manifestacao}</Text>
            </View>
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

                    {/* Botão Revogar - aparece após todos assinarem (Ativo/Concluído), em cláusulas que o usuário concordou */}
                    {isParticipant &&
                      !isLoadingClauses &&
                      (String(contract.status || '').trim() === 'Ativo' || String(contract.status || '').trim() === 'Concluído' || String(contract.status || '').trim() === 'Concluido') &&
                      (userApprovalStatus === true || (userHasSignedContract && userApprovalStatus !== false)) &&
                      !contract.alteracao_rescisao &&
                      !isLoading && (
                        <TouchableOpacity
                          style={[styles.clauseToggleButton, styles.clauseToggleRevogar]}
                          onPress={() => handleRevogarClause(clause)}
                          disabled={updatingClause === clause.id}
                        >
                          {updatingClause === clause.id ? (
                            <ActivityIndicator size="small" color="#B45309" />
                          ) : (
                            <>
                              <SafeIcon name="link-off" size={18} color="#B45309" />
                              <Text style={[styles.clauseToggleButtonText, { color: '#B45309' }]}>
                                Revogar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
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

        {/* Botão de Assinar - só aparece se todas as cláusulas foram aprovadas e prazo não expirou */}
        {isPending && isParticipant && contract.pode_assinar && !isSigningExpired && (
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
        {isPending && isParticipant && (!contract.pode_assinar || isSigningExpired) && (
          <View style={styles.infoBox}>
            <SafeIcon name="information" size={20} color={CustomColors.pendingYellow} />
            <Text style={styles.infoText}>
              {isSigningExpired
                ? 'O prazo para assinatura do contrato expirou. Não é mais possível assinar.'
                : contract.clausulas_em_desacordo && contract.clausulas_em_desacordo.length > 0
                  ? `Há ${contract.clausulas_em_desacordo.length} cláusula(s) em desacordo. Todos devem concordar ou discordar de cada cláusula para assinar o contrato.`
                  : 'Todas as cláusulas devem estar coincidentes (todos devem aprovar ou todos devem rejeitar cada cláusula) antes de assinar o contrato.'}
            </Text>
          </View>
        )}

        {/* Só o criador vê este botão - participantes (Amanda, Nana, etc.) não veem */}
        {isCreator && (contract.status === 'Pendente' || contract.status === 'Expirado') && (
          <View style={styles.actions}>
            <Text style={styles.creatorHint}>
              Como criador, você pode cancelar o contrato ou removê-lo da sua lista.
            </Text>
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
                  <Text style={styles.actionButtonText}>
                    {isPending ? 'Cancelar contrato (para todos)' : 'Remover da minha lista'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Contratante pode rescindir contrato assinado (Ativo/Concluído) - só se ainda não há alteração de rescisão */}
        {isCreator && (contract.status === 'Ativo' || contract.status === 'Concluído') && !contract.alteracao_rescisao && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleRescindContract}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={CustomColors.white} />
              ) : (
                <>
                  <SafeIcon name="link-off" size={18} color={CustomColors.white} />
                  <Text style={styles.actionButtonText}>Rescindir contrato (desistir)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
    marginRight: 8,
  },
  removeParticipantButton: {
    padding: 8,
    marginLeft: 4,
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
  alteracaoSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#B45309',
  },
  alteracaoBox: {
    backgroundColor: 'rgba(180, 83, 9, 0.08)',
    padding: 12,
    borderRadius: 8,
  },
  alteracaoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 8,
  },
  alteracaoText: {
    fontSize: 14,
    color: CustomColors.black,
    lineHeight: 22,
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
  clauseToggleRevogar: {
    borderColor: '#B45309',
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginTop: 8,
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
  creatorHint: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    marginBottom: 8,
    textAlign: 'center',
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
