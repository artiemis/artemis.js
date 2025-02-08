import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { client } from "../../client";
import { defineCommand } from "..";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("sync")
    .setDescription("Sync application commands"),
  isOwnerOnly: true,

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const counts = await client.syncCommands();

    if (!counts) {
      await interaction.followUp({
        content: "No commands to sync",
      });
      return;
    }

    const { guildCount, globalCount } = counts;

    await interaction.followUp({
      content: `Successfully synced ${guildCount} guild and ${globalCount} global application commands`,
    });
  },
});
