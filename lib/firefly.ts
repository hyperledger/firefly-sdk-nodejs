import { Readable } from 'stream';
import * as http from 'http';
import * as FormData from 'form-data';
import * as WebSocket from 'ws';
import {
  FireFlyStatusResponse,
  FireFlyPrivateSendOptions,
  FireFlyCreateOptions,
  FireFlyGetOptions,
  FireFlyWebSocketOptions,
  FireFlySubscriptionBase,
  FireFlyBatchFilter,
  FireFlyContractListenerFilter,
  FireFlyOrganizationResponse,
  FireFlyVerifierResponse,
  FireFlyOrganizationFilter,
  FireFlyVerifierFilter,
  FireFlyNodeFilter,
  FireFlyNodeResponse,
  FireFlyBroadcastMessageRequest,
  FireFlyMessageResponse,
  FireFlyMessageFilter,
  FireFlyPrivateMessageRequest,
  FireFlyTokenTransferRequest,
  FireFlyTokenMintRequest,
  FireFlyTokenBurnRequest,
  FireFlyDatatypeResponse,
  FireFlyDatatypeFilter,
  FireFlyDatatypeRequest,
  FireFlyBatchResponse,
  FireFlyDataResponse,
  FireFlyTokenTransferResponse,
  FireFlyTokenBalanceResponse,
  FireFlyTokenBalanceFilter,
  FireFlySubscriptionFilter,
  FireFlySubscriptionResponse,
  FireFlySubscriptionRequest,
  FireFlyTokenPoolRequest,
  FireFlyTokenPoolResponse,
  FireFlyTokenPoolFilter,
  FireFlyTransactionResponse,
  FireFlyContractListenerRequest,
  FireFlyContractListenerResponse,
  FireFlyContractInterfaceRequest,
  FireFlyContractInterfaceResponse,
  FireFlyContractGenerateRequest,
  FireFlyContractAPIRequest,
  FireFlyContractAPIResponse,
  FireFlyContractInterfaceFilter,
  FireFlyContractAPIFilter,
  FireFlyTransactionFilter,
  FireFlyOperationFilter,
  FireFlyOperationResponse,
  FireFlyBlockchainEventFilter,
  FireFlyBlockchainEventResponse,
  FireFlyContractAPIInvokeRequest,
  FireFlyContractAPIQueryRequest,
  FireFlyContractInvokeRequest,
  FireFlyContractInvokeResponse,
  FireFlyContractQueryRequest,
  FireFlyContractQueryResponse,
  FireFlyDataBlobRequest,
  FireFlyDataBlobRequestDefaults,
  FireFlyDataFilter,
  FireFlyDataRequest,
  FireFlyDeleteOptions,
  FireFlyReplaceOptions,
  FireFlyTokenApprovalFilter,
  FireFlyTokenApprovalRequest,
  FireFlyTokenApprovalResponse,
  FireFlyTokenTransferFilter,
  FireFlyWebSocketConnectCallback,
  FireFlyNamespaceResponse,
  FireFlyIdentityFilter,
  FireFlyIdentitiesResponse,
  FireFlyIdentityResponse,
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';
import HttpBase, { mapConfig } from './http';

export default class FireFly extends HttpBase {
  private queue = Promise.resolve();

  async getStatus(options?: FireFlyGetOptions): Promise<FireFlyStatusResponse> {
    const response = await this.rootHttp.get<FireFlyStatusResponse>('/status', mapConfig(options));
    return response.data;
  }

  getIdentities(
    filter?: FireFlyIdentityFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyIdentitiesResponse> {
    return this.getMany<FireFlyIdentitiesResponse>('/identities', filter, options);
  }

  getIdentity(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyIdentityResponse | undefined> {
    return this.getOne<FireFlyIdentityResponse>(`/identities/${id}`, options);
  }

  getOrganizations(
    filter?: FireFlyOrganizationFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyOrganizationResponse[]> {
    return this.getMany<FireFlyOrganizationResponse[]>(
      '/network/organizations',
      filter,
      options,
      true,
    );
  }

  getNodes(
    filter?: FireFlyNodeFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyNodeResponse[]> {
    return this.getMany<FireFlyNodeResponse[]>('/network/nodes', filter, options, true);
  }

  getVerifiers(
    namespace?: string,
    filter?: FireFlyVerifierFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyVerifierResponse[]> {
    namespace = namespace ?? this.options.namespace;
    return this.getMany<FireFlyVerifierResponse[]>(
      `/namespaces/${namespace}/verifiers`,
      filter,
      options,
      true,
    );
  }

  getNamespaces(options?: FireFlyGetOptions): Promise<FireFlyNamespaceResponse[]> {
    return this.getMany<FireFlyNamespaceResponse[]>('/namespaces', undefined, options, true);
  }

  getDatatypes(
    filter?: FireFlyDatatypeFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatypeResponse[]> {
    return this.getMany<FireFlyDatatypeResponse[]>('/datatypes', filter, options);
  }

  getDatatype(
    name: string,
    version: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatypeResponse | undefined> {
    return this.getOne<FireFlyDatatypeResponse>(`/datatypes/${name}/${version}`, options);
  }

  createDatatype(
    req: FireFlyDatatypeRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyDatatypeResponse> {
    return this.createOne('/datatypes', req, options);
  }

  getSubscriptions(
    filter?: FireFlySubscriptionFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlySubscriptionResponse[]> {
    return this.getMany<FireFlySubscriptionResponse[]>('/subscriptions', filter, options);
  }

  replaceSubscription(
    sub: FireFlySubscriptionRequest,
    options?: FireFlyReplaceOptions,
  ): Promise<FireFlySubscriptionResponse> {
    return this.replaceOne<FireFlySubscriptionResponse>('/subscriptions', sub, options);
  }

  async deleteSubscription(subId: string, options?: FireFlyDeleteOptions) {
    await this.deleteOne(`/subscriptions/${subId}`, options);
  }

  getData(id: string, options?: FireFlyGetOptions): Promise<FireFlyDataResponse | undefined> {
    return this.getOne<FireFlyDataResponse>(`/data/${id}`, options);
  }

  findData(
    filter?: FireFlyDataFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDataResponse[]> {
    return this.getMany<FireFlyDataResponse[]>(`/data`, filter, options);
  }

  async getDataBlob(id: string, options?: FireFlyGetOptions): Promise<Readable> {
    const response = await this.wrapError(
      this.http.get<Readable>(`/data/${id}/blob`, {
        ...mapConfig(options),
        responseType: 'stream',
      }),
    );
    return response.data;
  }

  uploadData(
    data: FireFlyDataRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyDataResponse> {
    return this.createOne<FireFlyDataResponse>('/data', data, options);
  }

  publishData(id: string, options?: FireFlyCreateOptions): Promise<FireFlyDataResponse> {
    return this.createOne<FireFlyDataResponse>(`/data/${id}/value/publish`, {}, options);
  }

  async uploadDataBlob(
    blob: string | Buffer | Readable,
    blobOptions?: FormData.AppendOptions,
    dataOptions?: FireFlyDataBlobRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyDataResponse> {
    dataOptions = { ...FireFlyDataBlobRequestDefaults, ...dataOptions };
    const formData = new FormData();
    for (const key in dataOptions) {
      const val = dataOptions[key as keyof FireFlyDataBlobRequest];
      if (val !== undefined) {
        formData.append(key, val);
      }
    }
    formData.append('file', blob, blobOptions);
    const requestOptions = mapConfig(options);
    const response = await this.wrapError(
      this.http.post<FireFlyDataResponse>('/data', formData, {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync(),
        },
      }),
    );
    return response.data;
  }

  publishDataBlob(id: string, options?: FireFlyCreateOptions): Promise<FireFlyDataResponse> {
    return this.createOne<FireFlyDataResponse>(`/data/${id}/blob/publish`, {}, options);
  }

  async deleteData(id: string, options?: FireFlyDeleteOptions) {
    await this.deleteOne(`/data/${id}`, options);
  }

  getBatches(
    filter?: FireFlyBatchFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyBatchResponse[]> {
    return this.getMany<FireFlyBatchResponse[]>(`/batches`, filter, options);
  }

  getMessages(
    filter?: FireFlyMessageFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyMessageResponse[]> {
    return this.getMany<FireFlyMessageResponse[]>(`/messages`, filter, options);
  }

  getMessage(id: string, options?: FireFlyGetOptions): Promise<FireFlyMessageResponse | undefined> {
    return this.getOne<FireFlyMessageResponse>(`/messages/${id}`, options);
  }

  sendBroadcast(
    message: FireFlyBroadcastMessageRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyMessageResponse> {
    return this.createOne<FireFlyMessageResponse>('/messages/broadcast', message, options);
  }

  sendPrivateMessage(
    message: FireFlyPrivateMessageRequest,
    options?: FireFlyPrivateSendOptions,
  ): Promise<FireFlyMessageResponse> {
    const url = options?.requestReply ? '/messages/requestreply' : '/messages/private';
    return this.createOne<FireFlyMessageResponse>(url, message, options);
  }

  createTokenPool(
    pool: FireFlyTokenPoolRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenPoolResponse> {
    return this.createOne<FireFlyTokenPoolResponse>('/tokens/pools', pool, options);
  }

  getTokenPools(
    filter?: FireFlyTokenPoolFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenPoolResponse[]> {
    return this.getMany<FireFlyTokenPoolResponse[]>(`/tokens/pools`, filter, options);
  }

  getTokenPool(
    nameOrId: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenPoolResponse | undefined> {
    return this.getOne<FireFlyTokenPoolResponse>(`/tokens/pools/${nameOrId}`, options);
  }

  mintTokens(transfer: FireFlyTokenMintRequest, options?: FireFlyCreateOptions) {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/mint', transfer, options);
  }

  transferTokens(
    transfer: FireFlyTokenTransferRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/transfers', transfer, options);
  }

  approveTokens(
    approval: FireFlyTokenApprovalRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/approvals', approval, options);
  }

  getTokenApprovals(
    filter?: FireFlyTokenApprovalFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenApprovalResponse[]> {
    return this.getMany<FireFlyTokenApprovalResponse[]>(`/tokens/approvals`, filter, options);
  }

  burnTokens(
    transfer: FireFlyTokenBurnRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/burn', transfer, options);
  }

  getTokenTransfers(
    filter?: FireFlyTokenTransferFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenTransferResponse[]> {
    return this.getMany<FireFlyTokenTransferResponse[]>(`/tokens/transfers`, filter, options);
  }

  getTokenTransfer(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenTransferResponse | undefined> {
    return this.getOne<FireFlyTokenTransferResponse>(`/tokens/transfers/${id}`, options);
  }

  getTokenBalances(
    filter?: FireFlyTokenBalanceFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenBalanceResponse[]> {
    return this.getMany<FireFlyTokenBalanceResponse[]>('/tokens/balances', filter, options);
  }

  generateContractInterface(
    request: FireFlyContractGenerateRequest,
  ): Promise<FireFlyContractInterfaceRequest> {
    return this.createOne<FireFlyContractInterfaceRequest>(
      '/contracts/interfaces/generate',
      request,
    );
  }

  createContractInterface(
    ffi: FireFlyContractInterfaceRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractInterfaceResponse> {
    return this.createOne<FireFlyContractInterfaceResponse>('/contracts/interfaces', ffi, options);
  }

  getContractInterfaces(
    filter?: FireFlyContractInterfaceFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractInterfaceResponse[]> {
    return this.getMany<FireFlyContractInterfaceResponse[]>(
      '/contracts/interfaces',
      filter,
      options,
    );
  }

  getContractInterface(
    id: string,
    fetchchildren?: boolean,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractInterfaceResponse | undefined> {
    return this.getOne<FireFlyContractInterfaceResponse>(`/contracts/interfaces/${id}`, options, {
      fetchchildren,
    });
  }

  createContractAPI(
    api: FireFlyContractAPIRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractAPIResponse> {
    return this.createOne<FireFlyContractAPIResponse>('/apis', api, options);
  }

  getContractAPIs(
    filter?: FireFlyContractAPIFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractAPIResponse[]> {
    return this.getMany<FireFlyContractAPIResponse[]>('/apis', filter, options);
  }

  getContractAPI(
    name: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractAPIResponse | undefined> {
    return this.getOne<FireFlyContractAPIResponse>(`/apis/${name}`, options);
  }

  invokeContract(
    request: FireFlyContractInvokeRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractInvokeResponse> {
    return this.createOne<FireFlyContractInvokeResponse>('/contracts/invoke', request, options);
  }

  queryContract(
    request: FireFlyContractQueryRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractQueryResponse> {
    return this.createOne<FireFlyContractQueryResponse>('/contracts/query', request, options);
  }

  invokeContractAPI(
    apiName: string,
    methodPath: string,
    request: FireFlyContractAPIInvokeRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractInvokeResponse> {
    return this.createOne<FireFlyContractInvokeResponse>(
      `/apis/${apiName}/invoke/${methodPath}`,
      request,
      options,
    );
  }

  queryContractAPI(
    apiName: string,
    methodPath: string,
    request: FireFlyContractAPIQueryRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractQueryResponse> {
    return this.createOne<FireFlyContractQueryResponse>(
      `/apis/${apiName}/query/${methodPath}`,
      request,
      options,
    );
  }

  createContractListener(
    listener: FireFlyContractListenerRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractListenerResponse> {
    return this.createOne<FireFlyContractListenerResponse>(
      '/contracts/listeners',
      listener,
      options,
    );
  }

  getContractListeners(
    filter?: FireFlyContractListenerFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractListenerResponse[]> {
    return this.getMany<FireFlyContractListenerResponse[]>('/contracts/listeners', filter, options);
  }

  async deleteContractListener(id: string, options?: FireFlyDeleteOptions) {
    await this.deleteOne(`/contracts/listeners/${id}`, options);
  }

  getContractAPIListeners(
    apiName: string,
    eventPath: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractListenerResponse[]> {
    return this.getMany<FireFlyContractListenerResponse[]>(
      `/apis/${apiName}/listeners/${eventPath}`,
      {},
      options,
    );
  }

  createContractAPIListener(
    apiName: string,
    eventPath: string,
    listener: FireFlyContractListenerRequest,
    options?: FireFlyCreateOptions,
  ) {
    return this.createOne<FireFlyContractListenerResponse>(
      `/apis/${apiName}/listeners/${eventPath}`,
      listener,
      options,
    );
  }

  getOperations(
    filter?: FireFlyOperationFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyOperationResponse[]> {
    return this.getMany<FireFlyOperationResponse[]>('/operations', filter, options);
  }

  getOperation(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyOperationResponse | undefined> {
    return this.getOne<FireFlyOperationResponse>(`/operations/${id}`, options);
  }

  retryOperation(id: string, options?: FireFlyCreateOptions): Promise<FireFlyOperationResponse> {
    return this.createOne<FireFlyOperationResponse>(`/operations/${id}/retry`, {}, options);
  }

  getTransactions(
    filter?: FireFlyTransactionFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTransactionResponse[]> {
    return this.getMany<FireFlyTransactionResponse[]>('/transactions', filter, options);
  }

  getTransaction(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTransactionResponse | undefined> {
    return this.getOne<FireFlyTransactionResponse>(`/transactions/${id}`, options);
  }

  getBlockchainEvents(
    filter?: FireFlyBlockchainEventFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyBlockchainEventResponse[]> {
    return this.getMany<FireFlyBlockchainEventResponse[]>('/blockchainevents', filter, options);
  }

  getBlockchainEvent(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyBlockchainEventResponse | undefined> {
    return this.getOne<FireFlyBlockchainEventResponse>(`/blockchainevents/${id}`, options);
  }

  listen(
    subscriptions: string | string[] | FireFlySubscriptionBase,
    callback: FireFlyWebSocketCallback,
    socketOptions?: WebSocket.ClientOptions | http.ClientRequestArgs,
    fireflySocketOptions?: Partial<FireFlyWebSocketOptions> | FireFlyWebSocketConnectCallback,
  ): FireFlyWebSocket {
    if (typeof fireflySocketOptions === 'function') {
      // Legacy compatibility (afterConnect callback passed as 4th arg)
      fireflySocketOptions = <FireFlyWebSocketOptions>{
        afterConnect: fireflySocketOptions,
      };
    }
    const options: FireFlyWebSocketOptions = {
      host: this.options.websocket.host,
      namespace: this.options.namespace,
      username: this.options.username,
      password: this.options.password,
      reconnectDelay: this.options.websocket.reconnectDelay,
      heartbeatInterval: this.options.websocket.heartbeatInterval,
      autoack: false,
      ...fireflySocketOptions,
      socketOptions,
      subscriptions: [],
    };

    const handler: FireFlyWebSocketCallback = (socket, event) => {
      this.queue = this.queue.finally(() => callback(socket, event));
      if (!options.noack) {
        this.queue.then(() => {
          socket.ack(event);
        });
      }
    };

    if (Array.isArray(subscriptions)) {
      options.subscriptions = subscriptions;
    } else if (typeof subscriptions === 'string') {
      options.subscriptions = [subscriptions];
    } else {
      options.ephemeral = { ...subscriptions, namespace: this.options.namespace };
    }

    return new FireFlyWebSocket(options, handler);
  }
}
