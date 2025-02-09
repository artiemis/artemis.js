import { codeBlock, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import ky from "ky";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Look up IP or domain info")
    .addStringOption((option) =>
      option.setName("query").setDescription("IP or domain").setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query", true);
    await interaction.deferReply();

    const res = await ky
      .get(`http://ip-api.com/json/${encodeURIComponent(query)}`)
      .json();

    await interaction.editReply(codeBlock("js", JSON.stringify(res, null, 2)));
  },
});
