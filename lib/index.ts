import { Stream } from 'stream';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  FireFlyFilter,
  FireFlyDatatype,
  FireFlyDatatypeCreate,
  FireFlyDatatypeOptions,
  FireFlyDatatypeRef,
  FireFlyOptions,
  FireFlyOptionsInput,
  FireFlyStatus,
  FireFlySubscription,
  FireFlySubscriptionInput,
  FireFlyData,
  FireFlyMessage,
  FireFlyMessageInput,
  FireFlySendOptions,
  FireFlyTokenPool,
  FireFlyTokensTransferInput,
  FireFlyTokenTransfer,
  FireFlyDataRef,
  FireFlyCreateOptions,
  FireFlyGetOptions,
  FireFlyTokenPoolInput,
  FireFlyWebSocketOptions,
  FireFlySubscriptionBase,
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

  async getStatus(options?: FireFlyGetOptions): Promise<FireFlyStatus> {
    const response = await this.rootHttp.get<FireFlyStatus>('/status', mapConfig(options));
    return response.data;
  }

  async getDatatypes(
    filter?: Partial<FireFlyDatatype> & FireFlyFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatype[]> {
    const response = await this.http.get<FireFlyDatatype[]>(
      '/datatypes',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async getDatatype(
    ref: FireFlyDatatypeRef,
    options?: FireFlyGetOptions,
  ): Promise<FireFlyDatatype | undefined> {
    const response = await this.http.get<FireFlyDatatype>(`/datatypes/${ref.name}/${ref.version}`, {
      ...mapConfig(options),
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async createDatatype(
    ref: FireFlyDatatypeRef,
    schema?: any,
    options?: FireFlyDatatypeOptions,
  ): Promise<FireFlyDatatype> {
    const body: FireFlyDatatypeCreate = {
      name: ref.name,
      version: ref.version,
      validator: options?.validator ?? 'json',
      value: schema,
    };
    const response = await this.http.post<FireFlyDatatype>('/datatypes', body, mapConfig(options));
    return response.data;
  }

  async getOrCreateDatatype(ref: FireFlyDatatypeRef, schema?: any): Promise<FireFlyDatatype> {
    const existing = await this.getDatatype(ref);
    if (existing !== undefined) {
      if (isDefined(schema) || isDefined(existing.value)) {
        if (JSON.stringify(schema) !== JSON.stringify(existing.value)) {
          throw new InvalidDatatypeError(
            `Datatype for ${ref.name}:${ref.version} already exists, but schema does not match!`,
          );
        }
      }
      return existing;
    }
    const created = await this.createDatatype(ref, schema, { confirm: true });
    return created;
  }

  async getSubscriptions(
    filter?: Partial<FireFlySubscription> & FireFlyFilter,
    options?: FireFlyGetOptions,
  ): Promise<FireFlySubscription[]> {
    const response = await this.http.get<FireFlySubscription[]>(
      '/subscriptions',
      mapConfig(options, filter),
    );
    return response.data;
  }

  async createOrUpdateSubscription(sub: FireFlySubscriptionInput): Promise<FireFlySubscription> {
    const response = await this.http.put<FireFlySubscription>('/subscriptions', sub);
    return response.data;
  }

  async deleteSubscription(subId: string) {
    await this.http.delete(`/subscriptions/${subId}`);
  }

  async getData(id: string, options?: FireFlyGetOptions): Promise<FireFlyData> {
    const response = await this.http.get<FireFlyData>(`/data/${id}`, mapConfig(options));
    return response.data;
  }

  async getDataBlob(id: string, options?: FireFlyGetOptions): Promise<Stream> {
    const response = await this.http.get<Stream>(`/data/${id}/blob`, {
      ...mapConfig(options),
      responseType: 'stream',
    });
    return response.data;
  }

  async createDataBlob(formData: FormData, headers: any): Promise<FireFlyDataRef> {
    const response = await this.http.post<FireFlyDataRef>('/data', formData, {
      headers,
    });
    return response.data;
  }

  async getMessage(id: string): Promise<FireFlyMessage> {
    const response = await this.http.get<FireFlyMessage>(`/messages/${id}`);
    return response.data;
  }

  async sendBroadcast(
    message: FireFlyMessageInput,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyMessage> {
    const response = await this.http.post<FireFlyMessage>(
      '/messages/broadcast',
      message,
      mapConfig(options),
    );
    return response.data;
  }

  async sendPrivateMessage(
    message: FireFlyMessageInput,
    options?: FireFlySendOptions,
  ): Promise<FireFlyMessage> {
    const url = options?.requestReply ? 'requestreply' : 'private';
    const response = await this.http.post<FireFlyMessage>(url, message, mapConfig(options));
    return response.data;
  }

  async createTokenPool(
    pool: FireFlyTokenPoolInput,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenPool> {
    const response = await this.http.post<FireFlyTokenPool>(
      '/tokens/pools',
      pool,
      mapConfig(options),
    );
    return response.data;
  }

  async getTokenPool(nameOrId: string): Promise<FireFlyTokenPool | undefined> {
    const response = await this.http.get<FireFlyTokenPool>(`/tokens/pools/${nameOrId}`, {
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async mintTokens(transfer: FireFlyTokensTransferInput, options?: FireFlyCreateOptions) {
    const response = await this.http.post<FireFlyTokenTransfer>(
      '/tokens/mint',
      transfer,
      mapConfig(options),
    );
    return response.data;
  }

  async transferTokens(
    transfer: FireFlyTokensTransferInput,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransfer> {
    const response = await this.http.post<FireFlyTokenTransfer>(
      '/tokens/transfers',
      transfer,
      mapConfig(options),
    );
    return response.data;
  }

  async burnTokens(
    transfer: FireFlyTokensTransferInput,
    options?: FireFlyCreateOptions,
  ): Promise<FireFlyTokenTransfer> {
    const response = await this.http.post<FireFlyTokenTransfer>(
      '/tokens/burn',
      transfer,
      mapConfig(options),
    );
    return response.data;
  }

  async getTokenTransfer(id: string, options?: FireFlyGetOptions): Promise<FireFlyTokenTransfer> {
    const response = await this.http.get<FireFlyTokenTransfer>(
      `/tokens/transfers/${id}`,
      mapConfig(options),
    );
    return response.data;
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
