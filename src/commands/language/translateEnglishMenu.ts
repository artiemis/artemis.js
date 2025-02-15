import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { translateImpl } from "./translate";
import { abort } from "../../utils/error";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("Translate to English")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const text = interaction.targetMessage.content;
    if (!text) abort("No text to translate");

    await interaction.deferReply();

    const payload = await translateImpl(text, null, "en-US");
    await interaction.editReply(payload);
  },
});
