import "server-only";
import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, type QueryCommandInput, type ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { AWS_REGION } from "../aws";

export const TABLE = process.env.APP_TABLE!;

export const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

// Single-table keys
export const userPk = (userId: string) => `USER#${userId}`;
export const freebiePk = (freebieId: string) => `FREEBIE#${freebieId}`;
export const ownerGsiPk = (ownerId: string) => `OWNER#${ownerId}`;
export const freebieKey = (freebieId: string) => ({ pk: freebiePk(freebieId), sk: "META" });

/** Epoch seconds `seconds` from now, for DynamoDB TTL attributes. */
export const ttl = (seconds: number) => Math.floor(Date.now() / 1000) + seconds;

/** Runs a conditional write. Returns null when the condition fails; any other error is thrown. */
export async function ifConditionHolds<T>(write: () => Promise<T>): Promise<T | null> {
  try {
    return await write();
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      return null;
    }
    throw err;
  }
}

/** Follows LastEvaluatedKey until the query is exhausted. */
export async function queryAll<T>(input: Omit<QueryCommandInput, "TableName" | "ExclusiveStartKey">): Promise<T[]> {
  const items: T[] = [];
  let startKey: Record<string, unknown> | undefined;
  do {
    const res = await db.send(new QueryCommand({ ...input, TableName: TABLE, ExclusiveStartKey: startKey }));
    items.push(...((res.Items ?? []) as T[]));
    startKey = res.LastEvaluatedKey;
  } while (startKey);
  return items;
}

/** Follows LastEvaluatedKey until the scan is exhausted. */
export async function scanAll<T>(input: Omit<ScanCommandInput, "TableName" | "ExclusiveStartKey">): Promise<T[]> {
  const items: T[] = [];
  let startKey: Record<string, unknown> | undefined;
  do {
    const res = await db.send(new ScanCommand({ ...input, TableName: TABLE, ExclusiveStartKey: startKey }));
    items.push(...((res.Items ?? []) as T[]));
    startKey = res.LastEvaluatedKey;
  } while (startKey);
  return items;
}
