import Lens from "chrome-lens-ocr";
import { env } from "../env";
import type { OCRResult } from "../types/ocr";

const lens = new Lens({
  headers: {
    cookie: env.GOOGLE_COOKIE,
  },
});

export async function lensOcr(resource: string | Buffer): Promise<OCRResult> {
  let result;

  if (typeof resource === "string") {
    result = await lens.scanByURL(resource);
  } else {
    result = await lens.scanByBuffer(resource);
  }

  return {
    text: result.segments.map(s => s.text).join("\n"),
    language: result.language ?? "n/a",
    model: "google",
  };
}
