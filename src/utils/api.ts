import ky from "ky";
import { env } from "../env";
import { version } from "discord.js";

type OCRResult = {
  text: string;
  detected_lang?: string;
};

const client = ky.create({
  prefixUrl: env.API_URL,
  headers: {
    "User-Agent": `artemis (discord.js v${version})`,
    Authorization: `Bearer ${env.API_TOKEN}`,
  },
});

export async function yandexOcr(image: Buffer, mime: string) {
  const res = await client.post("ocr/yandex", {
    json: {
      file: image.toString("base64"),
      mime,
    },
  });
  return res.json<OCRResult>();
}
