// General
export interface FireFlyRequestOptions {
  confirm?: boolean;
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
  subscriptionName: string;
  username?: string;
  password?: string;
  reconnectDelay: number;
  heartbeatInterval: number;
}

// Network

export interface FireFlyOrganization {
  id: string;
  name: string;
  identity: string;
  registered: true;
}

export interface FireFlyMember {
  identity: string;
  node?: string;
}

export interface FireFlyNode {
  name: string;
  registered: boolean;
  id: string;
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

export interface FireFlySubscriptionInput {
  name?: string;
  transport?: string;
  filter?: {
    events?: string;
  };
  options?: {
    firstEvent?: string;
    readAhead?: number;
    withData?: boolean;
  };
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
  message?: FireFlyMessage;
}

// Datatypes

export interface FireFlyDatatypeRef {
  name: string;
  version: string;
}

export interface FireFlyDatatypeOptions extends FireFlyRequestOptions {
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

export interface FireFlyMessageBase {
  header: {
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
  };
}

export enum FireFlyMessageState {
  STAGED = 'staged',
  READY = 'ready',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export interface FireFlyMessage extends FireFlyMessageBase {
  group: string;
  state: FireFlyMessageState;
  confirmed: string;
  data: FireFlyDataRef[];
}

export interface FireFlyMessageInput extends Partial<FireFlyMessageBase> {
  group?: {
    name?: string;
    ledger?: string;
    members?: FireFlyMember[];
  };
  data: Partial<FireFlyData>[];
}

// Token Pools

export enum FireFlyTokenPoolType {
  FUNGIBLE = 'fungible',
  NONFUNGIBLE = 'nonfungible',
}

export interface FireFlyTokenPool {
  id: string;
  type: string;
  namespace: string;
  name: string;
  protocolId: string;
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

export interface FireFlyTokensTransferInput {
  amount: number;
  to?: string;
  key?: string;
  from?: string;
  pool?: string;
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
  created: string;
  hash: string;
  protocolId: string;
  status: FireFlyOperationStatus;
  subject: {
    namespace: string;
    reference: string;
    signer: string;
    type: string;
  };
}
