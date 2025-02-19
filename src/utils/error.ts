import { codeBlock } from "discord.js";
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

export async function sendErrorAlert(error: any, trace?: string) {
  return client.getOwner().then(owner =>
    owner.send({
      content: trace,
      embeds: [
        {
          title: "Unhandled Error",
          description: codeBlock("js", error.stack ?? error.message),
          color: 0xff0000,
        },
      ],
    })
  );
}
