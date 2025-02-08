import { client } from "../client";
import { log } from "../utils/logger";

async function main() {
  await client.loadCommands();
  await client.syncCommands();
}

main().catch(log.error);
