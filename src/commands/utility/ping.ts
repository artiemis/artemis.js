import { inlineCode, SlashCommandBuilder } from "discord.js";
import { client } from "../../client";
import { defineCommand } from "..";
import { abort } from "../../utils/error";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Useful latency data"),

  async execute(interaction) {
    if (client.ws.ping < 1) {
      abort(
        ":ping_pong: Pong!\nThe bot is still starting up, accurate latency will be available shortly."
      );
    }

    await interaction
      .reply({
        content: `:ping_pong: Pong!\nWebSocket latency is ${inlineCode(
          Math.round(client.ws.ping).toString()
        )} ms.`,
        withResponse: true,
      })
      .then(reply => {
        const msg = reply.resource?.message;
        return msg?.edit(
          `${msg?.content}\nAPI roundtrip latency is ${inlineCode(
            (msg?.createdTimestamp - interaction.createdTimestamp).toString()
          )}ms.`
        );
      });
  },
});
