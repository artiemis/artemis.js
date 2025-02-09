import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Events,
  inlineCode,
  MessageFlags,
} from "discord.js";
import { client } from "../client";
import { log } from "../utils/logger";
import { defineEvent } from ".";
import { isExplicitCommandError, notifyError } from "../utils/error";
import { nanoid } from "../utils/functions";

const running = new Map<string, number>();
const getRunning = (command: string) => running.get(command) ?? 0;

export default defineEvent({
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      await handleChatInputCommand(interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
    }
  },
});

async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction
) {
  const command = client.commands.get(interaction.commandName);
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
      log.error("Unhandled Command Error", { trace, err });
      notifyError(trace, err);
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
      log.error("Autocomplete Error", err);
    }
  }
}
