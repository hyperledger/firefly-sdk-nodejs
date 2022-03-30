import axios, { AxiosInstance } from 'axios';
import {
  FireFlyFilter,
  FireFlyDatatype,
  FireFlyDatatypeCreate,
  FireFlyDatatypeOptions,
  FireFlyDatatypeRef,
  FireFlyStatus,
  FireFlySubscription,
  FireFlyOptions,
  FireFlySubscriptionInput,
} from './interfaces';
import { FireFlyWebSocket, FireFlyWebSocketCallback } from './websocket';

const CREATE_TIMEOUT = 60000;
const WS_RECONNECT_TIMEOUT = process.env.WS_RECONNECT_TIMEOUT || '5000';
const WS_HEARTBEAT_INTERVAL = process.env.WS_HEARTBEAT_INTERVAL || '30000';

function isDefined<T>(obj: T | undefined | null): obj is T {
  return obj !== undefined && obj !== null;
}

export class InvalidDatatypeError extends Error {}

export class FireFly {
  readonly namespace: string;
  private rootHttp: AxiosInstance;
  private http: AxiosInstance;
  private reconnectDelay: number;
  private heartbeatInterval: number;

  constructor(private options: FireFlyOptions) {
    this.namespace = options.namespace ?? 'default';
    this.reconnectDelay = parseInt(WS_RECONNECT_TIMEOUT);
    this.heartbeatInterval = parseInt(WS_HEARTBEAT_INTERVAL);
    this.rootHttp = axios.create({ baseURL: `${options.host}/api/v1` });
    this.http = axios.create({ baseURL: `${options.host}/api/v1/namespaces/${this.namespace}` });
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
      timeout: CREATE_TIMEOUT,
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
        host: this.options.host.replace('http', 'ws'),
        namespace: this.namespace,
        subscriptionName: subName,
        username: this.options.username,
        password: this.options.password,
        reconnectDelay: this.reconnectDelay,
        heartbeatInterval: this.heartbeatInterval,
      },
      callback,
    );
  }
}
