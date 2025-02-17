import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { STATUS_CODES } from "http";
import Fuse from "fuse.js";

const codes = Object.entries(STATUS_CODES).map(([code, reason]) => ({
  code,
  reason,
}));

const fuzzyCodes = new Fuse(codes, { keys: ["code", "reason"] });

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("httpcat")
    .setDescription("Sends a cat for the given HTTP code")
    .addIntegerOption(option =>
      option
        .setName("code")
        .setDescription("HTTP code")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const value = interaction.options.getFocused();
    if (!value) {
      await interaction.respond(
        codes
          .map(({ code, reason }) => ({
            name: `${code} - ${reason}`,
            value: +code,
          }))
          .slice(0, 25)
      );
      return;
    } else if (STATUS_CODES[value]) {
      await interaction.respond([
        { name: `${value} - ${STATUS_CODES[value]}`, value: +value },
      ]);
      return;
    }

    await interaction.respond(
      fuzzyCodes
        .search(interaction.options.getFocused())
        .map(({ item }) => ({
          name: `${item.code} - ${item.reason}`,
          value: +item.code,
        }))
        .slice(0, 25)
    );
  },

  async execute(interaction) {
    let code = interaction.options.getInteger("code", true);
    code = typeof STATUS_CODES[code] === "string" ? code : 404;
    await interaction.reply(`https://http.cat/${code}`);
  },
});
