import { bold, codeBlock } from "discord.js";
import { client } from "../client";

export class ExplicitCommandError extends Error {}

export function abort(message: string): never {
  throw new ExplicitCommandError(message);
}

export function isExplicitCommandError(
  error: any
): error is ExplicitCommandError {
  return error instanceof ExplicitCommandError;
}

export async function sendErrorAlert(
  error: any,
  meta?: Record<string, string | null | undefined>
) {
  const owner = await client.getOwner();
  const webhook = await client.getDevWebhook();

  return webhook.send({
    username: "artemis error",
    avatarURL: "https://files.catbox.moe/g52ano.png",
    allowedMentions: { users: [owner.id] },
    content:
      `${owner}\n` +
      (meta
        ? Object.entries(meta)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${bold(key)}: ${value}`)
            .join("\n")
        : ""),
    embeds: [
      {
        title: "Unhandled Error",
        description: codeBlock("js", error.stack ?? error.message),
        color: 0xff0000,
      },
    ],
  });
}
