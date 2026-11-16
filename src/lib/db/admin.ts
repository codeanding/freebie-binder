import "server-only";
import { DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, freebieKey, ifConditionHolds, scanAll } from "./client";
import type { Freebie } from "./types";

/** Every freebie, for the admin panel. The table is small, so a Scan is enough. */
export function listAllFreebies(): Promise<Freebie[]> {
  return scanAll<Freebie>({
    FilterExpression: "sk = :m AND begins_with(pk, :f)",
    ExpressionAttributeValues: { ":m": "META", ":f": "FREEBIE#" },
  });
}

export async function setHidden(id: string, hidden: boolean): Promise<void> {
  await ifConditionHolds(() =>
    db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: freebieKey(id),
        UpdateExpression: "SET #h = :h",
        ConditionExpression: "attribute_exists(pk)",
        ExpressionAttributeNames: { "#h": "hidden" },
        ExpressionAttributeValues: { ":h": hidden },
      }),
    ),
  );
}

/** Deletes a freebie that is already hidden (from any owner). Returns its image key. */
export async function adminDeleteFreebie(id: string): Promise<string | null> {
  const res = await ifConditionHolds(() =>
    db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: freebieKey(id),
        ConditionExpression: "#h = :t",
        ExpressionAttributeNames: { "#h": "hidden" },
        ExpressionAttributeValues: { ":t": true },
        ReturnValues: "ALL_OLD",
      }),
    ),
  );
  return (res?.Attributes?.imageKey as string | undefined) ?? null;
}
