import { bold, inlineCode, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { getDefinitions, getSuggestions } from "../../utils/wiktionary";
import { stripHtml } from "../../utils/functions";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { LRUCache } from "lru-cache";

const titleCache = new LRUCache<string, string>({ max: 100 });

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
    const term = interaction.options.getFocused().trim();
    if (term.length < 3) {
      await interaction.respond([]);
      return;
    }

    const suggestions = await getSuggestions(term);
    if (!suggestions) {
      await interaction.respond([]);
      return;
    }

    suggestions.forEach((suggestion) => {
      titleCache.set(suggestion.key, suggestion.title);
    });

    const choices = suggestions
      .map((suggestion) => ({
        name: suggestion.title,
        value: suggestion.key,
      }))
      .slice(0, 25);

    await interaction.respond(choices);
  },

  async execute(interaction) {
    const term = interaction.options.getString("term", true);

    const definitions = await getDefinitions(term);
    if (!definitions?.length) {
      await interaction.reply({
        content: "No definitions found",
      });
      return;
    }

    const title = titleCache.get(term) ?? term;
    const msg = new PaginatedMessage();
    msg.setSelectMenuOptions((i) => ({
      label: definitions[i - 1].language,
      description: `Page ${i}`,
    }));

    definitions.forEach((definition) => {
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

      msg.addPageEmbed((embed) =>
        embed
          .setAuthor({
            name: `Wiktionary - ${definition.language}`,
            iconURL:
              "https://en.wiktionary.org/static/apple-touch/wiktionary/en.png",
            url: `https://${
              definition.languageCode
            }.wiktionary.org/wiki/${encodeURIComponent(term)}`,
          })
          .setTitle(title)
          .setColor(0xfefefe)
          .setDescription(description)
      );
    });

    msg.run(interaction);
  },
});
