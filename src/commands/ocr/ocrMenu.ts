import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { buildOcrPayload, ocrImpl } from "./ocr";
import { defer, getImageUrlFromMessage } from "../../utils/functions";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("OCR")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const imageUrl = getImageUrlFromMessage(interaction.targetMessage);

    await defer(interaction);

    const { text, language, model } = await ocrImpl(imageUrl);
    const payload = buildOcrPayload(text, language, model);
    await interaction.editReply(payload);
  },
});
