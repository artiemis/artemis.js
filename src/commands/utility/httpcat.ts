import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { STATUS_CODES } from "http";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("httpcat")
    .setDescription("Sends a cat for the given HTTP code")
    .addIntegerOption((option) =>
      option
        .setName("code")
        .setDescription("HTTP code")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    await interaction.respond(
      Object.keys(STATUS_CODES)
        .filter((code) =>
          code.startsWith(
            interaction.options.getInteger("code", true).toString()
          )
        )
        .map((code) => ({ name: code, value: +code }))
        .slice(0, 25)
    );
  },

  async execute(interaction) {
    let code = interaction.options.getInteger("code", true);
    code = typeof STATUS_CODES[code] === "string" ? code : 404;
    await interaction.reply(`https://http.cat/${code}`);
  },
});
