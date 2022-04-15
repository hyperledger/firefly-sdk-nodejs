import { Stream, Readable } from 'stream';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as FormData from 'form-data';
import {
  FireFlyFilter,
  FireFlyOptions,
  FireFlyOptionsInput,
  FireFlyStatusResponse,
  FireFlyPrivateSendOptions,
  FireFlyCreateOptions,
  FireFlyGetOptions,
  FireFlyWebSocketOptions,
  FireFlySubscriptionBase,
  FireFlyBatchFilter,
  FireFlyContractGenerate,
  FireFlyContractInterface,
  FireFlyContractAPI,
  FireFlyContractListener,
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
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';

function isDefined<T>(obj: T | undefined | null): obj is T {
  return obj !== undefined && obj !== null;
}

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

export class InvalidDatatypeError extends Error {}

export default class FireFly {
  private options: FireFlyOptions;
  private rootHttp: AxiosInstance;
  private http: AxiosInstance;
  private queue = Promise.resolve();

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

  async getStatus(options?: FireFlyGetOptions): Promise<FireFlyStatusResponse> {
    const response = await this.rootHttp.get<FireFlyStatusResponse>('/status', mapConfig(options));
    return response.data;
  }

  async getOrganizations(
    filter?: FireFlyOrganizationFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyOrganizationResponse[]> {
    const response = await this.rootHttp.get<FireFlyOrganizationResponse[]>(
      '/network/organizations',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getNodes(
    filter?: FireFlyNodeFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyNodeResponse[]> {
    const response = await this.rootHttp.get<FireFlyNodeResponse[]>(
      '/network/nodes',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getVerifiers(
    namespace?: string,
    filter?: FireFlyVerifierFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyVerifierResponse[]> {
    namespace = namespace ?? this.options.namespace;
    const response = await this.rootHttp.get<FireFlyVerifierResponse[]>(
      `/namespaces/${namespace}/verifiers`,
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getDatatypes(
    filter?: FireFlyDatatypeFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatypeResponse[]> {
    const response = await this.http.get<FireFlyDatatypeResponse[]>(
      '/datatypes',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getDatatype(
    name: string,
    version: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatypeResponse | undefined> {
    const response = await this.http.get<FireFlyDatatypeResponse>(`/datatypes/${name}/${version}`, {
      ...mapConfig(options),
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async createDatatype(
    req: FireFlyDatatypeRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyDatatypeResponse> {
    const response = await this.http.post<FireFlyDatatypeResponse>(
      '/datatypes',
      req,
      mapConfig(options),
    );
    return response.data;
  }

  async getOrCreateDatatype(
    req: FireFlyDatatypeRequest,
    schema?: any,
  ): Promise<FireFlyDatatypeResponse> {
    if (req.name === undefined || req.version === undefined) {
      throw new InvalidDatatypeError('Datatype name and version are required');
    }
    const existing = await this.getDatatype(req.name, req.version);
    if (existing !== undefined) {
      if (isDefined(schema) || isDefined(existing.value)) {
        if (JSON.stringify(schema) !== JSON.stringify(existing.value)) {
          throw new InvalidDatatypeError(
            `Datatype for ${req.name}:${req.version} already exists, but schema does not match!`,
          );
        }
      }
      return existing;
    }
    const created = await this.createDatatype(req, { confirm: true });
    return created;
  }

  async getSubscriptions(
    filter?: FireFlySubscriptionFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlySubscriptionResponse[]> {
    const response = await this.http.get<FireFlySubscriptionResponse[]>(
      '/subscriptions',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async createOrUpdateSubscription(
    sub: FireFlySubscriptionRequest,
  ): Promise<FireFlySubscriptionResponse> {
    const response = await this.http.put<FireFlySubscriptionResponse>('/subscriptions', sub);
    return response.data;
  }

  async deleteSubscription(subId: string) {
    await this.http.delete(`/subscriptions/${subId}`);
  }

  async getData(id: string, options?: FireFlyGetOptions): Promise<FireFlyDataResponse> {
    const response = await this.http.get<FireFlyDataResponse>(`/data/${id}`, mapConfig(options));
    return response.data;
  }

  async getDataBlob(id: string, options?: FireFlyGetOptions): Promise<Stream> {
    const response = await this.http.get<Stream>(`/data/${id}/blob`, {
      ...mapConfig(options),
      responseType: 'stream',
    });
    return response.data;
  }

  async uploadDataBlob(
    blob: string | Buffer | Readable,
    filename: string,
  ): Promise<FireFlyDataResponse> {
    const formData = new FormData();
    formData.append('autometa', 'true');
    formData.append('file', blob, { filename });
    const response = await this.http.post<FireFlyDataResponse>('/data', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Length': formData.getLengthSync(),
      },
    });
    return response.data;
  }

  async getBatches(
    filter?: FireFlyBatchFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyBatchResponse[]> {
    const response = await this.http.get<FireFlyBatchResponse[]>(
      `/batches`,
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getMessages(
    filter?: FireFlyMessageFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyMessageResponse[]> {
    const response = await this.http.get<FireFlyMessageResponse[]>(
      `/messages`,
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getMessage(id: string): Promise<FireFlyMessageResponse> {
    const response = await this.http.get<FireFlyMessageResponse>(`/messages/${id}`);
    return response.data;
  }

  async sendBroadcast(
    message: FireFlyBroadcastMessageRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyMessageResponse> {
    const response = await this.http.post<FireFlyMessageResponse>(
      '/messages/broadcast',
      message,
      mapConfig(options),
    );
    return response.data;
  }

  async sendPrivateMessage(
    message: FireFlyPrivateMessageRequest,
    options?: FireFlyPrivateSendOptions,
  ): Promise<FireFlyMessageResponse> {
    const url = options?.requestReply ? '/messages/requestreply' : '/messages/private';
    const response = await this.http.post<FireFlyMessageResponse>(url, message, mapConfig(options));
    return response.data;
  }

  async createTokenPool(
    pool: FireFlyTokenPoolRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenPoolResponse> {
    const response = await this.http.post<FireFlyTokenPoolResponse>(
      '/tokens/pools',
      pool,
      mapConfig(options),
    );
    return response.data;
  }

  async getTokenPools(
    filter?: FireFlyTokenPoolFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenPoolResponse[]> {
    const response = await this.http.get<FireFlyTokenPoolResponse[]>(
      `/tokens/pools`,
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getTokenPool(nameOrId: string): Promise<FireFlyTokenPoolResponse | undefined> {
    const response = await this.http.get<FireFlyTokenPoolResponse>(`/tokens/pools/${nameOrId}`, {
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async mintTokens(transfer: FireFlyTokenMintRequest, options?: FireFlyCreateOptions) {
    const response = await this.http.post<FireFlyTokenTransferResponse>(
      '/tokens/mint',
      transfer,
      mapConfig(options),
    );
    return response.data;
  }

  async transferTokens(
    transfer: FireFlyTokenTransferRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    const response = await this.http.post<FireFlyTokenTransferResponse>(
      '/tokens/transfers',
      transfer,
      mapConfig(options),
    );
    return response.data;
  }

  async burnTokens(
    transfer: FireFlyTokenBurnRequest,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    const response = await this.http.post<FireFlyTokenTransferResponse>(
      '/tokens/burn',
      transfer,
      mapConfig(options),
    );
    return response.data;
  }

  async getTokenTransfer(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenTransferResponse> {
    const response = await this.http.get<FireFlyTokenTransferResponse>(
      `/tokens/transfers/${id}`,
      mapConfig(options),
    );
    return response.data;
  }

  async getTokenBalances(
    filter?: FireFlyTokenBalanceFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTokenBalanceResponse> {
    const response = await this.http.get<FireFlyTokenBalanceResponse>(
      '/tokens/balances',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async generateContractInterface(
    request: FireFlyContractGenerate,
  ): Promise<FireFlyContractInterface> {
    const response = await this.http.post<FireFlyContractInterface>(
      '/contracts/interfaces/generate',
      request,
    );
    return response.data;
  }

  async createContractInterface(ffi: FireFlyContractInterface): Promise<FireFlyContractInterface> {
    const response = await this.http.post<FireFlyContractInterface>('/contracts/interfaces', ffi);
    return response.data;
  }

  async getContractInterfaces(options?: FireFlyGetOptions): Promise<FireFlyContractInterface[]> {
    const response = await this.http.get<FireFlyContractInterface[]>(
      '/contracts/interfaces',
      mapConfig(options),
    );
    return response.data;
  }

  async getContractInterface(
    id: string,
    fetchchildren?: boolean,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractInterface | undefined> {
    const response = await this.http.get<FireFlyContractInterface>(`/contracts/interfaces/${id}`, {
      ...mapConfig(options, { fetchchildren }),
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async createContractAPI(api: FireFlyContractAPI): Promise<FireFlyContractAPI> {
    const response = await this.http.post<FireFlyContractAPI>('/apis', api);
    return response.data;
  }

  async getContractAPIs(options?: FireFlyGetOptions): Promise<FireFlyContractAPI[]> {
    const response = await this.http.get<FireFlyContractAPI[]>('/apis', mapConfig(options));
    return response.data;
  }

  async getContractAPI(
    name: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractAPI | undefined> {
    const response = await this.http.get<FireFlyContractAPI>(`/apis/${name}`, {
      ...mapConfig(options),
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async createContractListener(
    listener: Partial<FireFlyContractListener>,
  ): Promise<FireFlyContractListener> {
    const response = await this.http.post<FireFlyContractListener>(
      '/contracts/listeners',
      listener,
    );
    return response.data;
  }

  async getContractListeners(
    filter?: FireFlyContractListenerFilter & FireFlyFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractListener[]> {
    const response = await this.http.get<FireFlyContractListener[]>(
      '/contracts/listeners',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getContractAPIListeners(
    apiName: string,
    eventPath: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyContractListener[]> {
    const response = await this.http.get<FireFlyContractListener[]>(
      `/apis/${apiName}/listeners/${eventPath}`,
      mapConfig(options),
    );
    return response.data;
  }

  async createContractAPIListener(
    apiName: string,
    eventPath: string,
    listener: Partial<FireFlyContractListener>,
  ) {
    const response = await this.http.post<FireFlyContractListener>(
      `/apis/${apiName}/listeners/${eventPath}`,
      listener,
    );
    return response.data;
  }

  async getTransaction(
    id: string,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyTransactionResponse | undefined> {
    const response = await this.http.get<FireFlyTransactionResponse>(`/transactions/${id}`, {
      ...mapConfig(options),
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
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

export * from './interfaces';
