import { env } from "../env";
import { Events } from "discord.js";
import { logger } from "../utils/logger";
import { defineEvent } from ".";
import { maybeSendRestarted } from "../utils/restart";

export default defineEvent({
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    logger.info(
      {
        tag: client.user.tag,
        id: client.user.id,
        env: env.NODE_ENV,
      },
      "Logged in"
    );

    await maybeSendRestarted();
  },
});
