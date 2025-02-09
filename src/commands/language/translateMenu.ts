import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { translateImpl } from "./translate";

export default defineCommand({
  data: new ContextMenuCommandBuilder()
    .setName("Translate to English")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const text = interaction.targetMessage.content;
    await interaction.deferReply();

    const payload = await translateImpl(text, null, "en-US");
    await interaction.editReply(payload);
  },
});
