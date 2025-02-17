import { inlineCode, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "..";
import { abort } from "../../utils/error";
import { z } from "zod";
import ky, { TimeoutError, type KyResponse } from "ky";
import { fileTypeFromBuffer } from "file-type";
import { FAKE_USER_AGENT } from "../../utils/constants";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("isdown")
    .setDescription("URL healthcheck")
    .addStringOption(option =>
      option.setName("url").setDescription("The URL to check").setRequired(true)
    ),

  async execute(interaction) {
    let url = interaction.options.getString("url", true);

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    if (!z.string().url().safeParse(url).success) {
      abort("Invalid URL");
    }

    const parsed = new URL(url);
    if (parsed.hostname.match(/^(localhost|127\.0\.0\.1)$|^192/)) {
      abort("Invalid URL");
    }

    await interaction.deferReply();

    let res: KyResponse;
    try {
      res = await ky.get(url, {
        headers: {
          "User-Agent": FAKE_USER_AGENT,
        },
        throwHttpErrors: false,
        timeout: 5000,
      });
    } catch (err) {
      let msg = "Couldn't establish HTTP connection.";
      if (err instanceof TimeoutError) {
        msg = "Request timed out, no HTTP response.";
      }

      await interaction.editReply(
        `It's not just you! The site is down.\n${inlineCode(msg)}`
      );
      return;
    }

    const chunks: Uint8Array[] = [];
    let mime = res.headers.get("content-type");

    if (!mime && res.body) {
      for await (const chunk of res.body) {
        chunks.push(chunk as Uint8Array);
        break;
      }

      const type = await fileTypeFromBuffer(Buffer.concat(chunks));
      if (type) {
        mime = type.mime;
      }
    }

    if (res.ok) {
      await interaction.editReply(
        `It's just you! The site is up.\nHTTP Response: ${inlineCode(
          `${res.status} ${res.statusText} • ${mime}`
        )}`
      );
    } else if (res.status === 404) {
      await interaction.editReply(
        `It's not just you! Either the resource is down or you entered the wrong URI path.\nHTTP Response: ${inlineCode(
          `${res.status} ${res.statusText} • ${mime}`
        )}`
      );
    } else {
      await interaction.editReply(
        `It's not just you! The site is down.\nHTTP Response: ${inlineCode(
          `${res.status} ${res.statusText}`
        )}`
      );
    }
  },
});
