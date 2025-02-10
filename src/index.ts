import { env } from "./env";
import { client } from "./client";
import { logger } from "./utils/logger";
import { DiscordAPIError } from "discord.js";

process.on("unhandledRejection", (err) => {
  if (err instanceof DiscordAPIError && err.status >= 500) return;
  logger.error(err);
});

process.on("uncaughtException", (err) => {
  logger.error(err);
  process.exit(1);
});

await client.setup();
client.login(env.DISCORD_TOKEN);
