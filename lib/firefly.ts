import { Stream, Readable } from 'stream';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import {
  FireFlyOptions,
  FireFlyOptionsInput,
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
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';

function isSuccess(status: number) {
  return status >= 200 && status < 300;
}

function mapConfig(
  options: FireFlyGetOptions | FireFlyCreateOptions | undefined,
  params?: any,
): AxiosRequestConfig {
  return {
    ...options?.requestConfig,
    params: {
      ...params,
      confirm: options?.confirm,
    },
  };
}

export class FireFlyError extends Error {}

export default class FireFly {
  private options: FireFlyOptions;
  private rootHttp: AxiosInstance;
  private http: AxiosInstance;
  private queue = Promise.resolve();
  private errorHandler?: (err: FireFlyError) => void;

  constructor(options: FireFlyOptionsInput) {
    this.options = this.setDefaults(options);
    this.rootHttp = axios.create({
      ...options.requestConfig,
      baseURL: `${options.host}/api/v1`,
    });
    this.http = axios.create({
      ...options.requestConfig,
      baseURL: `${options.host}/api/v1/namespaces/${this.options.namespace}`,
    });
  }

  private setDefaults(options: FireFlyOptionsInput): FireFlyOptions {
    return {
      ...options,
      namespace: options.namespace ?? 'default',
      websocket: {
        ...options.websocket,
        host: options.websocket?.host ?? options.host.replace('http', 'ws'),
        reconnectDelay: options.websocket?.reconnectDelay ?? 5000,
        heartbeatInterval: options.websocket?.heartbeatInterval ?? 30000,
      },
    };
  }

  private async wrapError<T>(response: Promise<AxiosResponse<T>>) {
    return response.catch((err) => {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error;
        const ffError = new FireFlyError(errorMessage ?? err.message);
        if (this.errorHandler !== undefined) {
          this.errorHandler(ffError);
        }
        throw ffError;
      }
      throw err;
    });
  }

  private async getMany<T>(url: string, params?: any, options?: FireFlyGetOptions, root = false) {
    const http = root ? this.rootHttp : this.http;
    const response = await this.wrapError(http.get<T>(url, mapConfig(options, params)));
    return response.data;
  }

  private async getOne<T>(url: string, options?: FireFlyGetOptions, params?: any, root = false) {
    const http = root ? this.rootHttp : this.http;
    const response = await this.wrapError(
      http.get<T>(url, {
        ...mapConfig(options, params),
        validateStatus: (status) => status === 404 || isSuccess(status),
      }),
    );
    return response.status === 404 ? undefined : response.data;
  }

  private async createOne<T>(url: string, data: any, options?: FireFlyCreateOptions) {
    const response = await this.wrapError(this.http.post<T>(url, data, mapConfig(options)));
    return response.data;
  }

  private async replaceOne<T>(url: string, data: any) {
    const response = await this.wrapError(this.http.put<T>(url, data));
    return response.data;
  }

  private async deleteOne<T>(url: string) {
    await this.wrapError(this.http.delete<T>(url));
  }

  onError(handler: (err: FireFlyError) => void) {
    this.errorHandler = handler;
  }

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

  async getTokenTransfer(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenTransferResponse | undefined> {
    return this.getOne<FireFlyTokenTransferResponse>(`/tokens/transfers/${id}`, options);
  }

  async getTokenBalances(
    filter?: FireFlyTokenBalanceFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenBalanceResponse> {
    return this.getMany<FireFlyTokenBalanceResponse>('/tokens/balances', filter, options);
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
      this.queue = this.queue.finally(() => {
        callback(socket, event);
      });
      this.queue.finally(() => {
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
