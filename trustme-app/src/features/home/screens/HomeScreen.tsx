import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, RootStackParamList } from '../../../types/navigation';
import { useUser } from '../../../core/context/UserContext';
import { CustomColors } from '../../../core/colors';
import { ContractStatus } from '../../../types';
import SafeIcon from '../../../components/SafeIcon';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { user, contracts, connections } = useUser();

  // Determinar o perfil do usuário
  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isServiceDesk = userRole === 'servicedesk';
  const isAppUser = !isAdmin && !isServiceDesk;

  // Calcular estatísticas (apenas para usuários do app)
  const stats = useMemo(() => {
    if (!isAppUser) return null;
    
    const safeContracts = Array.isArray(contracts) ? contracts : [];
    const safeConnections = Array.isArray(connections) ? connections : [];
    
    const activeContracts = safeContracts.filter((c) => c.status === 'Ativo' || c.status === ContractStatus.Ativo).length;
    const pendingContracts = safeContracts.filter((c) => c.status === 'Pendente' || c.status === ContractStatus.Pendente).length;
    const activeConnections = safeConnections.filter((c) => c.aceito === true).length;
    const pendingConnections = safeConnections.filter((c) => c.aceito === false || !c.aceito).length;
    const pendingSeals = Array.isArray(user?.sealsObtained) ? user.sealsObtained.filter((s: any) => s.status === 'pendente').length : 0;

    return {
      activeContracts,
      pendingContracts,
      activeConnections,
      pendingConnections,
      pendingSeals,
    };
  }, [contracts, connections, user, isAppUser]);

  const handleProfilePress = () => {
    rootNavigation.navigate('Profile');
  };

  const handlePlansPress = () => {
    rootNavigation.navigate('Plans');
  };

  const handleConnectionsPress = () => {
    navigation.navigate('ConnectionPanel', { initialFilter: 'Todas' });
  };

  const handleSealsPress = () => {
    navigation.navigate('Seals');
  };

  const handlePlansPress = () => {
    rootNavigation.navigate('Plans');
  };

  // Handlers para Admin
  const handleAdminMenuPress = (menuItem: string) => {
    // TODO: Implementar navegação para telas de admin
    console.log(`Navegar para: ${menuItem}`);
  };

  // Handlers para Atendente
  const handleServiceDeskMenuPress = (menuItem: string) => {
    // TODO: Implementar navegação para telas de atendente
    console.log(`Navegar para: ${menuItem}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/images/trustme-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                tintColor={CustomColors.white}
              />
            </View>
            <Text style={styles.headerTitle}>TrueConnect</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <SafeIcon name="profile" size={28} color={CustomColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu para Usuário do App */}
        {isAppUser && (
          <>
            {/* Cards de Resumo */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Informações gerais</Text>
              
              <View style={styles.summaryGrid}>
                {/* Contratos Ativos */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{stats?.activeContracts || 0}</Text>
                  <Text style={styles.summaryLabel}>Contratos ativos</Text>
                </View>

                {/* Contratos Pendentes */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{stats?.pendingContracts || 0}</Text>
                  <Text style={styles.summaryLabel}>Contratos pendentes</Text>
                </View>

                {/* Selos Pendentes */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{stats?.pendingSeals || 0}</Text>
                  <Text style={styles.summaryLabel}>Selos pendentes</Text>
                </View>

                {/* Conexões Ativas */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{stats?.activeConnections || 0}</Text>
                  <Text style={styles.summaryLabel}>Conexões ativas</Text>
                </View>

                {/* Conexões Pendentes */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{stats?.pendingConnections || 0}</Text>
                  <Text style={styles.summaryLabel}>Conexões pendentes</Text>
                </View>
              </View>
            </View>

            {/* Cards de Ação */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Serviços</Text>

              {/* Card de Contatos */}
              <TouchableOpacity style={styles.actionCard} onPress={handleConnectionsPress}>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionIconContainer}>
                    <SafeIcon name="connections" size={24} color={CustomColors.activeColor} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Minhas Conexões</Text>
                    <Text style={styles.actionDescription}>
                      Gerencie suas conexões e solicitações
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </View>
              </TouchableOpacity>

              {/* Card de Contratos */}
              <TouchableOpacity 
                style={styles.actionCard} 
                onPress={() => navigation.getParent()?.navigate('Contracts' as never)}
              >
                <View style={styles.actionCardContent}>
                  <View style={styles.actionIconContainer}>
                    <SafeIcon name="document-text" size={24} color={CustomColors.activeColor} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Meus Contratos</Text>
                    <Text style={styles.actionDescription}>
                      Visualize e gerencie seus contratos
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </View>
              </TouchableOpacity>

              {/* Card de Selos */}
              <TouchableOpacity style={styles.actionCard} onPress={handleSealsPress}>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionIconContainer}>
                    <SafeIcon name="seals" size={24} color={CustomColors.activeColor} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Meus Selos</Text>
                    <Text style={styles.actionDescription}>
                      Visualize seus selos e conquistas
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </View>
              </TouchableOpacity>

              {/* Card de Planos */}
              <TouchableOpacity style={styles.actionCard} onPress={handlePlansPress}>
                <View style={styles.actionCardContent}>
                  <View style={styles.actionIconContainer}>
                    <SafeIcon name="card" size={24} color={CustomColors.activeColor} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Planos</Text>
                    <Text style={styles.actionDescription}>
                      Assine um plano e desbloqueie recursos
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Menu para Atendente */}
        {isServiceDesk && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Menu</Text>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => handleServiceDeskMenuPress('Usuários')}
            >
              <View style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <SafeIcon name="profile" size={24} color={CustomColors.activeColor} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Usuários</Text>
                  <Text style={styles.actionDescription}>
                    Gerencie usuários do sistema
                  </Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              onPress={() => handleServiceDeskMenuPress('Solicitações de Selos')}
            >
              <View style={styles.actionCardContent}>
                <View style={styles.actionIconContainer}>
                  <SafeIcon name="seals" size={24} color={CustomColors.activeColor} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Solicitações de Selos</Text>
                  <Text style={styles.actionDescription}>
                    Analise e aprove solicitações de selos
                  </Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu para Admin */}
        {isAdmin && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Menu Administrativo</Text>

            {[
              { title: 'Dashboard', icon: 'home', description: 'Visão geral do sistema' },
              { title: 'Usuários', icon: 'profile', description: 'Gerencie usuários do sistema' },
              { title: 'Planos', icon: 'document-text', description: 'Gerencie planos disponíveis' },
              { title: 'FAQs', icon: 'document-text', description: 'Gerencie perguntas frequentes' },
              { title: 'Depoimentos', icon: 'document-text', description: 'Gerencie depoimentos' },
              { title: 'Contatos', icon: 'connections', description: 'Gerencie contatos' },
              { title: 'Tipos de Contrato', icon: 'document-text', description: 'Gerencie tipos de contrato' },
              { title: 'Selos', icon: 'seals', description: 'Gerencie selos disponíveis' },
              { title: 'Solicitações de Selos', icon: 'seals', description: 'Analise solicitações de selos' },
              { title: 'Conteúdo da Home', icon: 'home', description: 'Gerencie conteúdo da página inicial' },
              { title: 'Identidade Organizacional', icon: 'home', description: 'Gerencie identidade visual' },
            ].map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.actionCard} 
                onPress={() => handleAdminMenuPress(item.title)}
              >
                <View style={styles.actionCardContent}>
                  <View style={styles.actionIconContainer}>
                    <SafeIcon name={item.icon as any} size={24} color={CustomColors.activeColor} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.backgroundPrimaryColor,
  },
  header: {
    backgroundColor: CustomColors.activeColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 40,
    opacity: 1,
    tintColor: CustomColors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CustomColors.white,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  summarySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CustomColors.activeColor,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: CustomColors.activeGreyed,
    textAlign: 'center',
  },
  actionsSection: {
    padding: 16,
    paddingTop: 0,
  },
  actionCard: {
    backgroundColor: CustomColors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CustomColors.backgroundPrimaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CustomColors.black,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: CustomColors.activeGreyed,
  },
  actionArrow: {
    fontSize: 24,
    color: CustomColors.activeGreyed,
    marginLeft: 8,
  },
});

export default HomeScreen;
