import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { translateImpl } from "../language/translate";
import { ocrImpl } from "./ocr";
import { getImageFromAttachmentOrString } from "../../utils/functions";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("OCR and translate to English")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const attachment = interaction.targetMessage.attachments.first();
    const imageUrl = getImageFromAttachmentOrString(
      attachment,
      interaction.targetMessage.content
    );

    await interaction.deferReply();

    const { text, model } = await ocrImpl(imageUrl);
    const payload = await translateImpl(text, null, "en-US", model);
    await interaction.editReply(payload);
  },
});
