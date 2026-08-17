import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: "pinterest-mcp",
    version: "0.1.0",
    configured: {
      pinterest_app_id: Boolean(process.env.PINTEREST_APP_ID),
      pinterest_app_secret: Boolean(process.env.PINTEREST_APP_SECRET),
      bridge_token: Boolean(process.env.MCP_BRIDGE_TOKEN),
      default_board_id: Boolean(process.env.PINTEREST_DEFAULT_BOARD_ID),
    },
    write_mode: process.env.PINTEREST_WRITE_MODE ?? "dry-run",
  });
}
