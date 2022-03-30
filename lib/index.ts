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
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';

function isDefined<T>(obj: T | undefined | null): obj is T {
  return obj !== undefined && obj !== null;
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
      validateStatus: (status) => status === 404 || (status >= 200 && status < 300),
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
    const response = await this.http.post<FireFlyDatatype>('/datatypes', {
      params: options,
      data: body,
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
