import * as cheerio from "cheerio";
import { execa } from "execa";
import { customAlphabet } from "nanoid";
import { URL_REGEX } from "./constants";
import type { Attachment } from "discord.js";
import { abort } from "./error";

export const nanoid = customAlphabet("1234567890abcdef");
export const shell = execa({ reject: false });

export function noop() {}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
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

export function dedent(parts: TemplateStringsArray, ...values: unknown[]) {
  return parts
    .flatMap((part, i) =>
      i < values.length ? [part, String(values[i])] : [part]
    )
    .join("")
    .replace(/^ +/gm, "");
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

export function getImageFromAttachmentOrString(
  attachment?: Attachment | null,
  str?: string | null
) {
  if (attachment) {
    if (!attachment.contentType?.startsWith("image/")) {
      abort("The file must be an image!");
    }
    return attachment.url;
  } else if (str) {
    const match = findFirstUrl(str);
    if (!match) abort("The URL is invalid!");
    return match;
  } else {
    abort("You must provide an image or an image URL!");
  }
}
