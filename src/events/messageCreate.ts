import { Events } from "discord.js";
import { defineEvent } from ".";
import { pickRandom } from "../utils/functions";
import { BAD_BOT_EMOJIS, GOOD_BOT_EMOJIS } from "../utils/constants";
import { stripIndents } from "common-tags";

export default defineEvent({
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    const command = message.content.match(/^\$[a-zA-Z]+$/);
    if (command) {
      if (
        ["ocr", "lens", "lenstr", "deepl"].includes(command[0].slice(1)) &&
        message.reference
      ) {
        await message.reply(
          stripIndents`The bot has migrated to application commands!
          If you wish to OCR and/or translate someone else's message, please select the appropriate action from the context menu on their message.

          Desktop: Right click on the message and select the action you wish to perform.
          Mobile: Long press on the message and select the action you wish to perform.
          
          https://files.catbox.moe/0bo10j.png`
        );
        return;
      }

      await message.reply(
        stripIndents`The bot has migrated to slash commands!
        
        Start typing \`/\` to see the available commands.
        For example: \`/${command[0].slice(1)}\`
        
        https://files.catbox.moe/594jzd.png`
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
