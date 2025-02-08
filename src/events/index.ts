import type { ClientEvents } from "discord.js";
import type { Event } from "../types/event";

export function defineEvent<E extends keyof ClientEvents>(event: Event<E>) {
  return event;
}
