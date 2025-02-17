import {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  type ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import { translateImpl } from "./translate";
import { findFuzzyLanguage } from "../../utils/deepl";

export function buildTranslateModal() {
  return new ModalBuilder()
    .setTitle("Translate")
    .setCustomId("translate-modal")
    .addComponents(
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Source language")
          .setCustomId("source")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(20)
          .setPlaceholder("en, pl, hungarian, japanese...")
          .setRequired(false)
      ),
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setLabel("Target language")
          .setCustomId("target")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(20)
          .setPlaceholder("en, pl, hungarian, japanese...")
          .setRequired(false)
      )
    );
}

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("Translate...")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const text = interaction.targetMessage.content;
    if (!text) abort("No text to translate");

    const modal = buildTranslateModal();
    await interaction.showModal(modal);

    await interaction
      .awaitModalSubmit({
        filter: i => i.customId === "translate-modal",
        time: 60000 * 5,
      })
      .then(async interaction => {
        await interaction.deferReply();

        const sourceField =
          interaction.fields.getTextInputValue("source") || "auto";
        const targetField =
          interaction.fields.getTextInputValue("target") || "en-US";

        const source =
          sourceField === "auto"
            ? null
            : await findFuzzyLanguage(sourceField, "source").then(l => l?.code);
        const target =
          targetField === "en-US"
            ? targetField
            : await findFuzzyLanguage(targetField, "target").then(l => l?.code);

        if (source === undefined) {
          abort("Source language not found");
        }
        if (!target) {
          abort("Target language not found");
        }

        const payload = await translateImpl(text, source, target);
        await interaction.editReply(payload);
      });
  },
});
