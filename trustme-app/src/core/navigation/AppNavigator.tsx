import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUser } from '../context/UserContext';
import { CustomColors } from '../colors';
import SafeIcon from '../../components/SafeIcon';
import LoginScreen from '../../features/login/screens/LoginScreen';
import HomeScreen from '../../features/home/screens/HomeScreen';
import ContractsScreen from '../../features/contracts/screens/ContractsScreen';
import ContractDetailScreen from '../../features/contracts/screens/ContractDetailScreen';
import NewContractScreen from '../../features/contracts/screens/NewContractScreen';
import ConnectionPanelScreen from '../../features/connection/screens/ConnectionPanelScreen';
import ConnectionDetailScreen from '../../features/connection/screens/ConnectionDetailScreen';
import RegisterScreen from '../../features/register/screens/RegisterScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import NewPasswordScreen from '../../features/newPassword/screens/NewPasswordScreen';
import NotificationsScreen from '../../features/notifications/screens/NotificationsScreen';
import SealsScreen from '../../features/seals/screens/SealsScreen';
import SealAcquisitionScreen from '../../features/seals/screens/SealAcquisitionScreen';
import PaymentScreen from '../../features/seals/screens/PaymentScreen';
import { RootStackParamList, MainTabParamList, HomeStackParamList, ContractsStackParamList } from '../../types/navigation';
import ForgotPasswordScreen from '../../features/forgotPassword/screens/ForgotPasswordScreen';
import VerifyCodeScreen from '../../features/forgotPassword/screens/VerifyCodeScreen';
import ResetPasswordScreen from '../../features/forgotPassword/screens/ResetPasswordScreen';
import MySealsScreen from '../../features/profile/screens/MySealsScreen';
import MyConnectionsScreen from '../../features/profile/screens/MyConnectionsScreen';
import MyContractsScreen from '../../features/profile/screens/MyContractsScreen';
import PlansScreen from '../../features/plans/screens/PlansScreen';
import PlanDetailScreen from '../../features/plans/screens/PlanDetailScreen';
import SubscriptionScreen from '../../features/plans/screens/SubscriptionScreen';
import StorePurchaseMockupScreen from '../../features/plans/screens/StorePurchaseMockupScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ContractsStack = createNativeStackNavigator<ContractsStackParamList>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ConnectionPanel" component={ConnectionPanelScreen} />
      <HomeStack.Screen name="ConnectionDetail" component={ConnectionDetailScreen} />
      <HomeStack.Screen name="Seals" component={SealsScreen} />
      <HomeStack.Screen name="SealAcquisition" component={SealAcquisitionScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
    </HomeStack.Navigator>
  );
};

const ContractsStackNavigator = () => {
  return (
    <ContractsStack.Navigator screenOptions={{ headerShown: false }}>
      <ContractsStack.Screen name="ContractsMain" component={ContractsScreen} />
      <ContractsStack.Screen name="ContractDetail" component={ContractDetailScreen} />
      <ContractsStack.Screen name="NewContract" component={NewContractScreen} />
    </ContractsStack.Navigator>
  );
};

const MainTabsNavigator = () => {
  // Criar o navigator dentro da função para evitar problemas de inicialização
  const MainTabs = createBottomTabNavigator<MainTabParamList>();
  const { user } = useUser();
  
  // Determinar o perfil do usuário
  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isServiceDesk = userRole === 'servicedesk';
  const isAppUser = !isAdmin && !isServiceDesk;
  
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CustomColors.activeColor, // #0C2E59
        tabBarInactiveTintColor: CustomColors.activeGreyed,
      }}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <SafeIcon name="home" size={24} color={color} />,
        }}
      />
      {/* Mostrar tabs apenas para usuários do app */}
      {isAppUser && (
        <>
          <MainTabs.Screen
            name="Contracts"
            component={ContractsStackNavigator}
            options={{
              tabBarLabel: 'Contratos',
              tabBarIcon: ({ color }) => <SafeIcon name="document-text" size={24} color={color} />,
            }}
          />
          <MainTabs.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              tabBarLabel: 'Notificações',
              tabBarIcon: ({ color }) => <SafeIcon name="notifications" size={24} color={color} />,
            }}
          />
        </>
      )}
    </MainTabs.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null; // Mostrar splash screen
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="Main" component={MainTabsNavigator} />
            <RootStack.Screen name="Profile" component={ProfileScreen} />
            <RootStack.Screen name="MySeals" component={MySealsScreen} />
            <RootStack.Screen name="MyConnections" component={MyConnectionsScreen} />
            <RootStack.Screen name="MyContracts" component={MyContractsScreen} />
            <RootStack.Screen name="Plans" component={PlansScreen} />
            <RootStack.Screen name="PlanDetail" component={PlanDetailScreen} />
            <RootStack.Screen name="Subscription" component={SubscriptionScreen} />
            <RootStack.Screen name="StorePurchaseMockup" component={StorePurchaseMockupScreen} />
          </>
        ) : (
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
            <RootStack.Screen name="NewPassword" component={NewPasswordScreen} />
            <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <RootStack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
