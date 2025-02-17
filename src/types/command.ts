import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";

export type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder;

type InferInteraction<B> = B extends
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  ? ChatInputCommandInteraction
  : B extends ContextMenuCommandBuilder
    ? MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction
    : never;

export interface Command<B extends CommandBuilder = SlashCommandBuilder> {
  data: B;
  execute(interaction: InferInteraction<B>): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
  category?: string;
  maxConcurrency?: number;
  isOwnerOnly?: boolean;
}
