import {
  Translator,
  type Language,
  type SourceLanguageCode,
  type TargetLanguageCode,
} from "deepl-node";
import { env } from "../env";
import { lazy } from "./functions";
import type { TranslateResult } from "../types/translate";
import Fuse from "fuse.js";

const translator = new Translator(env.DEEPL_API_KEY);
export const getSourceLanguages = lazy(() => translator.getSourceLanguages());
export const getTargetLanguages = lazy(() => translator.getTargetLanguages());

const fuzzyLanguages = lazy(async () => {
  const keys = ["name", "code"];
  return {
    source: new Fuse(await getSourceLanguages(), { keys }),
    target: new Fuse(await getTargetLanguages(), { keys }),
  };
});

export async function searchFuzzyLanguages(
  query: string,
  type: "source" | "target"
) {
  const { source, target } = await fuzzyLanguages();
  const fuse = type === "source" ? source : target;
  return fuse.search(query);
}

export async function findFuzzyLanguage(
  query: string,
  type: "source" | "target"
): Promise<Language | undefined> {
  const results = await searchFuzzyLanguages(query, type);
  return results[0]?.item;
}

export async function translate(
  text: string,
  source: string | null = null,
  target = "en-US"
): Promise<TranslateResult> {
  const result = await translator.translateText(
    text,
    source as SourceLanguageCode | null,
    target as TargetLanguageCode
  );
  return {
    translatedText: result.text,
    detectedSourceLang: result.detectedSourceLang,
    model: "deepl",
  };
}

export async function getUsage() {
  return translator.getUsage();
}

export async function isSourceLanguage(code: string) {
  const sourceLanguages = await getSourceLanguages();
  return (
    sourceLanguages.find(l => l.code.toLowerCase() === code.toLowerCase()) !==
    undefined
  );
}

export async function isTargetLanguage(code: string) {
  const targetLanguages = await getTargetLanguages();
  return (
    targetLanguages.find(l => l.code.toLowerCase() === code.toLowerCase()) !==
    undefined
  );
}
