import { z } from "zod";

const envSchema = z.object({
  PINTEREST_APP_ID: z.string().min(1),
  PINTEREST_APP_SECRET: z.string().min(1),
  PINTEREST_WRITE_MODE: z.enum(["dry-run", "live"]).default("dry-run"),
  PINTEREST_API_BASE: z.string().url().default("https://api.pinterest.com/v5"),
  PINTEREST_DEFAULT_BOARD_ID: z.string().regex(/^\d+$/).optional(),
  MCP_BRIDGE_TOKEN: z.string().min(24),
  PINTEREST_ALLOWED_LINK_HOSTS: z.string().default("etsy.com,www.etsy.com"),
});

export type AppConfig = z.infer<typeof envSchema> & { allowedLinkHosts: Set<string> };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env);
  return {
    ...parsed,
    allowedLinkHosts: new Set(
      parsed.PINTEREST_ALLOWED_LINK_HOSTS.split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean),
    ),
  };
}

export function assertAllowedLink(raw: string, config: AppConfig): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Pin destination must use HTTPS.");
  const host = url.hostname.toLowerCase();
  if (!config.allowedLinkHosts.has(host)) {
    throw new Error(`Destination host ${host} is not allowlisted.`);
  }
  return url;
}

export function assertHttpsImage(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Pin image URL must use HTTPS.");
  return url;
}

export function isLive(config: AppConfig): boolean {
  return config.PINTEREST_WRITE_MODE === "live";
}
