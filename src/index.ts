import { env } from "./env";
import { client } from "./client";

await client.setup();
client.login(env.DISCORD_TOKEN);
