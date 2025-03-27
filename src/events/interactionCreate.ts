import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  Events,
  inlineCode,
  MessageContextMenuCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { client } from "../client";
import { logger } from "../utils/logger";
import { defineEvent } from ".";
import { isExplicitCommandError, sendErrorAlert } from "../utils/error";
import { nanoid } from "../utils/functions";
import type { Command } from "../types/command";

const running = new Map<string, number>();
const getRunning = (command: string) => running.get(command) ?? 0;

export default defineEvent({
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (
      interaction.isChatInputCommand() ||
      interaction.isContextMenuCommand()
    ) {
      await handleChatInputCommand(interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
    }
  },
});

async function handleChatInputCommand(
  interaction:
    | ChatInputCommandInteraction
    | MessageContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
) {
  const command = client.commands.get(interaction.commandName) as Command<
    SlashCommandBuilder | ContextMenuCommandBuilder
  >;
  if (!command) return;

  if (command.isOwnerOnly && interaction.user.id !== client.ownerId) {
    await interaction.reply({
      content: "You do not have permission to use this command!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (command.maxConcurrency) {
    if (getRunning(command.data.name) >= command.maxConcurrency) {
      await interaction.reply({
        content: `This command can only be run ${command.maxConcurrency} times at a time.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    running.set(command.data.name, getRunning(command.data.name) + 1);
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    let content = isExplicitCommandError(err)
      ? err.message
      : "An unknown error occurred!";

    if (!isExplicitCommandError(err)) {
      const trace = nanoid();
      content += `\ntrace: ${inlineCode(trace)}`;
      logger.error({ trace, err });
      sendErrorAlert(err, {
        trace,
        command: command.data.name,
        user: `${interaction.user.id} (${interaction.user.tag})`,
      });
    }

    await interaction[
      interaction.replied || interaction.deferred ? "followUp" : "reply"
    ]({
      content,
    });
  } finally {
    if (command.maxConcurrency) {
      running.set(
        command.data.name,
        Math.max(0, getRunning(command.data.name) - 1)
      );
    }
  }
}

async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  if (command.autocomplete) {
    try {
      await command.autocomplete(interaction);
    } catch (err) {
      logger.error(err);
    }
  }
}
