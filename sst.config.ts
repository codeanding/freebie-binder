// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

/**
 * Settings and secrets come from .env.local (development) and .env.deploy.<stage>, which overrides it.
 * Next.js never loads .env.deploy.* files, so secrets reach the Lambda as environment variables
 * instead of being bundled into its code. Variables already set in the shell take precedence.
 * Provider plugins (AWS, Cloudflare) read their credentials from the shell, so deploy with
 * scripts/deploy.sh, which exports the stage file first.
 */
async function loadEnv(stage: string): Promise<Record<string, string>> {
  const { existsSync, readFileSync } = await import("node:fs");
  const env: Record<string, string> = {};
  for (const file of [".env.local", `.env.deploy.${stage}`]) {
    if (!existsSync(file)) {
      continue;
    }
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m) {
        env[m[1]] = m[2];
      }
    }
  }
  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value;
  }
  return env;
}

export default $config({
  async app(input) {
    await loadEnv(input?.stage ?? "dev");
    return {
      name: "army-freebies",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        // AWS_PROFILE is optional; without it the default credential chain is used
        aws: { profile: process.env.AWS_PROFILE, region: "us-west-2" },
        // Optional custom domain on Cloudflare DNS; without it the app uses its CloudFront URL
        ...(process.env.APP_DOMAIN ? { cloudflare: { package: "@pulumi/cloudflare", version: "6.21.0" } } : {}),
      },
    };
  },
  async run() {
    const env = await loadEnv($app.stage);
    const domain = process.env.APP_DOMAIN;
    const zone = process.env.CLOUDFLARE_ZONE_ID;
    const isProd = $app.stage === "production";

    const table = new sst.aws.Dynamo("Data", {
      fields: { pk: "string", sk: "string", gsi1pk: "string", gsi1sk: "string" },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
      globalIndexes: { gsi1: { hashKey: "gsi1pk", rangeKey: "gsi1sk" } },
      ttl: "expiresAt",
      deletionProtection: isProd,
    });

    // Private: the browser uploads here; the server checks the photo and copies it to Images
    const uploads = new sst.aws.Bucket("Uploads", {
      cors: {
        allowMethods: ["POST"],
        allowOrigins: domain ? [`https://${domain}`] : ["*"],
        allowHeaders: ["*"],
      },
      lifecycle: [{ id: "expire-uploads", expiresIn: "1 day" }],
    });

    // Public read-only; only the server writes here
    const images = new sst.aws.Bucket("Images", { access: "public", cors: false });

    const web = new sst.aws.Nextjs("Web", {
      domain: domain && zone ? { name: domain, dns: sst.cloudflare.dns({ zone }) } : undefined,
      server: { memory: "2048 MB", architecture: "arm64" },
      // Warm instances in production avoid cold starts on concert nights
      warm: isProd ? 3 : 0,
      // Least privilege (instead of `link`, which would grant s3:* and dynamodb:*)
      permissions: [
        {
          actions: [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query",
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem", // account deletion
            "dynamodb:ConditionCheckItem",
            "dynamodb:Scan", // admin panel only
          ],
          resources: [table.arn, $interpolate`${table.arn}/index/*`],
        },
        { actions: ["s3:GetObject", "s3:DeleteObject", "s3:PutObject"], resources: [$interpolate`${uploads.arn}/*`] },
        { actions: ["s3:PutObject", "s3:DeleteObject"], resources: [$interpolate`${images.arn}/freebies/*`] },
        { actions: ["rekognition:DetectModerationLabels", "rekognition:DetectText"], resources: ["*"] },
      ],
      environment: {
        APP_TABLE: table.name,
        UPLOADS_BUCKET: uploads.name,
        IMAGES_BUCKET: images.name,
        NEXT_PUBLIC_IMAGES_URL: $interpolate`https://${images.domain}`,
        // Only the app's own variables; deploy settings like the Cloudflare token stay out of the Lambda
        ...Object.fromEntries(Object.entries(env).filter(([k]) => k.includes("CLERK") || k === "NEXT_PUBLIC_CONTACT_EMAIL")),
      },
    });

    return { url: web.url, table: table.name, images: images.domain };
  },
});
