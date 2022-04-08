import { AxiosRequestConfig } from 'axios';

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

export interface FireFlyOrganization {
  id: string;
  name: string;
  did: string;
}

export interface FireFlyNode {
  id: string;
  name: string;
}

export interface FireFlyVerifier {
  hash: string;
  identity: string;
  namespace: string;
  type: string;
  value: string;
}

export interface FireFlyStatus {
  org: FireFlyOrganization;
  node: FireFlyNode;
}

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
  message?: FireFlyMessage;
  transaction?: FireFlyTransaction;
}

// Datatypes

export interface FireFlyDatatypeRef {
  name: string;
  version: string;
}

export interface FireFlyDatatypeOptions extends FireFlyCreateOptions {
  validator?: string;
}

export interface FireFlyDatatypeCreate extends FireFlyDatatypeRef {
  validator: string;
  value: any;
}

export interface FireFlyDatatype extends FireFlyDatatypeCreate {
  created: string;
  hash: string;
  id: string;
  message: string;
  namespace: string;
}

// Data

export interface FireFlyDataInput {
  datatype?: FireFlyDatatypeRef;
  value: any;
}

export interface FireFlyData extends FireFlyDataInput {
  id: string;
  created: string;
  blob?: FireFlyBlob;
}

export interface FireFlyBlob {
  hash: string;
  size: number;
  name: string;
}

export interface FireFlyDataRef {
  id: string;
  hash: string;
}

// Messages

export interface FireFlySendOptions extends FireFlyCreateOptions {
  requestReply?: boolean;
}

export interface FireFlyMessageHeader {
  id: string;
  type: string;
  txtype: string;
  author: string;
  key: string;
  cid?: string;
  topics: string[];
  tag?: string;
  namespace: string;
  created: string;
}

export enum FireFlyMessageState {
  STAGED = 'staged',
  READY = 'ready',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export interface FireFlyMessage {
  header: FireFlyMessageHeader;
  group: string;
  state: FireFlyMessageState;
  confirmed: string;
  data: FireFlyDataRef[];
  batch: string;
}

export interface FireFlyMessageInput {
  header?: Partial<FireFlyMessageHeader>;
  group?: {
    name?: string;
    ledger?: string;
    members?: FireFlyMember[];
  };
  data: Partial<FireFlyData>[];
}

export interface FireFlyMember {
  identity: string;
  node?: string;
}

export interface FireFlyMessageRef {
  id: string;
  hash: string;
}

export interface FireFlyBatch {
  author: string;
  confirmed: string;
  created: string;
  hash: string;
  id: string;
  key: string;
  namespace: string;
  tx: {
    id: string;
    type: string;
  };
  type: string;
  manifest: {
    messages: FireFlyMessageRef[];
    data: FireFlyDataRef;
  };
}

export interface FireFlyBatchFilter {
  'tx.id': string;
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

export interface FireFlyTokenTransferInput {
  amount: number;
  to?: string;
  key?: string;
  from?: string;
  pool?: string;
  tokenIndex?: string;
  message?: FireFlyMessageInput;
}

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
    name: string;
    version: string;
  };
  location: any;
  message?: string;
  urls?: {
    openapi: string;
    ui: string;
  };
}
