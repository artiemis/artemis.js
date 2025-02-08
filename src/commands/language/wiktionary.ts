import {
  bold,
  EmbedBuilder,
  inlineCode,
  SlashCommandBuilder,
} from "discord.js";
import { defineCommand } from "..";
import { getDefinitions } from "../../utils/wiktionary";
import { stripHtml } from "../../utils/functions";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("wiktionary")
    .setDescription("Looks up a term on Wiktionary")
    .addStringOption((option) =>
      option
        .setName("term")
        .setDescription("The term to look up")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    let language: string | undefined;
    let term = interaction.options.getFocused().trim();
    if (term.length < 3) {
      await interaction.respond([]);
      return;
    }

    const parsed = term.split(":");
    if (parsed.length === 2) {
      term = parsed[0].trim();
      language = parsed[1].trim();
      if (!language) {
        await interaction.respond([]);
        return;
      }
    }

    const definitions = await getDefinitions(term);
    if (!definitions) {
      await interaction.respond([]);
      return;
    }

    if (language) {
      const choices = definitions
        .filter((definition) =>
          definition.language.toLowerCase().startsWith(language.toLowerCase())
        )
        .map((definition) => ({
          name: `${term} (${definition.language})`,
          value: `:${term}:${definition.languageCode}:`,
        }))
        .slice(0, 25);

      await interaction.respond(choices);
      return;
    }

    const choices = definitions
      .map((definition) => ({
        name: `${term} (${definition.language})`,
        value: `:${term}:${definition.languageCode}:`,
      }))
      .slice(0, 25);

    await interaction.respond(choices);
  },

  async execute(interaction) {
    let term = interaction.options.getString("term", true);
    let languageCode: string | undefined;

    const parsed = term.match(/^:(?<term>.+):(?<languageCode>.+):$/);
    if (parsed?.groups) {
      term = parsed.groups.term;
      languageCode = parsed.groups.languageCode;
    }

    const definitions = await getDefinitions(term);
    if (!definitions) {
      await interaction.reply({
        content: "No definitions found",
      });
      return;
    }

    const definition = languageCode
      ? definitions.find((def) => def.languageCode === languageCode)
      : definitions[0];
    if (!definition) {
      await interaction.reply({
        content: "No definitions found",
      });
      return;
    }

    const description = definition.entries
      .map((entry) => {
        const name = entry.partOfSpeech;
        const definitions = entry.definitions
          .filter((def) => def.definition)
          .map((def, i) => {
            const prefix = inlineCode(`${i + 1}.`);
            const definition = stripHtml(def.definition);
            return `${prefix} ${definition.trim()}`;
          })
          .join("\n");

        return `${bold(name)}\n${definitions}`;
      })
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Wiktionary - ${definition.language}`,
        iconURL:
          "https://en.wiktionary.org/static/apple-touch/wiktionary/en.png",
        url: `https://${
          definition.languageCode
        }.wiktionary.org/wiki/${encodeURIComponent(term)}`,
      })
      .setTitle(term)
      .setColor(0xfefefe)
      .setDescription(description);

    await interaction.reply({ embeds: [embed] });
  },
});
