import type { EventId } from "../events";
import type { Social } from "../catalog";

export type Profile = {
  id: string;
  name: string;
  imageUrl: string;
  social: Social;
  handle: string;
  country: string;
  bias: string;
  createdAt: number;
};

export type Freebie = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerHandle: string;
  ownerSocial: Social;
  ownerCountry: string;
  title: string;
  description?: string;
  imageKey: string;
  event: EventId | string;
  createdAt: number;
  collectCount: number;
  hidden?: boolean;
  reportCount?: number;
};

/** A freebie as copied into someone's binder when they collect it. */
export type Collected = Pick<
  Freebie,
  "id" | "title" | "imageKey" | "ownerId" | "ownerName" | "ownerHandle" | "ownerSocial" | "ownerCountry" | "event"
> & { at: number };
