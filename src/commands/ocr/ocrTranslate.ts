import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import { isSourceLanguage, isTargetLanguage } from "../../utils/deepl";
import {
  translateAutocompleteImpl,
  translateImpl,
} from "../language/translate";
import { ocrImpl } from "./ocr";
import { getImageUrlFromChatInteraction } from "../../utils/functions";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ocrtranslate")
    .setDescription(
      "OCR an image using Google Lens or Yandex and translate the result using DeepL or Google Translate"
    )
    .addAttachmentOption(option =>
      option.setName("image").setDescription("The image to OCR")
    )
    .addStringOption(option =>
      option.setName("url").setDescription("The image URL to OCR")
    )
    .addStringOption(option =>
      option
        .setName("source")
        .setDescription("Source language of the text")
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName("target")
        .setDescription("Target language of the text")
        .setAutocomplete(true)
    ),

  autocomplete: translateAutocompleteImpl,

  async execute(interaction) {
    const source = interaction.options.getString("source") ?? null;
    const target = interaction.options.getString("target") ?? "en-US";

    const imageUrl = getImageUrlFromChatInteraction(interaction);

    await interaction.deferReply();

    if (source && !(await isSourceLanguage(source))) {
      abort("Source language not found");
    }
    if (target && !(await isTargetLanguage(target))) {
      abort("Target language not found");
    }

    const { text, model, attachment } = await ocrImpl(imageUrl);
    const payload = await translateImpl(
      text,
      source,
      target,
      model,
      attachment
    );
    await interaction.editReply(payload);
  },
});
