import { createLogger, format, transports } from "winston";
import { DEV } from "./constants";
const { combine, simple, errors, prettyPrint } = format;

export const log = createLogger({
  level: "info",
  format: DEV
    ? combine(errors({ stack: true }), prettyPrint({ colorize: true }))
    : combine(errors({ stack: true }), simple()),
  transports: [new transports.Console()],
});
