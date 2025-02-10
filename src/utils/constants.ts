import { version } from "discord.js";
import { env } from "../env";

export const DEV = env.NODE_ENV === "development";
export const PROD = env.NODE_ENV === "production";

export const USER_AGENT = `artemis (discord.js ${version})`;
export const FAKE_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0";

export const GOOD_BOT_EMOJIS = [
  "<:teehee:825098257742299136>",
  "<:teehee2:825098258741067787>",
  "<:teehee3:825098263820632066>",
  "<:teehee4:825098262884778026>",
  "<:teehee5:825098263437901825>",
];

export const BAD_BOT_EMOJIS = [
  "<:rip:825101664939147285>",
  "<:rip2:825101666373206086>",
  "<:rip3:825101667434889236>",
  "<:rip4:825101668428546058>",
  "<:rip5:825101671436255243>",
];
