import { Contract, Connection } from './index';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  NewPassword: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { email: string; code: string };
  Main: undefined;
  Profile: undefined;
  MySeals: undefined;
  MyConnections: undefined;
  MyContracts: undefined;
  Plans: undefined;
  PlanDetail: { plan: any; billingCycle: 'monthly' | 'semiannual' | 'annual' };
  Subscription: { plan: any; billingCycle: 'monthly' | 'semiannual' | 'annual' };
  StorePurchaseMockup: { plan: any; billingCycle: 'monthly' | 'semiannual' | 'annual'; price: number };
};

export type MainTabParamList = {
  Home: undefined;
  Contracts: undefined;
  Connections: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ConnectionPanel: { initialFilter?: string };
  ConnectionDetail: { connection: Connection };
  Seals: undefined;
  SealAcquisition: { selo: any };
  Payment: { selo: any; requestId?: number | string };
};

export type ContractsStackParamList = {
  ContractsMain: { initialFilter?: string };
  ContractDetail: { contract: Contract };
  NewContract: undefined;
};


