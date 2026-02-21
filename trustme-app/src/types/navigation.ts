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
  MyPlans: undefined;
  Plans: undefined;
  PlanDetail: { plan: any; billingCycle: 'monthly' | 'semiannual' | 'annual' | 'one_time' };
  Subscription: { plan: any; billingCycle: 'monthly' | 'semiannual' | 'annual' | 'one_time' };
  AdditionalPurchaseQuantity: { type: 'contracts' | 'connections' };
  StorePurchaseMockup: { plan: any | null; billingCycle: 'monthly' | 'semiannual' | 'annual' | 'one_time'; price: number; seal?: any; requestId?: number | string; isSeal?: boolean; additionalPurchase?: { purchaseId: number; type: 'contracts' | 'connections'; quantity: number } };
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
  SealComplement: { sealRequestId: number; seloName: string; analystFeedback?: string };
  Payment: { selo: any; requestId?: number | string };
  Plans: undefined;
  MySeals: undefined;
  MyPlans: undefined;
  Contracts: { initialFilter?: string };
  NewContract: undefined;
  ContractDetail: { contract: Contract };
};

export type ContractsStackParamList = {
  ContractsMain: { initialFilter?: string };
  ContractDetail: { contract: Contract };
  NewContract: undefined;
};


