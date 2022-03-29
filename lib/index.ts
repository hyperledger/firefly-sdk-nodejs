import axios, { AxiosInstance } from 'axios';
import {
  FireFlyDatatype,
  FireFlyDatatypeCreate,
  FireFlyDatatypeOptions,
  FireFlyDatatypeRef,
  FireFlyStatus,
} from './interfaces';

const CREATE_TIMEOUT = 60000;

function isDefined<T>(obj: T | undefined | null): obj is T {
  return obj !== undefined && obj !== null;
}

export class InvalidDatatypeError extends Error {}

export class FireFly {
  private rootHttp: AxiosInstance;
  private http: AxiosInstance;

  constructor(url: string, namespace = 'default') {
    this.rootHttp = axios.create({ baseURL: `${url}/api/v1` });
    this.http = axios.create({ baseURL: `${url}/api/v1/namespaces/${namespace}` });
  }

  async getStatus(): Promise<FireFlyStatus> {
    const response = await this.rootHttp.get<FireFlyStatus>('/status');
    return response.data;
  }

  async getDatatypes(): Promise<FireFlyDatatype[]> {
    const response = await this.http.get<FireFlyDatatype[]>('/datatypes');
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
      params: { confirm: true, ...options },
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
    const created = await this.createDatatype(ref, schema);
    return created;
  }
}
