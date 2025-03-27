import {
  AttachmentBuilder,
  inlineCode,
  SlashCommandBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import { defineCommand } from "..";
import { downloadFile } from "../../utils/http";
import { abort, sendErrorAlert } from "../../utils/error";
import { yandexOcr } from "../../utils/yandex";
import sharp from "sharp";
import {
  capitalize,
  getImageUrlFromChatInteraction,
  languageCodeToName,
  run,
} from "../../utils/functions";
import { lensOcr } from "../../utils/lens";
import type { OCRResult } from "../../types/ocr";
import { logger } from "../../utils/logger";

export function buildOcrPayload(
  text: string,
  language: string,
  model: OCRResult["model"],
  image?: AttachmentBuilder
) {
  const languageName = languageCodeToName(language) ?? "Unknown";

  if (text.length > 4096) {
    return {
      content:
        `Detected language: ${inlineCode(languageName)}` +
        `\nOCR: ${inlineCode(capitalize(model))}`,
      files: [
        {
          name: "ocr.txt",
          attachment: Buffer.from(text),
        },
        ...(image ? [image] : []),
      ],
    } satisfies InteractionReplyOptions;
  }

  return {
    ...(image ? { files: [image] } : {}),
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
        author: {
          name: capitalize(model),
          icon_url: `https://www.google.com/s2/favicons?domain=${model}.com&sz=64`,
        },
        ...(image ? { image: { url: "attachment://image.jpg" } } : {}),
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
    abort("Not a valid image!");
  }

  const compressed = await sharp(data)
    .resize({ width: 1000, withoutEnlargement: true })
    .jpeg({ quality: 95 })
    .toBuffer();

  const result = await lensOcr(compressed)
    .catch(err => {
      logger.error(err, "Google Lens error, falling back to Yandex");
      sendErrorAlert(err, { mime: type.mime });
      return yandexOcr(compressed, type.mime);
    })
    .catch(() => abort("Failed to OCR the image"));

  if (!result.text) {
    result.text = "No text detected";
  }

  return {
    ...result,
    attachment: new AttachmentBuilder(compressed).setName("image.jpg"),
  };
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ocr")
    .setDescription("OCR an image using Google Lens or Yandex as fallback")
    .addAttachmentOption(option =>
      option.setName("image").setDescription("The image to OCR")
    )
    .addStringOption(option =>
      option.setName("url").setDescription("The image URL to OCR")
    ),

  async execute(interaction) {
    const imageUrl = getImageUrlFromChatInteraction(interaction);

    await interaction.deferReply();

    const { text, language, model, attachment } = await ocrImpl(imageUrl);
    const payload = buildOcrPayload(text, language, model, attachment);
    await interaction.editReply(payload);
  },
});
