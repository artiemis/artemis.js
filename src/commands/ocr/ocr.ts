import {
  codeBlock,
  hyperlink,
  inlineCode,
  SlashCommandBuilder,
  type InteractionEditReplyOptions,
} from "discord.js";
import { defineCommand } from "..";
import { downloadFile } from "../../utils/http";
import { abort } from "../../utils/error";
import { yandexOcr } from "../../utils/yandex";
import sharp from "sharp";
import { getImageFromAttachmentOrString, run } from "../../utils/functions";

export function buildOcrPayload(
  text: string,
  detected_lang: string,
  imageUrl?: string
): InteractionEditReplyOptions {
  const languageName = run(() => {
    try {
      return (
        new Intl.DisplayNames(["en"], { type: "language" }).of(detected_lang) ??
        "unknown"
      );
    } catch {
      return "unknown";
    }
  });

  const content =
    `Detected language: ${inlineCode(languageName)}\n${codeBlock(text)}` +
    (imageUrl ? `\n${hyperlink("Image", imageUrl)}` : "");

  if (content.length > 4096) {
    return {
      content:
        `Detected language: ${inlineCode(languageName)}` +
        (imageUrl ? `\n${hyperlink("Image", imageUrl)}` : ""),
      files: [
        {
          name: "ocr.txt",
          attachment: Buffer.from(text),
        },
      ],
    };
  }

  return {
    embeds: [
      {
        description: codeBlock(text),
        color: 0xffdb4d,
        fields: [
          {
            name: "Detected language",
            value: inlineCode(languageName),
          },
        ],
        ...(imageUrl ? { image: { url: imageUrl } } : {}),
        author: {
          name: "Yandex",
          icon_url:
            "https://www.google.com/s2/favicons?domain=yandex.com&sz=64",
        },
      },
    ],
  };
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
    abort("The file must be an image!");
  }

  const compressed = await sharp(data)
    .resize(1000)
    .jpeg({ quality: 90 })
    .toBuffer();

  const result = await yandexOcr(compressed, type.mime);
  if (!result.text) {
    result.text = "No text detected";
  }

  return result;
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ocr")
    .setDescription("OCR an image using Yandex")
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

    const result = await ocrImpl(imageUrl);
    const payload = buildOcrPayload(
      result.text,
      result.detected_lang,
      imageUrl
    );
    await interaction.editReply(payload);
  },
});
