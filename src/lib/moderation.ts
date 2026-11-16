import "server-only";
import { DetectModerationLabelsCommand, DetectTextCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { AWS_REGION } from "./aws";
import { textIsSafe } from "./text-safety";

const rekognition = new RekognitionClient({ region: AWS_REGION });

// Level-1 categories of the Rekognition moderation taxonomy (v7) that are never published.
// Responses always include the level-1 category alongside its level-2 and level-3 labels.
const BLOCKED = [
  "Explicit",
  "Non-Explicit Nudity of Intimate parts and Kissing",
  "Violence",
  "Visually Disturbing",
  "Hate Symbols",
  "Rude Gestures",
];

export function isBlocked(labels: { Name?: string; ParentName?: string }[]): boolean {
  return labels.some((l) => BLOCKED.includes(l.Name ?? "") || BLOCKED.includes(l.ParentName ?? ""));
}

export async function imageIsSafe(bytes: Uint8Array): Promise<boolean> {
  const res = await rekognition.send(
    new DetectModerationLabelsCommand({ Image: { Bytes: bytes }, MinConfidence: 60 }),
  );
  return !isBlocked(res.ModerationLabels ?? []);
}

/** Reads the text written on the photo (DetectText) and applies the same rules as the form fields. */
export async function imageTextIsSafe(bytes: Uint8Array): Promise<boolean> {
  const res = await rekognition.send(new DetectTextCommand({ Image: { Bytes: bytes } }));
  const lines = (res.TextDetections ?? [])
    .filter((t) => t.Type === "LINE" && (t.Confidence ?? 0) >= 80)
    .map((t) => t.DetectedText ?? "");
  return textIsSafe(...lines);
}
