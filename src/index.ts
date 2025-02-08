import { env } from "./env";
import { client } from "./client";
import { log } from "./utils/logger";
import { DiscordAPIError } from "discord.js";

process.on("unhandledRejection", (err) => {
  if (err instanceof DiscordAPIError && err.status >= 500) return;
  log.error("Unhandled Rejection", err);
});

process.on("uncaughtException", (err) => {
  log.error("Uncaught Exception, restarting...", err);
  process.exit(1);
});

await client.setup();
client.login(env.DISCORD_TOKEN);
