import ky from "ky";

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

const client = ky.create({
  prefixUrl: "https://en.wiktionary.org/api/rest_v1",
  throwHttpErrors: false,
});

export async function getDefinitions(word: string) {
  const res = await client.get("page/definition/" + encodeURIComponent(word));
  const data = await res.json<DefinitionsResponse>();
  if (!res.ok || !data) return null;

  return Object.entries(data).map(([languageCode, entries]) => ({
    language: entries[0].language,
    languageCode,
    entries,
  }));
}
