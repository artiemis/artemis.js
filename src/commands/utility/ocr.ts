import { codeBlock, inlineCode, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { downloadFile } from "../../utils/http";
import { abort } from "../../utils/error";
import { yandexOcr } from "../../utils/ocr";
import sharp from "sharp";

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

    const { data, type } = await downloadFile(attachment.url);
    if (!type?.mime.startsWith("image/")) {
      abort("The file must be an image!");
    }

    const compressed = await sharp(data)
      .resize(1000)
      .jpeg({ quality: 90 })
      .toBuffer();

    const { text, detected_lang } = await yandexOcr(compressed, type.mime);

    const languageName =
      new Intl.DisplayNames(["en"], { type: "language" }).of(detected_lang) ??
      "unknown";

    const content = `Detected language: ${inlineCode(
      languageName
    )}\n${codeBlock(text)}`;

    if (content.length > 2000) {
      await interaction.editReply({
        content: `Detected language: ${inlineCode(languageName)}`,
        files: [
          {
            name: "ocr.txt",
            attachment: text,
          },
          attachment,
        ],
      });
      return;
    }

    await interaction.editReply({
      content,
      files: [attachment],
    });
  },
});
