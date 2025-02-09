import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";

export type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder;

type InferInteraction<B> = B extends
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
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
