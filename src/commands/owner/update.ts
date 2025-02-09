import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  codeBlock,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js";
import { defineCommand } from "..";
import { restart } from "../../utils/restart";
import { shell } from "../../utils/functions";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Updates the bot"),
  isOwnerOnly: true,

  async execute(interaction) {
    const response = await interaction.deferReply({ withResponse: true });
    const result = await shell`git pull`;
    const output = result.stdout + result.stderr;

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("restart")
        .setLabel("Restart")
        .setStyle(ButtonStyle.Success)
    );

    const isUpToDate = output.trim() === "Already up to date.";

    await interaction.editReply({
      components: isUpToDate || result.failed ? [] : [row],
      embeds: [
        {
          description: codeBlock(output),
          color: isUpToDate ? 0x00ff00 : 0xff0000,
        },
      ],
    });

    if (!isUpToDate && !result.failed) {
      response.resource?.message
        ?.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 30000,
          filter: (i) => i.user.id === interaction.user.id,
          dispose: true,
        })
        .then(async (interaction) => {
          await interaction.update({
            components: [],
          });
          await interaction.message.react("🔄");
          await restart({
            message: {
              id: interaction.message.id,
              channelId: interaction.message.channelId,
            },
          });
        });
    }
  },
});
