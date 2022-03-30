import { Stream } from 'stream';
import axios, { AxiosInstance } from 'axios';
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
  FireFlyTokenPoolType,
  FireFlyTokensTransferInput,
  FireFlyTokenTransfer,
  FireFlyDataRef,
  FireFlyRequestOptions,
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';

function isDefined<T>(obj: T | undefined | null): obj is T {
  return obj !== undefined && obj !== null;
}

function isSuccess(status: number) {
  return status >= 200 && status < 300;
}

export class InvalidDatatypeError extends Error {}

export class FireFly {
  private options: FireFlyOptions;
  private rootHttp: AxiosInstance;
  private http: AxiosInstance;

  constructor(options: FireFlyOptionsInput) {
    this.options = this.setDefaults(options);
    this.rootHttp = axios.create({ baseURL: `${options.host}/api/v1` });
    this.http = axios.create({
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

  async getStatus(): Promise<FireFlyStatus> {
    const response = await this.rootHttp.get<FireFlyStatus>('/status');
    return response.data;
  }

  async getDatatypes(
    filter?: Partial<FireFlyDatatype> & FireFlyFilter,
  ): Promise<FireFlyDatatype[]> {
    const response = await this.http.get<FireFlyDatatype[]>('/datatypes', {
      params: filter,
    });
    return response.data;
  }

  async getDatatype(ref: FireFlyDatatypeRef): Promise<FireFlyDatatype | undefined> {
    const response = await this.http.get<FireFlyDatatype>(`/datatypes/${ref.name}/${ref.version}`, {
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
    const response = await this.http.post<FireFlyDatatype>('/datatypes', body, {
      params: options,
    });
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
  ): Promise<FireFlySubscription[]> {
    const response = await this.http.get<FireFlySubscription[]>('/subscriptions', {
      params: filter,
    });
    return response.data;
  }

  async createOrUpdateSubscription(sub: FireFlySubscriptionInput): Promise<FireFlySubscription> {
    const response = await this.http.put<FireFlySubscription>('/subscriptions', sub);
    return response.data;
  }

  async deleteSubscription(subId: string) {
    await this.http.delete(`/subscriptions/${subId}`);
  }

  async getData(id: string): Promise<FireFlyData> {
    const response = await this.http.get<FireFlyData>(`/data/${id}`);
    return response.data;
  }

  async getDataBlob(id: string): Promise<Stream> {
    const response = await this.http.get<Stream>(`/data/${id}/blob`, {
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
    options?: FireFlyRequestOptions,
  ): Promise<FireFlyMessage> {
    const response = await this.http.post<FireFlyMessage>('/messages/broadcast', message, {
      params: options,
    });
    return response.data;
  }

  async sendPrivateMessage(
    message: FireFlyMessageInput,
    options?: FireFlySendOptions,
  ): Promise<FireFlyMessage> {
    const url = options?.requestReply ? 'requestreply' : 'private';
    const response = await this.http.post<FireFlyMessage>(url, message);
    return response.data;
  }

  async createTokenPool(
    name: string,
    type: FireFlyTokenPoolType,
    options?: FireFlyRequestOptions,
  ): Promise<FireFlyTokenPool> {
    const response = await this.http.post<FireFlyTokenPool>(
      '/tokens/pools',
      { name, type },
      {
        params: options,
      },
    );
    return response.data;
  }

  async getTokenPool(nameOrId: string): Promise<FireFlyTokenPool | undefined> {
    const response = await this.http.get<FireFlyTokenPool>(`/tokens/pools/${nameOrId}`, {
      validateStatus: (status) => status === 404 || isSuccess(status),
    });
    return response.status === 404 ? undefined : response.data;
  }

  async mintTokens(transfer: FireFlyTokensTransferInput, options?: FireFlyRequestOptions) {
    const response = await this.http.post<FireFlyTokenTransfer>('/tokens/mint', transfer, {
      params: options,
    });
    return response.data;
  }

  async transferTokens(
    transfer: FireFlyTokensTransferInput,
    options?: FireFlyRequestOptions,
  ): Promise<FireFlyTokenTransfer> {
    const response = await this.http.post<FireFlyTokenTransfer>('/tokens/transfers', transfer, {
      params: options,
    });
    return response.data;
  }

  async burnTokens(
    transfer: FireFlyTokensTransferInput,
    options?: FireFlyRequestOptions,
  ): Promise<FireFlyTokenTransfer> {
    const response = await this.http.post<FireFlyTokenTransfer>('/tokens/burn', transfer, {
      params: options,
    });
    return response.data;
  }

  async getTokenTransfer(id: string): Promise<FireFlyTokenTransfer> {
    const response = await this.http.get<FireFlyTokenTransfer>(`/tokens/transfers/${id}`);
    return response.data;
  }

  listen(subName: string, callback: FireFlyWebSocketCallback): FireFlyWebSocket {
    return new FireFlyWebSocket(
      {
        host: this.options.websocket.host,
        namespace: this.options.namespace,
        subscriptionName: subName,
        username: this.options.username,
        password: this.options.password,
        reconnectDelay: this.options.websocket.reconnectDelay,
        heartbeatInterval: this.options.websocket.heartbeatInterval,
      },
      callback,
    );
  }
}
