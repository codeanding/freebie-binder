import "server-only";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, freebieKey, freebiePk, ifConditionHolds } from "./client";

export const REPORTS_TO_HIDE = 3;

/** One report per person; at REPORTS_TO_HIDE reports the freebie hides itself. */
export async function report(freebieId: string, userId: string): Promise<"ok" | "already"> {
  try {
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE,
              Item: { pk: freebiePk(freebieId), sk: `REPORT#${userId}`, at: Date.now() },
              ConditionExpression: "attribute_not_exists(sk)",
            },
          },
          {
            Update: {
              TableName: TABLE,
              Key: freebieKey(freebieId),
              UpdateExpression: "ADD reportCount :one",
              ConditionExpression: "attribute_exists(pk)",
              ExpressionAttributeValues: { ":one": 1 },
            },
          },
        ],
      }),
    );
  } catch (err) {
    if (err instanceof TransactionCanceledException) {
      return "already";
    }
    throw err;
  }
  // A failed condition only means "not enough reports yet"
  await ifConditionHolds(() =>
    db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: freebieKey(freebieId),
        UpdateExpression: "SET #h = :t",
        ConditionExpression: "reportCount >= :n",
        // "hidden" is a DynamoDB reserved word
        ExpressionAttributeNames: { "#h": "hidden" },
        ExpressionAttributeValues: { ":t": true, ":n": REPORTS_TO_HIDE },
      }),
    ),
  );
  return "ok";
}
