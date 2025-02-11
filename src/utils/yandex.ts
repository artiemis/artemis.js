import yandexClient from "ya-ocr";
import type { OCRResult } from "../types/ocr";

const yandex = new yandexClient();

export async function yandexOcr(
  image: Buffer,
  mime: string
): Promise<OCRResult>;
export async function yandexOcr(url: string): Promise<OCRResult>;
export async function yandexOcr(
  resource: string | Buffer,
  mime?: string
): Promise<OCRResult> {
  let result;

  if (typeof resource === "string") {
    result = await yandex.scanByUrl(resource);
  } else {
    result = await yandex.scanByBlob(
      new Blob([resource], { type: mime }) as Blob
    );
  }

  return {
    text: result.text,
    language: result.detected_lang ?? "n/a",
    model: "yandex",
  };
}
