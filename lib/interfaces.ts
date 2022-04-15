import { AxiosRequestConfig } from 'axios';
import { operations } from './schema';

// General

export interface FireFlyGetOptions {
  confirm: undefined;
  requestConfig?: AxiosRequestConfig;
}

export interface FireFlyCreateOptions {
  confirm?: boolean;
  requestConfig?: AxiosRequestConfig;
}

export interface FireFlyFilter {
  sort?: string;
  ascending?: boolean;
  descending?: boolean;
  skip?: number;
  limit?: number;
  count?: number;
}

export interface FireFlyOptionsInput {
  host: string;
  namespace?: string;
  username?: string;
  password?: string;
  websocket?: {
    host?: string;
    reconnectDelay?: number;
    heartbeatInterval?: number;
  };
  requestConfig?: AxiosRequestConfig;
}

export interface FireFlyOptions extends FireFlyOptionsInput {
  namespace: string;
  websocket: {
    host: string;
    reconnectDelay: number;
    heartbeatInterval: number;
  };
}

export interface FireFlyWebSocketOptions {
  host: string;
  namespace: string;
  subscriptions: string[];
  username?: string;
  password?: string;
  ephemeral?: FireFlyEphemeralSubscription;
  autoack: boolean;
  reconnectDelay: number;
  heartbeatInterval: number;
}

// Network

export type FireFlyOrganizationFilter = operations['getNetworkOrgs']['parameters']['query'];
export type FireFlyNodeFilter = operations['getNetworkNodes']['parameters']['query'];
export type FireFlyVerifierFilter = operations['getVerifiers']['parameters']['query'];

export type FireFlyOrganizationResponse = Required<
  operations['getNetworkOrg']['responses']['200']['content']['application/json']
>;
export type FireFlyNodeResponse = Required<
  operations['getNetworkNode']['responses']['200']['content']['application/json']
>;
export type FireFlyVerifierResponse = Required<
  operations['getVerifierByID']['responses']['200']['content']['application/json']
>;
export type FireFlyStatusResponse = Required<
  operations['getStatus']['responses']['200']['content']['application/json']
>;

// Subscriptions

export interface FireFlySubscriptionRef {
  id: string;
  name: string;
  namespace: string;
}

export interface FireFlySubscriptionBase {
  filter?: {
    events?: string;
  };
  options?: {
    firstEvent?: string;
    readAhead?: number;
    withData?: boolean;
  };
}

export interface FireFlyEphemeralSubscription extends FireFlySubscriptionBase {
  namespace: string;
}

export interface FireFlySubscriptionInput {
  name?: string;
  transport?: string;
}

export interface FireFlySubscription extends FireFlySubscriptionInput {
  id: string;
  namespace: string;
  updated: string;
}

export interface FireFlyEvent {
  id: string;
  type: string;
  namespace: string;
  reference: string;
  subscription: FireFlySubscriptionRef;
  tx?: string;
  message?: FireFlyMessageResponse;
  transaction?: FireFlyTransaction;
}

// Datatypes

export type FireFlyDatatypeFilter = operations['getDatatypes']['parameters']['query'];

export type FireFlyDatatypeRequest =
  operations['postNewDatatype']['requestBody']['content']['application/json'];

export type FireFlyDatatypeResponse =
  operations['getDatatypeByName']['responses']['200']['content']['application/json'];

// Data

export type FireFlyDataFilter = operations['getData']['parameters']['query'];

export type FireFlyDataRequest =
  operations['postData']['requestBody']['content']['application/json'];

export type FireFlyDataResponse =
  operations['getDataByID']['responses']['200']['content']['application/json'];

// Messages

export type FireFlyMessageFilter = operations['getMsgs']['parameters']['query'];
export type FireFlyBatchFilter = operations['getBatches']['parameters']['query'];

export type FireFlyBroadcastMessageRequest =
  operations['postNewMessageBroadcast']['requestBody']['content']['application/json'];
export type FireFlyPrivateMessageRequest =
  operations['postNewMessagePrivate']['requestBody']['content']['application/json'];

export type FireFlyMessageResponse = Required<
  operations['getMsgByID']['responses']['200']['content']['application/json']
>;
export type FireFlyBatchResponse = Required<
  operations['getBatchByID']['responses']['200']['content']['application/json']
>;

export interface FireFlySendOptions extends FireFlyCreateOptions {
  requestReply?: boolean;
}

// Token Pools

export enum FireFlyTokenPoolType {
  FUNGIBLE = 'fungible',
  NONFUNGIBLE = 'nonfungible',
}

export interface FireFlyTokenPoolInput {
  type: FireFlyTokenPoolType;
  name: string;
  symbol?: string;
}

export interface FireFlyTokenPool extends FireFlyTokenPoolInput {
  id: string;
  namespace: string;
  protocolId: string;
  message: string;
  tx: {
    id: string;
    type: string;
  };
}

// Token Transfers

export interface FireFlyTokenTransfer {
  type: string;
  namespace: string;
  pool: string;
  key: string;
  from: string;
  to: string;
  tokenIndex: string;
  uri: string;
  amount: string;
  localId: string;
  protocolId: string;
  message: string;
  messageHash: string;
  tx: {
    id: string;
    type: string;
  };
}

export type FireFlyTokenMintRequest =
  operations['postTokenMint']['requestBody']['content']['application/json'];
export type FireFlyTokenBurnRequest =
  operations['postTokenBurn']['requestBody']['content']['application/json'];
export type FireFlyTokenTransferRequest =
  operations['postTokenTransfer']['requestBody']['content']['application/json'];

// Token Balances

export interface FireFlyTokenBalance {
  pool: string;
  uri: string;
  connector: string;
  namespace: string;
  key: string;
  balance: string;
  updated: string;
  tokenIndex?: string;
}

// Operations

export enum FireFlyOperationStatus {
  PENDING = 'Pending',
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
}

export interface FireFlyOperation {
  id: string;
  namespace: string;
  type: string;
  tx: string;
  created: string;
  updated: string;
  status: FireFlyOperationStatus;
  error?: string;
}

// Transactions

export interface FireFlyTransaction {
  id: string;
  namespace: string;
  type: string;
  created: string;
  blockchainIds: string[];
}

// Contracts

export interface FireFlyContractParam {
  name: string;
  schema: string;
}

export interface FireFlyContractMethod {
  id: string;
  contract: string;
  name: string;
  namespace: string;
  pathname: string;
  description?: string;
  params: FireFlyContractParam[];
  returns: FireFlyContractParam[];
}

export interface FireFlyContractEvent {
  id: string;
  contract: string;
  name: string;
  namespace: string;
  pathname: string;
  description?: string;
  params: FireFlyContractParam[];
}

export interface FireFlyContractGenerate {
  name: string;
  version: string;
  description?: string;
  input: any;
}

export interface FireFlyContractInterface {
  name: string;
  version: string;
  description?: string;
  methods: FireFlyContractMethod[];
  events: FireFlyContractEvent[];
  message?: string;
}

export interface FireFlyContractAPI {
  name: string;
  interface: {
    id?: string;
    name?: string;
    version?: string;
  };
  location: any;
  message?: string;
  urls?: {
    openapi: string;
    ui: string;
  };
}

export interface FireFlyContractListener {
  id: string;
  interface: {
    id?: string;
    name?: string;
    version?: string;
  };
  namespace: string;
  name: string;
  protocolId: string;
  location: any;
  event: any;
  eventPath?: string;
  topic: string;
}

export interface FireFlyContractListenerFilter {
  interface?: string;
  location?: any;
}
