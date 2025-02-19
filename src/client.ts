import {
  ActivityType,
  ApplicationIntegrationType,
  Client,
  Collection,
  GatewayIntentBits,
  InteractionContextType,
  Partials,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { env } from "./env";
import { API } from "@discordjs/core";
import type { Command } from "./types/command";
import path from "node:path";
import fs from "node:fs/promises";
import { logger } from "./utils/logger";
import { pluralize } from "./utils/functions";
import { DEV } from "./utils/constants";

export class ArtemisClient extends Client {
  public api: API;
  public ownerId = env.OWNER_ID;
  public commands = new Collection<string, Command>();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
      allowedMentions: {
        parse: [],
      },
      partials: [Partials.Channel],
      presence: {
        activities: [{ name: "hecha con ❤️", type: ActivityType.Custom }],
      },
    });

    const rest = new REST().setToken(env.DISCORD_TOKEN);
    this.api = new API(rest);

    this.on("error", err => {
      logger.error(err);
    });
  }

  async setup() {
    Promise.all([this.loadCommands(), this.registerEvents()]);
  }

  async getOwner() {
    return this.users.fetch(this.ownerId);
  }

  async loadCommands() {
    const commandsDir = path.join(import.meta.dir, "commands");
    const categories = await fs
      .readdir(commandsDir)
      .then(categories =>
        categories.filter(category => !category.includes("."))
      );
    const promises: Promise<void>[] = [];

    for (const category of categories) {
      const files = await fs
        .readdir(path.join(commandsDir, category))
        .then(files => files.filter(file => file.endsWith(".ts")));

      for (const file of files) {
        promises.push(
          import(path.join(commandsDir, category, file)).then(
            ({ default: command }: { default: Command }) => {
              this.commands.set(command.data.name, {
                ...command,
                category,
              });
            }
          )
        );
      }
    }

    await Promise.all(promises);
    logger.info(
      `Loaded ${pluralize(this.commands.size, "application command")}`
    );
  }

  async registerEvents() {
    const eventsDir = path.join(import.meta.dir, "events");
    const files = await fs
      .readdir(eventsDir)
      .then(files => files.filter(file => file !== "index.ts"));

    for (const file of files) {
      const { default: event } = await import(path.join(eventsDir, file));
      this[event.once ? "once" : "on"](event.name, event.execute);
    }

    logger.info(`Registered ${pluralize(files.length, "event")}`);
  }

  async syncCommands() {
    if (!this.commands.size) {
      logger.warn("No commands were loaded, skipping registration");
      return;
    }

    const publicCommands = this.commands
      .filter(command => !command.isOwnerOnly)
      .map(command =>
        command.data
          .setIntegrationTypes(
            ApplicationIntegrationType.GuildInstall,
            ApplicationIntegrationType.UserInstall
          )
          .setContexts(
            InteractionContextType.BotDM,
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
          )
          .toJSON()
      );
    const ownerCommands = this.commands
      .filter(command => command.isOwnerOnly)
      .map(command =>
        command.data
          .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
          .toJSON()
      );

    let guildCount = 0;
    let globalCount = 0;

    if (DEV) {
      await this.api.applicationCommands
        .bulkOverwriteGuildCommands(env.APPLICATION_ID, env.DEV_GUILD_ID, [
          ...publicCommands,
          ...ownerCommands,
        ])
        .then(res => (guildCount += res.length));
    } else {
      await this.api.applicationCommands
        .bulkOverwriteGuildCommands(
          env.APPLICATION_ID,
          env.DEV_GUILD_ID,
          ownerCommands
        )
        .then(res => (guildCount += res.length));
      await this.api.applicationCommands
        .bulkOverwriteGlobalCommands(env.APPLICATION_ID, publicCommands)
        .then(res => (globalCount += res.length));
    }

    logger.info(
      `Successfully synced ${guildCount} guild and ${globalCount} global application commands`
    );
    return { guildCount, globalCount };
  }
}

export const client = new ArtemisClient();
