import {
  AutocompleteInteraction,
  hyperlink,
  inlineCode,
  SlashCommandBuilder,
  type InteractionEditReplyOptions,
} from "discord.js";
import { defineCommand } from "..";
import {
  getSourceLanguages,
  getTargetLanguages,
  isSourceLanguageSupported,
  isTargetLanguageSupported,
  translate,
} from "../../utils/deepl";
import { abort } from "../../utils/error";
import type { OCRResult } from "../../types/ocr";
import { capitalize, languageCodeToName } from "../../utils/functions";

export async function translateAutocompleteImpl(
  interaction: AutocompleteInteraction
) {
  const option = interaction.options.getFocused(true);
  const languages =
    option.name === "source"
      ? await getSourceLanguages()
      : await getTargetLanguages();
  const choices = languages
    .filter((language) =>
      language.name.toLowerCase().includes(option.value.toLowerCase())
    )
    .map((language) => ({
      name: language.name,
      value: language.code,
    }))
    .slice(0, 25);
  await interaction.respond(choices);
}

export async function translateImpl(
  text: string,
  source: string | null,
  target: string,
  ocrModel?: OCRResult["model"],
  imageUrl?: string
): Promise<InteractionEditReplyOptions> {
  const {
    text: translatedText,
    detectedSourceLang,
    billedCharacters,
  } = await translate({
    text,
    source,
    target,
  });

  const displaySource = languageCodeToName(detectedSourceLang);
  const displayTarget = languageCodeToName(target);

  if (translatedText.length > 4096) {
    return {
      content: ocrModel
        ? `OCR: ${inlineCode(capitalize(ocrModel))}`
        : "" + (imageUrl ? `\n${hyperlink("Image", imageUrl)}` : ""),
      files: [
        {
          name: `${displaySource}-${displayTarget}.txt`,
          attachment: Buffer.from(
            `--- From ${displaySource} to ${displayTarget} ---\n${translatedText}`
          ),
        },
      ],
    };
  }

  return {
    embeds: [
      {
        title: `From ${displaySource} to ${displayTarget}`,
        description: translatedText,
        color: 0x0f2b46,
        ...(imageUrl ? { image: { url: imageUrl } } : {}),
        author: {
          name: "DeepL",
          icon_url: "https://www.google.com/s2/favicons?domain=deepl.com&sz=64",
        },
        footer: {
          text: ocrModel
            ? `OCR: ${capitalize(ocrModel)}`
            : `Billed characters: ${billedCharacters}`,
          icon_url: ocrModel
            ? `https://www.google.com/s2/favicons?domain=${ocrModel}.com&sz=64`
            : undefined,
        },
      },
    ],
  };
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translates text using DeepL")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text to translate")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("source")
        .setDescription("Source language of the text")
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("target")
        .setDescription("Target language of the text")
        .setAutocomplete(true)
    ),

  autocomplete: translateAutocompleteImpl,

  async execute(interaction) {
    const text = interaction.options.getString("text", true);
    const source = interaction.options.getString("source") ?? null;
    const target = interaction.options.getString("target") ?? "en-US";

    await interaction.deferReply();

    if (source && !(await isSourceLanguageSupported(source))) {
      abort("Source language not supported");
    }
    if (target && !(await isTargetLanguageSupported(target))) {
      abort("Target language not supported");
    }

    const payload = await translateImpl(text, source, target);
    await interaction.editReply(payload);
  },
});
