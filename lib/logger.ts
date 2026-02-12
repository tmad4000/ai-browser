const LOG_SERVER = 'http://100.99.121.73:9999/log';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function send(level: LogLevel, message: string, data?: any) {
  const payload = JSON.stringify({ level, message, data, ts: Date.now() });
  console.log(`[${level}] ${message}`, data || '');
  fetch(LOG_SERVER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  }).catch(() => {}); // silently fail if server unreachable
}

export const logger = {
  info: (msg: string, data?: any) => send('info', msg, data),
  warn: (msg: string, data?: any) => send('warn', msg, data),
  error: (msg: string, data?: any) => send('error', msg, data),
  debug: (msg: string, data?: any) => send('debug', msg, data),
};

// Global error handler setup
export function installGlobalErrorHandler() {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    send('error', `GLOBAL ${isFatal ? 'FATAL' : 'ERROR'}: ${error.message}`, {
      stack: error.stack?.split('\n').slice(0, 5),
    });
    originalHandler(error, isFatal);
  });

  // Catch unhandled promise rejections
  const originalRejection = (globalThis as any).onunhandledrejection;
  (globalThis as any).onunhandledrejection = (event: any) => {
    send('error', `UNHANDLED REJECTION: ${event?.reason?.message || event?.reason}`, {
      stack: event?.reason?.stack?.split('\n').slice(0, 5),
    });
    if (originalRejection) originalRejection(event);
  };
}
