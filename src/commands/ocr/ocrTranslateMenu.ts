import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { translateImpl } from "../language/translate";
import { ocrImpl } from "./ocr";
import { getImageFromAttachmentOrString } from "../../utils/functions";
import { buildTranslateModal } from "../language/translateMenu";
import { abort } from "../../utils/error";
import { findFuzzyLanguage } from "../../utils/deepl";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("OCR and translate...")
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

    const modal = buildTranslateModal();
    await interaction.showModal(modal);

    await interaction
      .awaitModalSubmit({
        filter: (i) => i.customId === "translate-modal",
        time: 60000 * 5,
      })
      .then(async (interaction) => {
        await interaction.deferReply();

        const sourceField =
          interaction.fields.getTextInputValue("source") || null;
        const targetField =
          interaction.fields.getTextInputValue("target") || "en-US";

        const source =
          sourceField === null
            ? sourceField
            : await findFuzzyLanguage(sourceField, "source").then(
                (l) => l?.code
              );
        const target =
          targetField === "en-US"
            ? targetField
            : await findFuzzyLanguage(targetField, "target").then(
                (l) => l?.code
              );

        if (source === undefined) {
          abort("Source language not found");
        }
        if (!target) {
          abort("Target language not found");
        }

        const { text, model } = await ocrImpl(imageUrl);
        const payload = await translateImpl(text, source, target, model);
        await interaction.editReply(payload);
      });
  },
});
