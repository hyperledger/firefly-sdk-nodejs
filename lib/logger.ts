enum logLevels {
  LEVEL_NONE,
  LEVEL_ERROR,
  LEVEL_WARN,
  LEVEL_LOG,
  LEVEL_INFO,
  LEVEL_DEBUG,
  LEVEL_TRACE
}

export default class Logger {

  private logLevel = logLevels.LEVEL_LOG;

  constructor(private prefix: string) {
    switch (process.env.FF_SDK_LOG_LEVEL) {
      case 'NONE': this.logLevel = logLevels.LEVEL_NONE; break;
      case 'ERROR': this.logLevel = logLevels.LEVEL_ERROR; break;
      case 'WARN': this.logLevel = logLevels.LEVEL_WARN; break;
      case 'LOG': this.logLevel = logLevels.LEVEL_LOG; break;
      case 'INFO': this.logLevel = logLevels.LEVEL_INFO; break;
      case 'DEBUG': this.logLevel = logLevels.LEVEL_DEBUG; break;
      case 'TRACE': this.logLevel = logLevels.LEVEL_TRACE; break;
    }
  }

  private formatMessage(message: string) {
    const now = new Date().toISOString();
    return `${now} [${this.prefix}] ${message}`;
  }

  error(message?: any, ...optionalParams: any[]): void {
    this.logLevel >= logLevels.LEVEL_ERROR && console.error(this.formatMessage(message), ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    this.logLevel >= logLevels.LEVEL_WARN && console.warn(this.formatMessage(message), ...optionalParams);
  }

  log(message?: any, ...optionalParams: any[]): void {
    this.logLevel >= logLevels.LEVEL_LOG && console.log(this.formatMessage(message), ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]): void {
    this.logLevel >= logLevels.LEVEL_INFO && console.info(this.formatMessage(message), ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]): void {
    this.logLevel >= logLevels.LEVEL_DEBUG && console.debug(this.formatMessage(message), ...optionalParams);
  }

  trace(message?: any, ...optionalParams: any[]): void {
    this.logLevel >= logLevels.LEVEL_TRACE && console.trace(this.formatMessage(message), ...optionalParams);
  }

}
