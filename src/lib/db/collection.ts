import "server-only";
import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { TABLE, db, freebieKey, queryAll, userPk } from "./client";
import type { Collected, Freebie } from "./types";

export type CollectResult = "ok" | "already" | "own" | "missing";

const collectedKey = (userId: string, freebieId: string) => ({ pk: userPk(userId), sk: `COLLECTED#${freebieId}` });

export async function collect(userId: string, f: Freebie): Promise<CollectResult> {
  if (f.ownerId === userId) {
    return "own";
  }
  const item: Collected = {
    id: f.id,
    title: f.title,
    imageKey: f.imageKey,
    ownerId: f.ownerId,
    ownerName: f.ownerName,
    ownerHandle: f.ownerHandle,
    ownerSocial: f.ownerSocial,
    ownerCountry: f.ownerCountry,
    event: f.event,
    at: Date.now(),
  };
  try {
    // The binder entry and the counter are written together, so nobody counts the same freebie twice
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE,
              Item: { ...collectedKey(userId, f.id), ...item },
              ConditionExpression: "attribute_not_exists(sk)",
            },
          },
          {
            Update: {
              TableName: TABLE,
              Key: freebieKey(f.id),
              UpdateExpression: "ADD collectCount :one",
              ConditionExpression: "attribute_exists(pk)",
              ExpressionAttributeValues: { ":one": 1 },
            },
          },
        ],
      }),
    );
    return "ok";
  } catch (err) {
    if (err instanceof TransactionCanceledException) {
      return err.CancellationReasons?.[0]?.Code === "ConditionalCheckFailed" ? "already" : "missing";
    }
    throw err;
  }
}

export async function hasCollected(userId: string, freebieId: string): Promise<boolean> {
  const res = await db.send(new GetCommand({ TableName: TABLE, Key: collectedKey(userId, freebieId) }));
  return !!res.Item;
}

/** Everything in the user's binder, most recently collected first. */
export async function listCollected(userId: string): Promise<Collected[]> {
  const items = await queryAll<Collected>({
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :c)",
    ExpressionAttributeValues: { ":pk": userPk(userId), ":c": "COLLECTED#" },
    ConsistentRead: true,
  });
  return items.sort((a, b) => b.at - a.at);
}
