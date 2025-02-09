import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import {
  isSourceLanguageSupported,
  isTargetLanguageSupported,
} from "../../utils/deepl";
import {
  translateAutocompleteImpl,
  translateImpl,
} from "../language/translate";
import { ocrImpl } from "./ocr";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ocrtranslate")
    .setDescription(
      "OCR an image using Yandex and translate the result using DeepL"
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("The image to OCR")
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
    const attachment = interaction.options.getAttachment("image", true);
    const source = interaction.options.getString("source") ?? null;
    const target = interaction.options.getString("target") ?? "en-US";

    if (!attachment.contentType?.startsWith("image/")) {
      abort("The file must be an image!");
    }

    await interaction.deferReply();

    if (source && !(await isSourceLanguageSupported(source))) {
      abort("Source language not supported");
    }
    if (target && !(await isTargetLanguageSupported(target))) {
      abort("Target language not supported");
    }

    const { text } = await ocrImpl(attachment);
    const payload = await translateImpl(text, source, target, attachment);
    await interaction.editReply(payload);
  },
});
