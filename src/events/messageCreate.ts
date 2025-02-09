import { Events } from "discord.js";
import { defineEvent } from ".";
import { dedent } from "../utils/functions";

export default defineEvent({
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    const command = message.content.match(/^\$[a-zA-Z]+$/);
    if (command) {
      await message.reply(
        dedent`The bot has migrated to slash commands!
        Start typing \`/\` to see the available commands.
        For example: \`/${command[0].slice(1)}\``
      );
      return;
    }
  },
});
