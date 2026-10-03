/**
 * Logger centralizado
 * - Console en dev
 * - Sentry-ready en prod
 * - Integración automática con axios
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatTime(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: this.formatTime(),
    };

    this.logs.push(entry);

    // Mantener máximo 100 logs en memoria
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log en consola con formato
    this.logToConsole(entry);

    // En producción, enviar a Sentry
    if (!__DEV__) {
      this.logToSentry(entry);
    }
  }

  private logToConsole({ level, message, data, timestamp }: LogEntry) {
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "debug":
        console.debug(prefix, message, data);
        break;
      case "info":
        console.info(prefix, message, data);
        break;
      case "warn":
        console.warn(prefix, message, data);
        break;
      case "error":
        console.error(prefix, message, data);
        break;
    }
  }

  private logToSentry(entry: LogEntry) {
    // TODO: Implementar cuando Sentry esté configurado
    // Sentry.captureMessage(entry.message, entry.level);
  }

  debug(message: string, data?: any) {
    this.addLog("debug", message, data);
  }

  info(message: string, data?: any) {
    this.addLog("info", message, data);
  }

  warn(message: string, data?: any) {
    this.addLog("warn", message, data);
  }

  error(message: string, data?: any) {
    this.addLog("error", message, data);
  }

  /**
   * Obtiene últimos N logs (útil para debugging)
   */
  getLogs(limit: number = 10): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Exporta logs para envío a servidor
   */
  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpia todos los logs
   */
  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
