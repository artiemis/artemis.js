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

  const reply = await interaction.reply({
    content: message,
    components: [row],
  });

  const confirmation = await reply
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
      filter: i => i.user.id === interaction.user.id,
      dispose: true,
    })
    .catch(() => {
      interaction.editReply({
        content: "You took too long to respond.",
        components: [],
      });
    });

  interaction.deleteReply();
  return confirmation?.customId === "confirm";
}
