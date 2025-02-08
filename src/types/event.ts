import type { ClientEvents } from "discord.js";

export interface Event<Event extends keyof ClientEvents> {
  name: Event;
  once?: boolean;
  execute(...args: ClientEvents[Event]): Promise<void>;
}
