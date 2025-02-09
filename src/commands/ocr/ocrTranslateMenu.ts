import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import { translateImpl } from "../language/translate";
import { ocrImpl } from "./ocr";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("OCR and translate to English")
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

    const { text } = await ocrImpl(attachment);
    const payload = await translateImpl(text, null, "en-US");
    await interaction.editReply(payload);
  },
});
