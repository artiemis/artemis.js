import { version } from "discord.js";
import { env } from "../env";

export const DEV = env.NODE_ENV === "development";
export const PROD = env.NODE_ENV === "production";

export const USER_AGENT = `artemis (discord.js ${version})`;
export const FAKE_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0";
