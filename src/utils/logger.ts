import pino from "pino";
import { DEV } from "./constants";

export const logger = pino({
  level: "info",
  transport: DEV
    ? {
        target: "pino-pretty",
      }
    : undefined,
  base: undefined,
});
