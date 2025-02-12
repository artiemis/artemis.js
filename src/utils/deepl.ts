import {
  Translator,
  type SourceLanguageCode,
  type TargetLanguageCode,
} from "deepl-node";
import { env } from "../env";
import { lazy } from "./functions";
import type { TranslateResult } from "../types/translate";

const translator = new Translator(env.DEEPL_API_KEY);
export const getSourceLanguages = lazy(() => translator.getSourceLanguages());
export const getTargetLanguages = lazy(() => translator.getTargetLanguages());

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
    sourceLanguages.find((l) => l.code.toLowerCase() === code.toLowerCase()) !==
    undefined
  );
}

export async function isTargetLanguage(code: string) {
  const targetLanguages = await getTargetLanguages();
  return (
    targetLanguages.find((l) => l.code.toLowerCase() === code.toLowerCase()) !==
    undefined
  );
}
