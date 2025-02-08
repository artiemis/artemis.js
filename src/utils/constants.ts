import { env } from "../env";

export const DEV = env.NODE_ENV === "development";
export const PROD = env.NODE_ENV === "production";
