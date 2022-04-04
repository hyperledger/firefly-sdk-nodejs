export default class Logger {
  constructor(private prefix: string) {}

  private formatMessage(message: string) {
    const now = new Date().toISOString();
    return `${now} [${this.prefix}] ${message}`;
  }

  log(message?: any, ...optionalParams: any[]): void {
    console.log(this.formatMessage(message), ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]): void {
    console.debug(this.formatMessage(message), ...optionalParams);
  }

  trace(message?: any, ...optionalParams: any[]): void {
    console.trace(this.formatMessage(message), ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    console.warn(this.formatMessage(message), ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    console.error(this.formatMessage(message), ...optionalParams);
  }
}
