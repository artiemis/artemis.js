import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
} from "discord.js";

export async function confirmPrompt(
  interaction: ChatInputCommandInteraction,
  message: string
) {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger)
  );

  const msg = (
    await interaction.reply({
      content: message,
      components: [row],
      withResponse: true,
    })
  ).resource?.message!;

  const confirmation = await msg
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (i) => i.user.id === interaction.user.id,
      dispose: true,
    })
    .catch(() => {
      interaction.editReply({
        content: "You took too long to respond.",
        components: [],
      });
    });

  msg.delete();
  return confirmation?.customId === "confirm";
}
