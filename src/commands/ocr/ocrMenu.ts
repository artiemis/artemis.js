import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { buildOcrPayload, ocrImpl } from "./ocr";
import { getImageFromAttachmentOrString } from "../../utils/functions";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("OCR")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const attachment = interaction.targetMessage.attachments.first();
    const embed = interaction.targetMessage.embeds[0];

    const imageUrl = getImageFromAttachmentOrString(
      attachment,
      embed?.image?.url ||
        embed?.thumbnail?.url ||
        interaction.targetMessage.content
    );

    await interaction.deferReply();

    const { text, language, model } = await ocrImpl(imageUrl);
    const payload = buildOcrPayload(text, language, model);
    await interaction.editReply(payload);
  },
});
