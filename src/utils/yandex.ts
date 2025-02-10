import yandexClient from "ya-ocr";
import type { ClientType } from "ya-ocr/types";

const yandex = new yandexClient();

export async function yandexOcr(
  image: Buffer,
  mime: string
): Promise<ClientType.OCRFullData>;
export async function yandexOcr(url: string): Promise<ClientType.OCRFullData>;
export async function yandexOcr(
  resource: string | Buffer,
  mime?: string
): Promise<ClientType.OCRFullData> {
  if (typeof resource === "string") {
    return yandex.scanByUrl(resource);
  }
  return yandex.scanByBlob(new Blob([resource], { type: mime }) as Blob);
}
