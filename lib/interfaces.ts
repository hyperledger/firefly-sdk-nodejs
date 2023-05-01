import * as http from 'http';
import { AxiosRequestConfig } from 'axios';
import * as WebSocket from 'ws';
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

export class FireFlyError extends Error {
  constructor(message?: string, public originalError?: Error, public path?: string) {
    super(message);
  }
}

interface FireFlyBaseHttpOptions {
  requestConfig?: AxiosRequestConfig;
}

export interface FireFlyGetOptions extends FireFlyBaseHttpOptions {}
export interface FireFlyUpdateOptions extends FireFlyBaseHttpOptions {}
export interface FireFlyReplaceOptions extends FireFlyBaseHttpOptions {}
export interface FireFlyDeleteOptions extends FireFlyBaseHttpOptions {}

export interface FireFlyCreateOptions extends FireFlyBaseHttpOptions {
  confirm?: boolean;
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
  socketOptions?: WebSocket.ClientOptions | http.ClientRequestArgs;
}

// Namespace
export type FireFlyNamespaceResponse = Required<
  operations['getNamespace']['responses']['200']['content']['application/json']
>;

// Network

export type FireFlyIdentityFilter = operations['getIdentities']['parameters']['query'];
export type FireFlyOrganizationFilter = operations['getNetworkOrgs']['parameters']['query'];
export type FireFlyNodeFilter = operations['getNetworkNodes']['parameters']['query'];
export type FireFlyVerifierFilter = operations['getVerifiers']['parameters']['query'];

export type FireFlyIdentityRequest =
  operations['postNewIdentity']['requestBody']['content']['application/json'];
export type FireFlyUpdateIdentityRequest =
  operations['patchUpdateIdentity']['requestBody']['content']['application/json'];

export type FireFlyIdentityResponse = Required<
  operations['getIdentityByID']['responses']['200']['content']['application/json']
>;
export type FireFlyIdentitiesResponse = Required<
  operations['getIdentities']['responses']['200']['content']['application/json']
>;
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

// Verifier

export type FireFlyVerifierResolveRequest = Required<
  operations['postVerifiersResolveNamespace']['requestBody']['content']['application/json']
>;

export type FireFlyVerifierResolveResponse = Required<
  operations['postVerifiersResolveNamespace']['responses']['200']['content']['application/json']
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
  blockchainEvent?: FireFlyBlockchainEventResponse;
  contractAPI?: FireFlyContractAPIResponse;
  contractInterface?: FireFlyContractInterfaceResponse;
  datatype?: FireFlyDatatypeResponse;
  identity?: FireFlyIdentityResponse;
  message?: FireFlyMessageResponse;
  tokenApproval?: FireFlyTokenApprovalResponse;
  tokenPool?: FireFlyTokenPoolResponse;
  tokenTransfer?: FireFlyTokenTransferResponse;
  transaction?: FireFlyTransactionResponse;
  operation?: FireFlyOperationResponse;
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
export type FireFlyDataBlobRequest =
  operations['postData']['requestBody']['content']['multipart/form-data'];

export type FireFlyDataResponse = Required<
  operations['getDataByID']['responses']['200']['content']['application/json']
>;

export const FireFlyDataBlobRequestDefaults: FireFlyDataBlobRequest = {
  autometa: 'true',
};

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
export type FireFlyGroupResponse = Required<
  operations['getGroupByHash']['responses']['200']['content']['application/json']
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

type BalancesList = Required<
  operations['getTokenBalances']['responses']['200']['content']['application/json']
>;
const balances: BalancesList = [];
export type FireFlyTokenBalanceResponse = typeof balances[0];

// Token Approvals

export type FireFlyTokenApprovalFilter = operations['getTokenApprovals']['parameters']['query'];

export type FireFlyTokenApprovalRequest =
  operations['postTokenApproval']['requestBody']['content']['application/json'];
type ApprovalsList =
  operations['getTokenApprovals']['responses']['200']['content']['application/json'];

const approvals: ApprovalsList = [];
export type FireFlyTokenApprovalResponse = typeof approvals[0];

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

export type FireFlyContractInvokeRequest =
  operations['postContractInvoke']['requestBody']['content']['application/json'];
export type FireFlyContractAPIInvokeRequest =
  operations['postContractAPIInvoke']['requestBody']['content']['application/json'];
export type FireFlyContractInvokeResponse = Required<
  operations['postContractInvoke']['responses']['202']['content']['application/json']
>;

export type FireFlyContractQueryRequest =
  operations['postContractQuery']['requestBody']['content']['application/json'];
export type FireFlyContractAPIQueryRequest =
  operations['postContractAPIQuery']['requestBody']['content']['application/json'];
export type FireFlyContractQueryResponse = Required<
  operations['postContractQuery']['responses']['200']['content']['application/json']
>;

// Blockchain Events

export type FireFlyBlockchainEventFilter = operations['getBlockchainEvents']['parameters']['query'];

export type FireFlyBlockchainEventResponse = Required<
  operations['getBlockchainEventByID']['responses']['200']['content']['application/json']
>;
