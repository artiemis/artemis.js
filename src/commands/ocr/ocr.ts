import {
  Attachment,
  codeBlock,
  inlineCode,
  SlashCommandBuilder,
  type InteractionEditReplyOptions,
} from "discord.js";
import { defineCommand } from "..";
import { downloadFile } from "../../utils/http";
import { abort } from "../../utils/error";
import { yandexOcr } from "../../utils/yandex";
import sharp from "sharp";

export function buildOcrPayload(
  text: string,
  detected_lang: string,
  attachment?: Attachment
): InteractionEditReplyOptions {
  const languageName =
    new Intl.DisplayNames(["en"], { type: "language" }).of(detected_lang) ??
    "unknown";

  const content = `Detected language: ${inlineCode(languageName)}\n${codeBlock(
    text
  )}`;

  if (content.length > 2000) {
    return {
      content: `Detected language: ${inlineCode(languageName)}`,
      files: [
        {
          name: "ocr.txt",
          attachment: Buffer.from(text),
        },
        ...(attachment ? [attachment] : []),
      ],
    };
  }

  return {
    content,
    files: attachment ? [attachment] : [],
  };
}

export async function ocrImpl(attachment: Attachment) {
  const { data, type } = await downloadFile(attachment.url);
  if (!type?.mime.startsWith("image/")) {
    abort("The file must be an image!");
  }

  const compressed = await sharp(data)
    .resize(1000)
    .jpeg({ quality: 90 })
    .toBuffer();

  return yandexOcr(compressed, type.mime);
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ocr")
    .setDescription("OCR an image using Yandex")
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image to OCR")
        .setRequired(true)
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment("image", true);
    if (!attachment.contentType?.startsWith("image/")) {
      abort("The file must be an image!");
    }

    await interaction.deferReply();

    const result = await ocrImpl(attachment);
    const payload = buildOcrPayload(
      result.text,
      result.detected_lang,
      attachment
    );
    await interaction.editReply(payload);
  },
});
