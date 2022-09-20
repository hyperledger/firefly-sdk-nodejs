import { AxiosRequestConfig } from 'axios';
import { operations } from './schema';

/**
 * Most types in this file are aliased from request/response body types that
 * are generated from the OpenAPI specification for FireFly.
 *
 * Because the spec doesn't accurately reflect "required" fields, currently
 * all request types below mark every field as optional, and response types
 * mark every field as being set. This is not completely accurate, but should
 * be close enough for most use cases.
 */

// General

export class FireFlyError extends Error {}

export interface FireFlyGetOptions {
  confirm: undefined;
  requestConfig?: AxiosRequestConfig;
}

export interface FireFlyCreateOptions {
  confirm?: boolean;
  requestConfig?: AxiosRequestConfig;
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

export type FireFlyDataResponse = Required<
  operations['getDataByID']['responses']['200']['content']['application/json']
>;

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

export type FireFlyTokenPoolResponse = Required<
  operations['getTokenPoolByNameOrID']['responses']['200']['content']['application/json']
>;

// Token Transfers

export type FireFlyTokenTransferFilter = operations['getTokenTransfers']['parameters']['query'];

export type FireFlyTokenMintRequest =
  operations['postTokenMint']['requestBody']['content']['application/json'];
export type FireFlyTokenBurnRequest =
  operations['postTokenBurn']['requestBody']['content']['application/json'];
export type FireFlyTokenTransferRequest =
  operations['postTokenTransfer']['requestBody']['content']['application/json'];

export type FireFlyTokenTransferResponse = Required<
  operations['getTokenTransferByID']['responses']['200']['content']['application/json']
>;

// Token Balances

export type FireFlyTokenBalanceFilter = operations['getTokenBalances']['parameters']['query'];

export type FireFlyTokenBalanceResponse = Required<
  operations['getTokenBalances']['responses']['200']['content']['application/json']
>;

// Operations + Transactions

export type FireFlyOperationFilter = operations['getOps']['parameters']['query'];
export type FireFlyTransactionFilter = operations['getTxns']['parameters']['query'];

export type FireFlyOperationResponse = Required<
  operations['getOpByID']['responses']['200']['content']['application/json']
>;
export type FireFlyTransactionResponse = Required<
  operations['getTxnByID']['responses']['200']['content']['application/json']
>;

// Contracts

export type FireFlyContractInterfaceFilter =
  operations['getContractInterfaces']['parameters']['query'];
export type FireFlyContractAPIFilter = operations['getContractAPIs']['parameters']['query'];
export type FireFlyContractListenerFilter =
  operations['getContractListeners']['parameters']['query'];

export type FireFlyContractGenerateRequest =
  operations['postGenerateContractInterface']['requestBody']['content']['application/json'];
export type FireFlyContractInterfaceRequest =
  operations['postNewContractInterface']['requestBody']['content']['application/json'];
export type FireFlyContractAPIRequest =
  operations['postNewContractAPI']['requestBody']['content']['application/json'];
export type FireFlyContractListenerRequest =
  operations['postNewContractListener']['requestBody']['content']['application/json'];

export type FireFlyContractInterfaceResponse = Required<
  operations['getContractInterface']['responses']['200']['content']['application/json']
>;
export type FireFlyContractAPIResponse = Required<
  operations['getContractAPIByName']['responses']['200']['content']['application/json']
>;
export type FireFlyContractListenerResponse = Required<
  operations['getContractListenerByNameOrID']['responses']['200']['content']['application/json']
>;
