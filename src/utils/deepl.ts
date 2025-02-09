import {
  Translator,
  type SourceLanguageCode,
  type TargetLanguageCode,
} from "deepl-node";
import { env } from "../env";
import { lazy } from "./functions";

const translator = new Translator(env.DEEPL_API_KEY);
export const getSourceLanguages = lazy(() => translator.getSourceLanguages());
export const getTargetLanguages = lazy(() => translator.getTargetLanguages());

type TranslateOptions = {
  text: string;
  source?: string | null;
  target?: string;
};

export async function translate({
  text,
  source = null,
  target = "en-US",
}: TranslateOptions) {
  return translator.translateText(
    text,
    source as SourceLanguageCode,
    target as TargetLanguageCode
  );
}

export async function getUsage() {
  return translator.getUsage();
}

export async function getLanguages() {
  return (await getSourceLanguages()).concat(await getTargetLanguages());
}

export async function languageCodeToName(code: string) {
  return (await getLanguages()).find((l) => l.code === code)?.name;
}

export async function isSourceLanguageSupported(code: string) {
  return (
    (await getSourceLanguages()).find(
      (l) => l.code.toLowerCase() === code.toLowerCase()
    ) !== undefined
  );
}

export async function isTargetLanguageSupported(code: string) {
  return (
    (await getTargetLanguages()).find(
      (l) => l.code.toLowerCase() === code.toLowerCase()
    ) !== undefined
  );
}
