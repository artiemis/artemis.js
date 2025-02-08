import { inlineCode, SlashCommandBuilder } from "discord.js";
import { client } from "../../client";
import { defineCommand } from "..";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Useful latency data"),

  async execute(interaction) {
    if (client.ws.ping < 1) {
      await interaction.reply(
        ":ping_pong: Pong!\nThe bot is still starting up, accurate latency will be available shortly."
      );
      return;
    }

    const msg = (
      await interaction.reply({
        content: `:ping_pong: Pong!\nWebSocket latency is ${inlineCode(
          Math.round(client.ws.ping).toString()
        )} ms.`,
        withResponse: true,
      })
    ).resource?.message!;

    await msg.edit(
      `${msg.content}\nAPI roundtrip latency is ${inlineCode(
        (msg.createdTimestamp - interaction.createdTimestamp).toString()
      )}ms.`
    );
  },
});
