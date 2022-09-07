import Logger from '../lib/logger';
import { spy, assert, SinonSpy } from 'sinon';

describe('logger', () => {

  let errorSpy: SinonSpy;
  let warnSpy: SinonSpy;
  let logSpy: SinonSpy;
  let infoSpy: SinonSpy;
  let debugSpy: SinonSpy;
  let traceSpy: SinonSpy;

  beforeEach(() => {
    errorSpy = spy(console, 'error');
    warnSpy = spy(console, 'warn');
    logSpy = spy(console, 'log');
    infoSpy = spy(console, 'info');
    debugSpy = spy(console, 'debug');
    traceSpy = spy(console, 'trace');
  });

  afterEach(() => {
    errorSpy.restore();
    warnSpy.restore();
    logSpy.restore();
    infoSpy.restore();
    debugSpy.restore();
    traceSpy.restore();
  });

  it('level NONE', () => {
    process.env.FF_SDK_LOG_LEVEL = 'NONE';
    const logger = new Logger('test');
    submit(logger);
    assert.notCalled(errorSpy);
    assert.notCalled(warnSpy);
    assert.notCalled(logSpy);
    assert.notCalled(infoSpy);
    assert.notCalled(debugSpy);
    assert.notCalled(traceSpy);
  });

  it('level ERROR', () => {
    process.env.FF_SDK_LOG_LEVEL = 'ERROR';
    const logger = new Logger('test');
    submit(logger);
    assert.called(errorSpy);
    assert.notCalled(warnSpy);
    assert.notCalled(logSpy);
    assert.notCalled(infoSpy);
    assert.notCalled(debugSpy);
    assert.notCalled(traceSpy);
  });

  it('level WARN', () => {
    process.env.FF_SDK_LOG_LEVEL = 'WARN';
    const logger = new Logger('test');
    submit(logger);
    assert.called(errorSpy);
    assert.called(warnSpy);
    assert.notCalled(logSpy);
    assert.notCalled(infoSpy);
    assert.notCalled(debugSpy);
    assert.notCalled(traceSpy);
  });

  it('level LOG', () => {
    process.env.FF_SDK_LOG_LEVEL = 'LOG';
    const logger = new Logger('test');
    submit(logger);
    assert.called(errorSpy);
    assert.called(warnSpy);
    assert.called(logSpy);
    assert.notCalled(infoSpy);
    assert.notCalled(debugSpy);
    assert.notCalled(traceSpy);
  });

  it('level INFO', () => {
    process.env.FF_SDK_LOG_LEVEL = 'INFO';
    const logger = new Logger('test');
    submit(logger);
    assert.called(errorSpy);
    assert.called(warnSpy);
    assert.called(logSpy);
    assert.called(infoSpy);
    assert.notCalled(debugSpy);
    assert.notCalled(traceSpy);
  });

  it('level DEBUG', () => {
    process.env.FF_SDK_LOG_LEVEL = 'DEBUG';
    const logger = new Logger('test');
    submit(logger);
    assert.called(errorSpy);
    assert.called(warnSpy);
    assert.called(logSpy);
    assert.called(infoSpy);
    assert.called(debugSpy);
    assert.notCalled(traceSpy);
  });

  it('level TRACE', () => {
    process.env.FF_SDK_LOG_LEVEL = 'TRACE';
    const logger = new Logger('test');
    submit(logger);
    assert.called(errorSpy);
    assert.called(warnSpy);
    assert.called(logSpy);
    assert.called(infoSpy);
    assert.called(debugSpy);
    assert.called(traceSpy);
  });

  function submit(logger: Logger) {
    logger.error('error');
    logger.warn('warn');
    logger.log('log');
    logger.info('info');
    logger.debug('debug');
    logger.trace('trace');
  }

});
