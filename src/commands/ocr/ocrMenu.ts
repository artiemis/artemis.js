import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import { buildOcrPayload, ocrImpl } from "./ocr";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("OCR")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const attachment = interaction.targetMessage.attachments.first();
    if (!attachment) {
      abort("No attachment found");
    }
    if (!attachment.contentType?.startsWith("image/")) {
      abort("The file must be an image!");
    }

    await interaction.deferReply();

    const result = await ocrImpl(attachment);
    const payload = buildOcrPayload(result.text, result.detected_lang);
    await interaction.editReply(payload);
  },
});
