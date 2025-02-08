import * as cheerio from "cheerio";

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
