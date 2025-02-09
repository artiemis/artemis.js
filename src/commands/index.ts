import type { Command, CommandBuilder } from "../types/command";

export function defineCommand<B extends CommandBuilder>(command: Command<B>) {
  return command;
}
