import {
  hyperlink,
  inlineCode,
  SlashCommandBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import { defineCommand } from "..";
import { downloadFile } from "../../utils/http";
import { abort } from "../../utils/error";
import { yandexOcr } from "../../utils/yandex";
import sharp from "sharp";
import {
  capitalize,
  getImageFromAttachmentOrString,
  languageCodeToName,
  run,
} from "../../utils/functions";
import { lensOcr } from "../../utils/lens";
import type { OCRResult } from "../../types/ocr";

export function buildOcrPayload(
  text: string,
  language: string,
  model: OCRResult["model"],
  imageUrl?: string
) {
  const languageName = languageCodeToName(language) ?? "Unknown";

  if (text.length > 4096) {
    return {
      content:
        `Detected language: ${inlineCode(languageName)}` +
        `\nOCR: ${inlineCode(capitalize(model))}` +
        (imageUrl ? `\n${hyperlink("Image", imageUrl)}` : ""),
      files: [
        {
          name: "ocr.txt",
          attachment: Buffer.from(text),
        },
      ],
    } satisfies InteractionReplyOptions;
  }

  return {
    embeds: [
      {
        description: text,
        color: model === "yandex" ? 0xffdb4d : 0x4285f4,
        fields:
          text !== "No text detected"
            ? [
                {
                  name: "Detected language",
                  value: languageName,
                },
              ]
            : [],
        ...(imageUrl ? { image: { url: imageUrl } } : {}),
        author: {
          name: capitalize(model),
          icon_url: `https://www.google.com/s2/favicons?domain=${model}.com&sz=64`,
        },
      },
    ],
  } satisfies InteractionReplyOptions;
}

export async function ocrImpl(url: string) {
  const { data, type } = await run(async () => {
    try {
      return await downloadFile(url);
    } catch {
      abort("Failed to download the image");
    }
  });

  if (!type?.mime.startsWith("image/")) {
    console.log(type, url);
    abort("The file must be an image!");
  }

  const compressed = await sharp(data)
    .resize(1000)
    .jpeg({ quality: 90 })
    .toBuffer();

  const result = await lensOcr(compressed)
    .catch(() => yandexOcr(compressed, type.mime))
    .catch(() => abort("Failed to OCR the image"));

  if (!result.text) {
    result.text = "No text detected";
  }

  return result;
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ocr")
    .setDescription("OCR an image using Google Lens or Yandex as fallback")
    .addAttachmentOption((option) =>
      option.setName("image").setDescription("The image to OCR")
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("The image URL to OCR")
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment("image");
    const url = interaction.options.getString("url");
    const imageUrl = getImageFromAttachmentOrString(attachment, url);

    await interaction.deferReply();

    const { text, language, model } = await ocrImpl(imageUrl);
    const payload = buildOcrPayload(text, language, model, imageUrl);
    await interaction.editReply(payload);
  },
});
