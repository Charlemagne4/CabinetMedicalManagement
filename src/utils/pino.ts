import pino from "pino";

// Determine your environment
const isProduction = process.env.NODE_ENV === "production";

// Use env var override if you want to customize
const level = process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");

// Optionally, enable pretty printing in dev (for human-readable logs)
const transport = !isProduction
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    }
  : undefined;

export const logger = pino({
  level,
  base: { pid: false },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
});
