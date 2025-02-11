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

export async function isSourceLanguageSupported(code: string) {
  const sourceLanguages = await getSourceLanguages();
  return (
    sourceLanguages.find((l) => l.code.toLowerCase() === code.toLowerCase()) !==
    undefined
  );
}

export async function isTargetLanguageSupported(code: string) {
  const targetLanguages = await getTargetLanguages();
  return (
    targetLanguages.find((l) => l.code.toLowerCase() === code.toLowerCase()) !==
    undefined
  );
}
