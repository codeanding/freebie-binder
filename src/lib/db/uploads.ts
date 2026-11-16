import "server-only";
import { DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, ifConditionHolds, ttl } from "./client";

// requestUpload reserves an id for whoever asked; publishFreebie only accepts the caller's own reservations.

const RESERVATION_SECONDS = 15 * 60;
const uploadKey = (id: string) => ({ pk: `UPLOAD#${id}`, sk: "UPLOAD" });

export async function reserveUpload(id: string, ownerId: string): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLE,
      Item: { ...uploadKey(id), ownerId, expiresAt: ttl(RESERVATION_SECONDS) },
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
}

/** Consumes the reservation if it belongs to this person and hasn't expired. */
export async function consumeUpload(id: string, ownerId: string): Promise<boolean> {
  const res = await ifConditionHolds(() =>
    db.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: uploadKey(id),
        ConditionExpression: "ownerId = :o AND expiresAt > :now",
        ExpressionAttributeValues: { ":o": ownerId, ":now": ttl(0) },
      }),
    ),
  );
  return res !== null;
}
