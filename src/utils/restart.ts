import { Client, InteractionWebhook, MessageFlags } from "discord.js";
import { silently } from "./functions";
import { client } from "../client";
import { env } from "../env";
import { readFile, rm, writeFile } from "node:fs/promises";
import { log } from "./logger";

export async function restart(state: string) {
  log.info("Shutting down...");

  await writeFile("./data/temp/restart", state);

  await client.destroy();
  process.exit(0);
}

export async function maybeSendRestarted() {
  const restartToken = await silently(readFile("./data/temp/restart", "utf-8"));

  if (restartToken) {
    const webhook = new InteractionWebhook(
      client as Client<true>,
      env.APPLICATION_ID,
      restartToken
    );

    await webhook.send({
      content: "Successfully restarted!",
      flags: MessageFlags.Ephemeral,
    });

    await silently(rm("./data/temp/restart"));
  }
}
