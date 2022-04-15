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

export type FireFlySubscriptionFilter = operations['getSubscriptions']['parameters']['query'];

export type FireFlySubscriptionRequest =
  operations['postNewSubscription']['requestBody']['content']['application/json'];

export type FireFlySubscriptionResponse = Required<
  operations['getSubscriptionByID']['responses']['200']['content']['application/json']
>;
export type FireFlyEventResponse = Required<
  operations['getEventByID']['responses']['200']['content']['application/json']
>;

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

export interface FireFlyEnrichedEvent extends FireFlyEventResponse {
  blockchainEvent?: unknown;
  contractAPI?: unknown;
  contractInterface?: unknown;
  datatype?: FireFlyDatatypeResponse;
  identity?: unknown;
  message?: FireFlyMessageResponse;
  namespaceDetails?: unknown;
  tokenApproval?: unknown;
  tokenPool?: FireFlyTokenPoolResponse;
  tokenTransfer?: FireFlyTokenTransferResponse;
  transaction?: FireFlyTransactionResponse;
}

export interface FireFlyEventDelivery extends FireFlyEnrichedEvent {
  subscription: {
    id: string;
    name: string;
    namespace: string;
  };
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

export interface FireFlyPrivateSendOptions extends FireFlyCreateOptions {
  requestReply?: boolean;
}

// Token Pools

export type FireFlyTokenPoolFilter = operations['getTokenPools']['parameters']['query'];

export type FireFlyTokenPoolRequest =
  operations['postTokenPool']['requestBody']['content']['application/json'];

export type FireFlyTokenPoolResponse =
  operations['getTokenPoolByNameOrID']['responses']['200']['content']['application/json'];

// Token Transfers

export type FireFlyTokenMintRequest =
  operations['postTokenMint']['requestBody']['content']['application/json'];
export type FireFlyTokenBurnRequest =
  operations['postTokenBurn']['requestBody']['content']['application/json'];
export type FireFlyTokenTransferRequest =
  operations['postTokenTransfer']['requestBody']['content']['application/json'];

export type FireFlyTokenTransferResponse =
  operations['getTokenTransferByID']['responses']['200']['content']['application/json'];

// Token Balances

export type FireFlyTokenBalanceFilter = operations['getTokenBalances']['parameters']['query'];

export type FireFlyTokenBalanceResponse =
  operations['getTokenBalances']['responses']['200']['content']['application/json'];

// Operations

export type FireFlyOperationResponse =
  operations['getOpByID']['responses']['200']['content']['application/json'];

// Transactions

export type FireFlyTransactionResponse =
  operations['getTxnByID']['responses']['200']['content']['application/json'];

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
