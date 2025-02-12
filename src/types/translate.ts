export type TranslateResult = {
  translatedText: string;
  detectedSourceLang: string;
  model: "deepl" | "google";
};
