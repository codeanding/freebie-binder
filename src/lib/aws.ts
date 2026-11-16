// Lambda sets AWS_REGION; the fallback is for local scripts
export const AWS_REGION = process.env.AWS_REGION ?? "us-west-2";
