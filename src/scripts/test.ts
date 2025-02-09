import { ArtemisClient } from "../client";
import { env } from "../env";

const client = new ArtemisClient();
await client.api.applicationCommands.bulkOverwriteGlobalCommands(
  env.APPLICATION_ID,
  []
);
