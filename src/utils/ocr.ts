import yandexClient from "ya-ocr";

const yandex = new yandexClient();

export async function yandexOcr(image: Buffer, mime: string) {
  return yandex.scanByBlob(new Blob([image], { type: mime }) as Blob);
}
