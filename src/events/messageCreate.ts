import { Events } from "discord.js";
import { defineEvent } from ".";
import { dedent, pickRandom } from "../utils/functions";
import { BAD_BOT_EMOJIS, GOOD_BOT_EMOJIS } from "../utils/constants";

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

    const trigger = message.content.match(/^(?<side>good|bad)\s+bot\b/i);
    if (trigger) {
      const emojis =
        trigger.groups?.side.toLowerCase() === "good"
          ? GOOD_BOT_EMOJIS
          : BAD_BOT_EMOJIS;
      await message.reply(pickRandom(emojis));
      return;
    }
  },
});
