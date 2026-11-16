import "server-only";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, freebieKey, queryAll, userPk } from "./client";
import { listMyFreebies } from "./freebies";

type Key = { pk: string; sk: string };

async function deleteKeys(keys: Key[]): Promise<void> {
  // BatchWriteItem accepts up to 25 requests per call
  for (let i = 0; i < keys.length; i += 25) {
    let pending: Record<string, unknown>[] | undefined = keys.slice(i, i + 25).map((Key) => ({ DeleteRequest: { Key } }));
    while (pending?.length) {
      const res = await db.send(new BatchWriteCommand({ RequestItems: { [TABLE]: pending } }));
      pending = res.UnprocessedItems?.[TABLE] as Record<string, unknown>[] | undefined;
    }
  }
}

/** Deletes the profile, binder and own freebies. Returns the image keys to delete from S3. */
export async function deleteUserData(userId: string): Promise<string[]> {
  const [own, mine] = await Promise.all([
    queryAll<Key>({
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": userPk(userId) },
      ProjectionExpression: "pk, sk",
    }),
    listMyFreebies(userId),
  ]);
  await deleteKeys([...own.map(({ pk, sk }) => ({ pk, sk })), ...mine.map((f) => freebieKey(f.id))]);
  return mine.map((f) => f.imageKey);
}
