import * as cheerio from "cheerio";
import { execa } from "execa";
import { customAlphabet } from "nanoid";
import { URL_REGEX } from "./constants";
import {
  ChannelType,
  Message,
  MessageContextMenuCommandInteraction,
  MessageFlags,
  ModalSubmitInteraction,
  type ChatInputCommandInteraction,
  type MessageSnapshot,
} from "discord.js";
import { abort } from "./error";

export const nanoid = customAlphabet("1234567890abcdef");
export const shell = execa({ reject: false });
const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

export function noop() {}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function chunk<T>(arr: T[], size: number): T[][];
export function chunk(arr: string, size: number): string[];
export function chunk(arr: any, size: number): any[] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function stripHtml(html: string) {
  return cheerio.load(html).text();
}

export function pluralize(
  value: number,
  singular: string,
  plural = singular + "s"
) {
  return value === 1 ? `${value} ${singular}` : `${value} ${plural}`;
}

export function run<T>(fn: () => T): T {
  return fn();
}

export async function silently<T extends Promise<any>>(p?: T) {
  try {
    return await p;
  } catch {}
}

export function lazy<T>(cb: () => T) {
  let defaultValue: T;

  return () => (defaultValue ??= cb());
}

export function trim(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
}

export function findUrls(text: string) {
  return text.match(URL_REGEX) ?? [];
}

export function findFirstUrl(text: string) {
  return findUrls(text)[0];
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getImageUrlFromChatInteraction(
  interaction: ChatInputCommandInteraction,
  attachmentName = "image",
  urlName = "url"
) {
  const attachment = interaction.options.getAttachment(attachmentName);
  const url = interaction.options.getString(urlName);

  return (
    (attachment?.contentType?.startsWith("image/") && attachment.url) ||
    (url && findFirstUrl(url)) ||
    abort("You must provide a valid image or image URL!")
  );
}

export function getImageUrlFromMessage(message: Message): string {
  function extractImageUrl(message: Message | MessageSnapshot) {
    const attachment = message.attachments.first();

    return (
      (attachment?.contentType?.startsWith("image/") && attachment.url) ||
      message.embeds[0]?.image?.url ||
      message.embeds[0]?.thumbnail?.url ||
      findFirstUrl(message.content)
    );
  }

  if (message.messageSnapshots) {
    const snapshot = message.messageSnapshots.first();
    if (snapshot) {
      const url = extractImageUrl(snapshot);
      if (url) return url;
    }
  }

  return extractImageUrl(message) || abort("No valid image found!");
}

export function languageCodeToName(code: string) {
  try {
    return languageNames.of(code);
  } catch {
    return undefined;
  }
}

// deferReply helper with flag heuristics
export async function defer(
  interaction:
    | MessageContextMenuCommandInteraction
    | ModalSubmitInteraction
    | ChatInputCommandInteraction
) {
  const isDMBased = interaction.channel?.isDMBased();
  const isBotDM =
    isDMBased &&
    interaction.channel.type === ChannelType.DM &&
    interaction.channel.recipientId === interaction.client.user.id;

  await interaction.deferReply({
    flags: isDMBased && !isBotDM ? MessageFlags.Ephemeral : undefined,
  });
}
