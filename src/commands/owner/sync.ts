import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { client } from "../../client";
import { defineCommand } from "..";
import { abort } from "../../utils/error";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("sync")
    .setDescription("Sync application commands"),
  isOwnerOnly: true,

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const counts = await client.syncCommands();

    if (!counts) {
      abort("No commands to sync");
    }

    const { guildCount, globalCount } = counts;

    await interaction.followUp({
      content: `Successfully synced ${guildCount} guild and ${globalCount} global application commands`,
    });
  },
});
