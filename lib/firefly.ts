import { Stream, Readable } from 'stream';
import * as FormData from 'form-data';
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
  FireFlyTokenTransferFilter,
  FireFlyContractInvokeResponse,
  FireFlyContractQueryResponse,
  FireFlyContractAPIInvokeRequest,
  FireFlyContractAPIQueryRequest,
  FireFlyContractInvokeRequest,
  FireFlyContractQueryRequest,
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';
import HttpBase, { mapConfig } from './http';

export default class FireFly extends HttpBase {
  private queue = Promise.resolve();

  async getStatus(options?: FireFlyGetOptions): Promise<FireFlyStatusResponse> {
    const response = await this.rootHttp.get<FireFlyStatusResponse>('/status', mapConfig(options));
    return response.data;
  }

  async getOrganizations(
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

  async getNodes(
    filter?: FireFlyNodeFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyNodeResponse[]> {
    return this.getMany<FireFlyNodeResponse[]>('/network/nodes', filter, options, true);
  }

  async getVerifiers(
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

  async getDatatypes(
    filter?: FireFlyDatatypeFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatypeResponse[]> {
    return this.getMany<FireFlyDatatypeResponse[]>('/datatypes', filter, options);
  }

  async getDatatype(
    name: string,
    version: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatypeResponse | undefined> {
    return this.getOne<FireFlyDatatypeResponse>(`/datatypes/${name}/${version}`, options);
  }

  async createDatatype(
    req: FireFlyDatatypeRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyDatatypeResponse> {
    return this.createOne('/datatypes', req, options);
  }

  async getSubscriptions(
    filter?: FireFlySubscriptionFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlySubscriptionResponse[]> {
    return this.getMany<FireFlySubscriptionResponse[]>('/subscriptions', filter, options);
  }

  async replaceSubscription(sub: FireFlySubscriptionRequest): Promise<FireFlySubscriptionResponse> {
    return this.replaceOne<FireFlySubscriptionResponse>('/subscriptions', sub);
  }

  async deleteSubscription(subId: string) {
    await this.deleteOne(`/subscriptions/${subId}`);
  }

  async getData(id: string, options?: FireFlyGetOptions): Promise<FireFlyDataResponse | undefined> {
    return this.getOne<FireFlyDataResponse>(`/data/${id}`, options);
  }

  async getDataBlob(id: string, options?: FireFlyGetOptions): Promise<Stream> {
    const response = await this.wrapError(
      this.http.get<Stream>(`/data/${id}/blob`, {
        ...mapConfig(options),
        responseType: 'stream',
      }),
    );
    return response.data;
  }

  async uploadDataBlob(
    blob: string | Buffer | Readable,
    filename: string,
  ): Promise<FireFlyDataResponse> {
    const formData = new FormData();
    formData.append('autometa', 'true');
    formData.append('file', blob, { filename });
    const response = await this.wrapError(
      this.http.post<FireFlyDataResponse>('/data', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync(),
        },
      }),
    );
    return response.data;
  }

  async getBatches(
    filter?: FireFlyBatchFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyBatchResponse[]> {
    return this.getMany<FireFlyBatchResponse[]>(`/batches`, filter, options);
  }

  async getMessages(
    filter?: FireFlyMessageFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyMessageResponse[]> {
    return this.getMany<FireFlyMessageResponse[]>(`/messages`, filter, options);
  }

  async getMessage(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyMessageResponse | undefined> {
    return this.getOne<FireFlyMessageResponse>(`/messages/${id}`, options);
  }

  async sendBroadcast(
    message: FireFlyBroadcastMessageRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyMessageResponse> {
    return this.createOne<FireFlyMessageResponse>('/messages/broadcast', message, options);
  }

  async sendPrivateMessage(
    message: FireFlyPrivateMessageRequest,
    options?: FireFlyPrivateSendOptions,
  ): Promise<FireFlyMessageResponse> {
    const url = options?.requestReply ? '/messages/requestreply' : '/messages/private';
    return this.createOne<FireFlyMessageResponse>(url, message, options);
  }

  async createTokenPool(
    pool: FireFlyTokenPoolRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenPoolResponse> {
    return this.createOne<FireFlyTokenPoolResponse>('/tokens/pools', pool, options);
  }

  async getTokenPools(
    filter?: FireFlyTokenPoolFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenPoolResponse[]> {
    return this.getMany<FireFlyTokenPoolResponse[]>(`/tokens/pools`, filter, options);
  }

  async getTokenPool(
    nameOrId: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenPoolResponse | undefined> {
    return this.getOne<FireFlyTokenPoolResponse>(`/tokens/pools/${nameOrId}`, options);
  }

  async mintTokens(transfer: FireFlyTokenMintRequest, options?: FireFlyCreateOptions) {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/mint', transfer, options);
  }

  async transferTokens(
    transfer: FireFlyTokenTransferRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/transfers', transfer, options);
  }

  async burnTokens(
    transfer: FireFlyTokenBurnRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    return this.createOne<FireFlyTokenTransferResponse>('/tokens/burn', transfer, options);
  }

  async getTokenTransfers(
    filter?: FireFlyTokenTransferFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenTransferResponse[]> {
    return this.getMany<FireFlyTokenTransferResponse[]>(`/tokens/transfers`, filter, options);
  }

  async getTokenTransfer(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenTransferResponse | undefined> {
    return this.getOne<FireFlyTokenTransferResponse>(`/tokens/transfers/${id}`, options);
  }

  async getTokenBalances(
    filter?: FireFlyTokenBalanceFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenBalanceResponse[]> {
    return this.getMany<FireFlyTokenBalanceResponse[]>('/tokens/balances', filter, options);
  }

  async generateContractInterface(
    request: FireFlyContractGenerateRequest,
  ): Promise<FireFlyContractInterfaceRequest> {
    return this.createOne<FireFlyContractInterfaceRequest>(
      '/contracts/interfaces/generate',
      request,
    );
  }

  async createContractInterface(
    ffi: FireFlyContractInterfaceRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractInterfaceResponse> {
    return this.createOne<FireFlyContractInterfaceResponse>('/contracts/interfaces', ffi, options);
  }

  async getContractInterfaces(
    filter?: FireFlyContractInterfaceFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractInterfaceResponse[]> {
    return this.getMany<FireFlyContractInterfaceResponse[]>(
      '/contracts/interfaces',
      filter,
      options,
    );
  }

  async getContractInterface(
    id: string,
    fetchchildren?: boolean,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractInterfaceResponse | undefined> {
    return this.getOne<FireFlyContractInterfaceResponse>(`/contracts/interfaces/${id}`, options, {
      fetchchildren,
    });
  }

  async createContractAPI(
    api: FireFlyContractAPIRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractAPIResponse> {
    return this.createOne<FireFlyContractAPIResponse>('/apis', api, options);
  }

  async getContractAPIs(
    filter?: FireFlyContractAPIFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractAPIResponse[]> {
    return this.getMany<FireFlyContractAPIResponse[]>('/apis', filter, options);
  }

  async getContractAPI(
    name: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractAPIResponse | undefined> {
    return this.getOne<FireFlyContractAPIResponse>(`/apis/${name}`, options);
  }

  async invokeContract(
    request: FireFlyContractInvokeRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractInvokeResponse> {
    return this.createOne<FireFlyContractInvokeResponse>('/contracts/invoke', request, options);
  }

  async queryContract(
    request: FireFlyContractQueryRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractQueryResponse> {
    return this.createOne<FireFlyContractQueryResponse>('/contracts/query', request, options);
  }

  async invokeContractAPI(
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

  async queryContractAPI(
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

  async createContractListener(
    listener: FireFlyContractListenerRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyContractListenerResponse> {
    return this.createOne<FireFlyContractListenerResponse>(
      '/contracts/listeners',
      listener,
      options,
    );
  }

  async getContractListeners(
    filter?: FireFlyContractListenerFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractListenerResponse[]> {
    return this.getMany<FireFlyContractListenerResponse[]>('/contracts/listeners', filter, options);
  }

  async getContractAPIListeners(
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

  async createContractAPIListener(
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

  async getOperations(
    filter?: FireFlyOperationFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyOperationResponse[]> {
    return this.getMany<FireFlyOperationResponse[]>('/operations', filter, options);
  }

  async getOperation(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyOperationResponse | undefined> {
    return this.getOne<FireFlyOperationResponse>(`/operations/${id}`, options);
  }

  async getTransactions(
    filter?: FireFlyTransactionFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTransactionResponse[]> {
    return this.getMany<FireFlyTransactionResponse[]>('/transactions', filter, options);
  }

  async getTransaction(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTransactionResponse | undefined> {
    return this.getOne<FireFlyTransactionResponse>(`/transactions/${id}`, options);
  }

  listen(
    subscriptions: string | string[] | FireFlySubscriptionBase,
    callback: FireFlyWebSocketCallback,
  ): FireFlyWebSocket {
    const options: FireFlyWebSocketOptions = {
      host: this.options.websocket.host,
      namespace: this.options.namespace,
      username: this.options.username,
      password: this.options.password,
      subscriptions: [],
      autoack: false,
      reconnectDelay: this.options.websocket.reconnectDelay,
      heartbeatInterval: this.options.websocket.heartbeatInterval,
    };

    const handler: FireFlyWebSocketCallback = (socket, event) => {
      this.queue = this.queue.finally(() => callback(socket, event));
      this.queue.then(() => {
        socket.ack(event);
      });
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
