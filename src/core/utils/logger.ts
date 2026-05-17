const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[${timestamp()}] INFO:`, msg, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[${timestamp()}] WARN:`, msg, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[${timestamp()}] ERROR:`, msg, ...args),
};
