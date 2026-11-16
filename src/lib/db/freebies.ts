import "server-only";
import { BatchGetCommand, DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, freebieKey, freebiePk, ifConditionHolds, ownerGsiPk, queryAll } from "./client";
import type { Freebie } from "./types";

export const MAX_FREEBIES_PER_USER = 20;

export async function createFreebie(f: Freebie): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: { ...freebieKey(f.id), gsi1pk: ownerGsiPk(f.ownerId), gsi1sk: String(f.createdAt), ...f },
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
}

export async function getFreebie(id: string): Promise<Freebie | undefined> {
  const res = await db.send(new GetCommand({ TableName: TABLE, Key: freebieKey(id), ConsistentRead: true }));
  return res.Item as Freebie | undefined;
}

/** The owner's freebies, newest first. */
export function listMyFreebies(ownerId: string): Promise<Freebie[]> {
  return queryAll<Freebie>({
    IndexName: "gsi1",
    KeyConditionExpression: "gsi1pk = :o",
    ExpressionAttributeValues: { ":o": ownerGsiPk(ownerId) },
    ScanIndexForward: false,
  });
}

/** Deletes the freebie if it belongs to ownerId. Returns its image key so it can be removed from S3. */
export async function deleteFreebie(id: string, ownerId: string): Promise<string | null> {
  const res = await ifConditionHolds(() =>
    db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: freebieKey(id),
        ConditionExpression: "ownerId = :o",
        ExpressionAttributeValues: { ":o": ownerId },
        ReturnValues: "ALL_OLD",
      }),
    ),
  );
  return (res?.Attributes?.imageKey as string | undefined) ?? null;
}

/** Ids (from the given list) whose freebie no longer exists or was hidden. */
export async function unavailableFreebies(ids: string[]): Promise<Set<string>> {
  const gone = new Set(ids);
  // BatchGetItem accepts up to 100 keys per call
  for (let i = 0; i < ids.length; i += 100) {
    const res = await db.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLE]: {
            Keys: ids.slice(i, i + 100).map((id) => ({ pk: freebiePk(id), sk: "META" })),
            ProjectionExpression: "id, #h",
            // "hidden" is a DynamoDB reserved word
            ExpressionAttributeNames: { "#h": "hidden" },
          },
        },
      }),
    );
    for (const item of res.Responses?.[TABLE] ?? []) {
      if (!item.hidden) {
        gone.delete(item.id as string);
      }
    }
  }
  return gone;
}
