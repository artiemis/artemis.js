import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  codeBlock,
  ComponentType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { defineCommand } from "..";
import { client } from "../../client";
import { abort } from "../../utils/error";
import { restart as restartBot } from "../../utils/restart";
import { shell } from "../../utils/functions";

export async function sync(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const counts = await client.syncCommands();

  if (!counts) {
    abort("No commands to sync");
  }

  const { guildCount, globalCount } = counts;

  await interaction.followUp(
    `Successfully synced ${guildCount} guild and ${globalCount} global application commands`
  );
}

export async function restart(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    content: "Restarting...",
    flags: MessageFlags.Ephemeral,
  });

  await restartBot({ token: interaction.token });
}

export async function update(interaction: ChatInputCommandInteraction) {
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
        await restartBot({
          message: {
            id: interaction.message.id,
            channelId: interaction.message.channelId,
          },
        });
      });
  }
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("dev")
    .setDescription("Owner commands")
    .addSubcommand((subcommand) =>
      subcommand.setName("sync").setDescription("Sync application commands")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("restart").setDescription("Restarts the bot")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("update").setDescription("Updates the bot")
    ),
  isOwnerOnly: true,

  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case "sync":
        await sync(interaction);
        break;
      case "restart":
        await restart(interaction);
        break;
      case "update":
        await update(interaction);
        break;
    }
  },
});
