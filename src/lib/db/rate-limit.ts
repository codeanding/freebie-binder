import "server-only";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, ifConditionHolds, ttl } from "./client";

/** Hourly limits per person and action. */
export const RATE_LIMITS = {
  profile: 30,
  upload: 15,
  publish: 10,
  collect: 120,
  report: 20,
} as const;

export type RateAction = keyof typeof RATE_LIMITS;

/** Counts the action for this hour; returns false once the person is over the limit. */
export async function withinRate(userId: string, action: RateAction): Promise<boolean> {
  const hour = Math.floor(Date.now() / 3_600_000);
  const res = await ifConditionHolds(() =>
    db.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { pk: `RATE#${userId}`, sk: `${action}#${hour}` },
        UpdateExpression: "ADD n :one SET expiresAt = :exp",
        ConditionExpression: "attribute_not_exists(n) OR n < :limit",
        ExpressionAttributeValues: { ":one": 1, ":limit": RATE_LIMITS[action], ":exp": ttl(2 * 3600) },
      }),
    ),
  );
  return res !== null;
}
