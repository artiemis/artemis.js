import { env } from "./env";
import { API } from "@discordjs/core";
import { REST } from "discord.js";

const rest = new REST().setToken(env.DISCORD_TOKEN);
export const api = new API(rest);
