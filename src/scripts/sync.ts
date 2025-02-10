import { client } from "../client";
import { logger } from "../utils/logger";

async function main() {
  await client.loadCommands();
  await client.syncCommands();
}

main().catch(logger.error);
