import { codeBlock, inlineCode, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { downloadFile } from "../../utils/http";
import { abort } from "../../utils/error";
import { yandexOcr } from "../../utils/api";

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

    const { data, type } = await downloadFile(attachment.url);
    if (!type?.mime.startsWith("image/")) {
      abort("The file must be an image!");
    }

    await interaction.deferReply();

    const { text, detected_lang } = await yandexOcr(data, type.mime);

    const languageName =
      new Intl.DisplayNames(["en"], { type: "language" }).of(
        detected_lang ?? "unknown"
      ) ?? "unknown";

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
