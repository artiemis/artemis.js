import { codeBlock, type TextChannel } from "discord.js";
import { client } from "../client";
import { env } from "../env";

export class CommandError extends Error {}

export function isCommandError(error: any): error is CommandError {
  return error instanceof CommandError;
}

export async function notifyError(trace: string, error: any) {
  return (client.channels.cache.get(env.DEV_CHANNEL_ID) as TextChannel).send({
    content: trace,
    embeds: [
      {
        title: "Unhandled Error",
        description: codeBlock("js", error.stack ?? error.message),
        color: 0xff0000,
      },
    ],
  });
}
