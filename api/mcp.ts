import type { VercelRequest, VercelResponse } from "@vercel/node";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { loadConfig } from "../src/config.js";
import { createPinterestMcpServer } from "../src/server.js";

function bearer(req: VercelRequest): string | null {
  const value = req.headers.authorization;
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const config = loadConfig();
    if (bearer(req) !== config.MCP_BRIDGE_TOKEN) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    const server = createPinterestMcpServer(config);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!res.headersSent) res.status(500).json({ error: message });
  }
}
