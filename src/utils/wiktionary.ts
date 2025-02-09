import ky from "ky";

type Suggestion = {
  key: string;
  title: string;
};

type Suggestions = {
  pages: Suggestion[];
};

type ParsedExample = {
  example: string;
};

type Definition = {
  definition: string;
  parsedExamples?: ParsedExample[];
};

type Entry = {
  partOfSpeech: string;
  language: string;
  definitions: Definition[];
};

type DefinitionsResponse = {
  [key: string]: Entry[];
};

const restClient = ky.create({
  prefixUrl: "https://en.wiktionary.org/api/rest_v1",
  throwHttpErrors: false,
});

const phpClient = ky.create({
  prefixUrl: "https://en.wiktionary.org/w/rest.php/v1",
  throwHttpErrors: false,
});

export async function getSuggestions(term: string) {
  const res = await phpClient.get("search/title", {
    searchParams: {
      q: term,
      limit: 25,
    },
  });
  const data = await res.json<Suggestions>();
  if (!res.ok || !data.pages.length) return null;
  return data.pages;
}

export async function getDefinitions(term: string) {
  const res = await restClient.get(
    "page/definition/" + encodeURIComponent(term)
  );
  const data = await res.json<DefinitionsResponse>();
  if (!res.ok || !data) return null;

  return Object.entries(data).map(([languageCode, entries]) => ({
    language: entries[0].language,
    languageCode,
    entries,
  }));
}
