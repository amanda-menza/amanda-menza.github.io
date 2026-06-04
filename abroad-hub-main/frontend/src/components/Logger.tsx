import log from "loglevel";

log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "debug");

const logger = {
  debug: (...args: unknown[]) => log.debug(...args),
  info: (...args: unknown[]) => log.info(...args),
  warn: (...args: unknown[]) => log.warn(...args),
  error: (...args: unknown[]) => log.error(...args),
};

export default logger;
