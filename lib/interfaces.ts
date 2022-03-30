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

export interface FireFlySubscriptionRef {
  id: string;
  name: string;
  namespace: string;
}

export interface FireFlySubscription {
  namespace: string;
  name: string;
  transport: string;
  filter?: {
    events?: string;
  };
  options?: {
    firstEvent?: string;
    readAhead?: number;
  };
}

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

export interface FireFlyDataRef {
  id: string;
  hash: string;
}

export interface FireFlyEvent {
  id: string;
  type: string;
  namespace: string;
  reference: string;
  subscription: FireFlySubscriptionRef;
  message?: FireFlyMessage;
}

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

export interface FireFlyOptions {
  enabled: boolean;
  host?: string;
  uri?: string;
  poolName?: string;
  subscriptionName?: string;
  username?: string;
  password?: string;
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

export interface FireFlyEventListener {
  processEvent: (event: FireFlyEvent) => boolean | Promise<boolean>;
}

export interface MessageListener {
  processMessage: (message: FireFlyMessage) => boolean | Promise<boolean>;
}

export interface MemberListener {
  membersChanged: () => void | Promise<void>;
}
