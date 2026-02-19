type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'color:#6b7280;font-weight:bold',
  info: 'color:#3b82f6;font-weight:bold',
  warn: 'color:#f59e0b;font-weight:bold',
  error: 'color:#ef4444;font-weight:bold',
};

class Logger {
  private readonly tag: string;

  constructor(namespace: string) {
    this.tag = `[Lensate:${namespace}]`;
  }

  private emit(level: LogLevel, ...args: unknown[]): void {
    // In production, suppress debug logs but keep warn/error
    if (!import.meta.env.DEV && level === 'debug') return;

    const style = LEVEL_STYLES[level];
    // eslint-disable-next-line no-console
    console[level](`%c${this.tag}`, style, ...args);
  }

  debug(...args: unknown[]) {
    this.emit('debug', ...args);
  }

  info(...args: unknown[]) {
    this.emit('info', ...args);
  }

  warn(...args: unknown[]) {
    this.emit('warn', ...args);
  }

  error(...args: unknown[]) {
    this.emit('error', ...args);
  }
}

/**
 * Create a namespaced logger for a module.
 *
 * @example
 * const log = createLogger('TranslationOrchestrator');
 * log.debug('Running with recipe', recipe);
 * log.error('Failed to translate', err);
 */
export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}
