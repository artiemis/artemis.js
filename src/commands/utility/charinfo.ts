import { bold, hyperlink, inlineCode, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { pluralize, shell } from "../../utils/functions";
import { abort } from "../../utils/error";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("charinfo")
    .setDescription("Unicode character info for given text")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text to get info for")
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString("text", true);
    const footer = pluralize(text.length, "character");

    const namesResult = await shell({
      input: text,
    })`python3 src/scripts/charinfo.py`;
    if (namesResult.failed) {
      abort("Failed to get character names");
    }

    const names = JSON.parse(namesResult.stdout) as string[];

    const description = text
      .split("")
      .map((char, i) => {
        const code = char.codePointAt(0)!.toString(16).toUpperCase();
        return `${inlineCode(char)} - ${inlineCode(
          "U+" + code.padStart(4, "0")
        )} - ${bold(
          hyperlink(
            names[i],
            `http://www.fileformat.info/info/unicode/char/${code}`
          )
        )}`;
      })
      .join("\n");

    if (description.length > 4096) {
      await interaction.reply({
        files: [
          {
            name: "charinfo.md",
            attachment: Buffer.from(`${description}\n\n${footer}`),
          },
        ],
      });
      return;
    }

    await interaction.reply({
      embeds: [
        {
          title: "Character Info",
          description,
          color: 0xfefefe,
          footer: {
            text: footer,
          },
        },
      ],
    });
  },
});
