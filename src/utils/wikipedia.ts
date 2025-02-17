import ky, { type KyInstance } from "ky";
import { lazy } from "./functions";
import * as cheerio from "cheerio";

type SearchResponse = [string, string[], string[], string[]];
type RandomResponse = {
  query: {
    random: {
      title: string;
    }[];
  };
};

type Page = {
  query: {
    pages: {
      [id: string]: {
        title: string;
        extract: string;
        original: {
          source: string;
        };
      };
    };
  };
};

export function getApiClient(subdomain: string) {
  return ky.create({
    prefixUrl: `https://${subdomain}.wikipedia.org/w/api.php`,
  });
}

export function getPageUrl(subdomain: string, title: string) {
  return `https://${subdomain}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

export const getWikipediaEditions = lazy(async () => {
  const res = await ky.get("https://en.wikipedia.org/wiki/List_of_Wikipedias");
  const data = await res.text();
  const $ = cheerio.load(data);

  const editions = $(
    "table:has(> caption:contains('Wikipedia editions')) > tbody > tr"
  );

  return editions
    .map((_, el) => ({
      language: $(el).find("> td:nth-child(3)").text(),
      subdomain: $(el).find("> td:nth-child(5)").text(),
    }))
    .toArray()
    .filter(edition => edition.language && edition.subdomain);
});

export async function searchWikipedia(client: KyInstance, query: string) {
  const res = await client.get("", {
    searchParams: {
      action: "opensearch",
      search: query,
      format: "json",
      redirects: "resolve",
    },
  });
  const data = await res.json<SearchResponse>();
  return data[1];
}

export async function getRandomWikipediaPage(client: KyInstance) {
  const res = await client.get("", {
    searchParams: {
      action: "query",
      list: "random",
      rnnamespace: 0,
      redirects: 1,
      format: "json",
    },
  });
  const data = await res.json<RandomResponse>();
  return data.query.random[0].title;
}

export async function getWikipediaPage(client: KyInstance, title: string) {
  const res = await client.get("", {
    searchParams: {
      action: "query",
      titles: title,
      prop: "extracts|pageimages",
      format: "json",
      exintro: "",
      explaintext: "",
      exsentences: "5",
      piprop: "original",
      redirects: 1,
    },
  });
  const data = await res.json<Page>();
  const pages = Object.keys(data.query.pages);
  if (!pages.length) return null;
  return data.query.pages[pages[0]];
}
