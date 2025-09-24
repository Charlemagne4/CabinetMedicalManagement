import pino from "pino";
export const logger = pino({
  level: "info",
  // add app metadata if you want
  base: { pid: false }, // remove pid if you prefer cleaner logs
  timestamp: pino.stdTimeFunctions.isoTime, // ISO timestamps
});
