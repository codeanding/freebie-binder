import "server-only";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE, db, userPk } from "./client";
import type { Profile } from "./types";

const profileKey = (userId: string) => ({ pk: userPk(userId), sk: "PROFILE" });

export async function getProfile(userId: string): Promise<Profile | undefined> {
  const res = await db.send(new GetCommand({ TableName: TABLE, Key: profileKey(userId), ConsistentRead: true }));
  return res.Item as Profile | undefined;
}

export async function saveProfile(profile: Omit<Profile, "createdAt">): Promise<void> {
  await db.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: profileKey(profile.id),
      UpdateExpression:
        "SET id = :id, #n = :n, imageUrl = :i, social = :s, handle = :h, country = :c, bias = :b, createdAt = if_not_exists(createdAt, :now), gsi1pk = :g, gsi1sk = :c",
      // "name" is a DynamoDB reserved word
      ExpressionAttributeNames: { "#n": "name" },
      ExpressionAttributeValues: {
        ":id": profile.id,
        ":n": profile.name,
        ":i": profile.imageUrl,
        ":h": profile.handle,
        ":s": profile.social,
        ":c": profile.country,
        ":b": profile.bias,
        ":now": Date.now(),
        ":g": "PROFILES",
      },
    }),
  );
}
