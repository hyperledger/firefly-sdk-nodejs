import { IncomingMessage } from 'http';
import { Transform } from 'stream';
import * as WebSocket from 'ws';
import { FireFlyEvent, FireFlyEphemeralSubscription, FireFlyWebSocketOptions } from './interfaces';
import Logger from './logger';

function buildEphemeralQueryParams(sub: FireFlyEphemeralSubscription) {
  const params = new URLSearchParams();
  params.append('ephemeral', 'true');
  params.append('namespace', sub.namespace);
  if (sub.filter?.events !== undefined) {
    params.append('filter.events', sub.filter.events);
  }
  return params.toString();
}

export interface FireFlyWebSocketCallback {
  (socket: FireFlyWebSocket, data: FireFlyEvent): void;
}

export class FireFlyWebSocket {
  private readonly logger = new Logger(FireFlyWebSocket.name);

  private socket?: WebSocket;
  private closed = false;
  private pingTimer?: NodeJS.Timeout;
  private disconnectTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  private disconnectDetected = false;

  constructor(
    private options: FireFlyWebSocketOptions,
    private callback: FireFlyWebSocketCallback,
  ) {
    this.connect();
  }

  private connect() {
    // Ensure we've cleaned up any old socket
    this.close();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      delete this.reconnectTimer;
    }

    let url = `${this.options.host}/ws`;
    if (this.options.ephemeral !== undefined) {
      url += '?' + buildEphemeralQueryParams(this.options.ephemeral);
    }

    const auth =
      this.options.username && this.options.password
        ? `${this.options.username}:${this.options.password}`
        : undefined;
    const socket = (this.socket = new WebSocket(url, {
      auth,
      handshakeTimeout: this.options.heartbeatInterval,
    }));
    this.closed = false;

    socket
      .on('open', () => {
        if (this.disconnectDetected) {
          this.disconnectDetected = false;
          this.logger.log('Connection restored');
        } else {
          this.logger.log('Connected');
        }
        this.schedulePing();
        for (const name of this.options.subscriptions) {
          socket.send(
            JSON.stringify({
              type: 'start',
              autoack: this.options.autoack,
              namespace: this.options.namespace,
              name,
            }),
          );
          this.logger.log(`Started listening on subscription ${this.options.namespace}:${name}`);
        }
      })
      .on('error', (err) => {
        this.logger.error('Error', err.stack);
      })
      .on('close', () => {
        if (this.closed) {
          this.logger.log('Closed');
        } else {
          this.disconnectDetected = true;
          this.reconnect('Closed by peer');
        }
      })
      .on('pong', () => {
        this.logger.debug(`WS received pong`);
        this.schedulePing();
      })
      .on('unexpected-response', (req, res: IncomingMessage) => {
        let responseData = '';
        res.pipe(
          new Transform({
            transform(chunk, encoding, callback) {
              responseData += chunk;
              callback();
            },
            flush: () => {
              this.reconnect(`FireFly connect error [${res.statusCode}]: ${responseData}`);
            },
          }),
        );
      })
      .on('message', (data: string) => {
        const event: FireFlyEvent = JSON.parse(data);
        this.callback(this, event);
      });
  }

  private clearPingTimers() {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      delete this.disconnectTimer;
    }
    if (this.pingTimer) {
      clearTimeout(this.pingTimer);
      delete this.pingTimer;
    }
  }

  private schedulePing() {
    this.clearPingTimers();
    this.disconnectTimer = setTimeout(
      () => this.reconnect('Heartbeat timeout'),
      Math.ceil(this.options.heartbeatInterval * 1.5), // 50% grace period
    );
    this.pingTimer = setTimeout(() => {
      this.logger.debug(`WS sending ping`);
      this.socket?.ping('ping', true, (err) => {
        if (err) this.reconnect(err.message);
      });
    }, this.options.heartbeatInterval);
  }

  private reconnect(msg: string) {
    if (!this.reconnectTimer) {
      this.close();
      this.logger.error(`Websocket closed: ${msg}`);
      this.reconnectTimer = setTimeout(() => this.connect(), this.options.reconnectDelay);
    }
  }

  ack(event: FireFlyEvent) {
    if (this.socket !== undefined && event.id !== undefined) {
      this.socket.send(
        JSON.stringify({
          type: 'ack',
          id: event.id,
          subscription: event.subscription,
        }),
      );
    }
  }

  close() {
    this.closed = true;
    this.clearPingTimers();
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e: any) {
        this.logger.warn(`Failed to clean up websocket: ${e.message}`);
      }
      this.socket = undefined;
    }
  }
}
