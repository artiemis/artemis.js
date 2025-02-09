import { codeBlock, type TextChannel } from "discord.js";
import { client } from "../client";
import { env } from "../env";

export class ExplicitCommandError extends Error {}

export function abort(message: string): never {
  throw new ExplicitCommandError(message);
}

export function isExplicitCommandError(
  error: any
): error is ExplicitCommandError {
  return error instanceof ExplicitCommandError;
}

export function isCombinedError(error: any): error is { errors: any[] } {
  return typeof error === "object" && "errors" in error;
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
