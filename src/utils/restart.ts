import {
  Client,
  InteractionWebhook,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { silently } from "./functions";
import { client } from "../client";
import { env } from "../env";
import { readFile, rm, writeFile } from "node:fs/promises";
import { logger } from "./logger";

type RestartState = {
  token?: string;
  message?: {
    id: string;
    channelId: string;
  };
};

export async function restart(state: RestartState) {
  logger.info("Shutting down...");

  await writeFile("./data/temp/restart", JSON.stringify(state));

  await client.destroy();
  process.exit(0);
}

export async function maybeSendRestarted() {
  const content = await silently(readFile("./data/temp/restart", "utf-8"));
  if (!content) return;
  const state = JSON.parse(content) as RestartState;

  if (state.token) {
    const webhook = new InteractionWebhook(
      client as Client<true>,
      env.APPLICATION_ID,
      state.token
    );

    await silently(
      webhook.send({
        content: "Successfully restarted!",
        flags: MessageFlags.Ephemeral,
      })
    );
  } else if (state.message) {
    const channel = client.channels.cache.get(
      state.message.channelId
    ) as TextChannel;
    if (!channel) return;

    await silently(
      channel.messages.fetch(state.message.id).then((msg) => msg.react("☑️"))
    );
  }

  await silently(rm("./data/temp/restart"));
}
