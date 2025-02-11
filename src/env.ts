import { z } from "zod";

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  OWNER_ID: z.string(),
  APPLICATION_ID: z.string(),
  NODE_ENV: z
    .enum(["development", "production"])
    .optional()
    .default("development"),
  DEV_GUILD_ID: z.string(),
  DEV_CHANNEL_ID: z.string(),
  DEEPL_API_KEY: z.string(),
  GOOGLE_COOKIE: z.string(),
});

export const env = envSchema.parse(process.env);
