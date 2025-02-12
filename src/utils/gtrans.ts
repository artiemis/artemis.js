import ky from "ky";
import { languageCodeToName, lazy } from "./functions";
import { readFileSync } from "node:fs";
import type { TranslateResult } from "../types/translate";

type TranslationResponse = {
  src: string;
  sentences: {
    trans: string;
  }[];
};

const client = ky.create({
  prefixUrl: "https://translate.googleapis.com/translate_a",
});

const languageCodes = lazy(
  () =>
    JSON.parse(readFileSync("data/gtrans-langcodes.json", "utf8")) as string[]
);

export const getLanguages = lazy(() =>
  languageCodes().map((code) => ({
    code,
    name: languageCodeToName(code),
  }))
);

export function isLanguage(code: string) {
  return languageCodes().includes(code);
}

export async function translate(
  text: string,
  source = "auto",
  target = "en"
): Promise<TranslateResult> {
  const res = await client.get("single", {
    searchParams: {
      sl: source,
      tl: target,
      q: text,
      client: "gtx",
      dt: "t",
      dj: "1",
      source: "input",
    },
  });

  const { sentences, src } = await res.json<TranslationResponse>();

  return {
    translatedText: sentences
      .map((s) => s?.trans)
      .filter(Boolean)
      .join(""),
    detectedSourceLang: src,
    model: "google",
  };
}
