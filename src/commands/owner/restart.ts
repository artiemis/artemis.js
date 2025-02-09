import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { restart } from "../../utils/restart";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restarts the bot"),
  isOwnerOnly: true,

  async execute(interaction) {
    await interaction.reply({
      content: "Restarting...",
      flags: MessageFlags.Ephemeral,
    });

    await restart({ token: interaction.token });
  },
});
