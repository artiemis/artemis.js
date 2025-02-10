import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import {
  getApiClient,
  getPageUrl,
  getRandomWikipediaPage,
  getWikipediaEditions,
  getWikipediaPage,
  searchWikipedia,
} from "../../utils/wikipedia";
import { trim } from "../../utils/functions";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("wikipedia")
    .setDescription("Looks up a thing on Wikipedia")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The thing to look up")
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("The Wikipedia language edition to use")
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const option = interaction.options.getFocused(true);
    const language = interaction.options.getString("language") ?? "en";

    if (option.name === "language") {
      const value = option.value.toLowerCase();
      const editions = await getWikipediaEditions();
      const choices = editions
        .filter(
          (edition) =>
            edition.subdomain.toLowerCase() === value ||
            edition.language.toLowerCase().includes(value)
        )
        .map((edition) => ({
          name: `${edition.language} (${edition.subdomain})`,
          value: `:${edition.subdomain}`,
        }))
        .slice(0, 25);
      await interaction.respond(choices);
    } else {
      if (option.value.length < 3) {
        await interaction.respond([]);
        return;
      }
      const suggestions = await searchWikipedia(
        getApiClient(language.replace(/^:/, "")),
        option.value
      );
      const choices = suggestions
        .map((suggestion) => ({
          name: suggestion,
          value: `:${suggestion}`,
        }))
        .slice(0, 25);
      await interaction.respond(choices);
    }
  },

  async execute(interaction) {
    let query = interaction.options.getString("query");
    let language = interaction.options.getString("language") ?? ":en";

    await interaction.deferReply();

    if (language.startsWith(":")) {
      language = language.slice(1);
    } else {
      const editions = await getWikipediaEditions();
      const edition =
        editions.find((endpoint) => endpoint.subdomain === language) ||
        editions.find(
          (endpoint) =>
            endpoint.language.toLowerCase() === language.toLowerCase()
        );
      if (!edition) {
        abort("No such Wikipedia language edition");
      }
      language = edition.subdomain;
    }

    const client = getApiClient(language);

    if (query) {
      if (query.startsWith(":")) {
        query = query.slice(1);
      } else {
        const suggestions = await searchWikipedia(client, query);
        query = suggestions[0];
      }
    } else {
      query = await getRandomWikipediaPage(client);
    }

    if (!query) {
      abort("No results found");
    }

    const page = await getWikipediaPage(client, query);
    if (!page || !page.extract) {
      abort("No results found");
    }

    await interaction.editReply({
      embeds: [
        {
          title: page.title,
          description: trim(page.extract, 4096),
          url: getPageUrl(language, page.title),
          color: 0xfefefe,
          image: {
            url: page.original?.source,
          },
          author: {
            name: "Wikipedia",
            icon_url:
              "https://en.wikipedia.org/static/apple-touch/wikipedia.png",
          },
        },
      ],
    });
  },
});
