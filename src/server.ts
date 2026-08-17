import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { assertAllowedLink, assertHttpsImage, isLive, loadConfig, type AppConfig } from "./config.js";
import {
  createBoard,
  createPin,
  findDuplicatePin,
  getPin,
  listBoards,
  PINTEREST_SCOPES,
  type PinInput,
} from "./pinterest.js";

const pinSchema = z.object({
  board_id: z.string().regex(/^\d+$/).optional(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(800),
  alt_text: z.string().min(1).max(500),
  link: z.string().url().max(2048),
  image_url: z.string().url(),
});

export type PinSpec = z.infer<typeof pinSchema>;

type PublishResult = {
  status: "dry-run" | "created" | "duplicate";
  title: string;
  board_id: string;
  pin_id?: string;
  link: string;
};

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function resolvePin(input: PinSpec, config: AppConfig): PinInput {
  const boardId = input.board_id ?? config.PINTEREST_DEFAULT_BOARD_ID;
  if (!boardId) throw new Error("board_id is required unless PINTEREST_DEFAULT_BOARD_ID is configured.");
  assertAllowedLink(input.link, config);
  assertHttpsImage(input.image_url);
  return { ...input, board_id: boardId };
}

async function publishOne(input: PinSpec, config: AppConfig): Promise<PublishResult> {
  const pin = resolvePin(input, config);
  const duplicate = await findDuplicatePin(config, pin);
  if (duplicate) {
    return {
      status: "duplicate",
      title: pin.title,
      board_id: pin.board_id,
      pin_id: duplicate.id,
      link: pin.link,
    };
  }

  if (!isLive(config)) {
    return { status: "dry-run", title: pin.title, board_id: pin.board_id, link: pin.link };
  }

  const created = await createPin(config, pin);
  if (created.board_id && created.board_id !== pin.board_id) throw new Error("Pinterest readback board mismatch.");
  if ((created.title ?? "").trim() !== pin.title.trim()) throw new Error("Pinterest readback title mismatch.");
  if ((created.link ?? "").trim() !== pin.link.trim()) throw new Error("Pinterest readback destination mismatch.");

  return {
    status: "created",
    title: pin.title,
    board_id: pin.board_id,
    pin_id: created.id,
    link: pin.link,
  };
}

export function createPinterestMcpServer(config: AppConfig = loadConfig()): McpServer {
  const server = new McpServer({ name: "pinterest-mcp", version: "0.1.0" });

  server.tool("pinterest_status", "Show bridge safety state without writing to Pinterest.", {}, async () =>
    textResult({
      ok: true,
      write_mode: config.PINTEREST_WRITE_MODE,
      default_board_id: config.PINTEREST_DEFAULT_BOARD_ID ?? null,
      allowed_link_hosts: [...config.allowedLinkHosts],
      auth_mode: "client_credentials",
      scopes: PINTEREST_SCOPES,
      destructive_tools_present: false,
    }),
  );

  server.tool("list_boards", "List Pinterest boards available to the connected account.", {}, async () => {
    const boards = await listBoards(config);
    return textResult({ count: boards.length, boards });
  });

  server.tool(
    "get_pin",
    "Read back one Pinterest Pin by ID.",
    { pin_id: z.string().regex(/^\d+$/) },
    async ({ pin_id }) => textResult(await getPin(config, pin_id)),
  );

  server.tool(
    "preview_pin",
    "Validate a Pin against bridge policy and check for an existing title+destination duplicate. Never writes.",
    pinSchema.shape,
    async (input) => {
      const pin = resolvePin(input, config);
      const duplicate = await findDuplicatePin(config, pin);
      return textResult({
        valid: true,
        would_create: !duplicate,
        duplicate_pin_id: duplicate?.id ?? null,
        pin,
      });
    },
  );

  server.tool(
    "publish_pin",
    "Create one original image Pin only when PINTEREST_WRITE_MODE=live. Duplicate-safe and verified by Pin readback.",
    pinSchema.shape,
    async (input) => textResult(await publishOne(input, config)),
  );

  server.tool(
    "publish_batch",
    "Publish up to 10 approved Pins sequentially. Stops on the first error. In dry-run, returns the exact plan without creating Pins.",
    { pins: z.array(pinSchema).min(1).max(10) },
    async ({ pins }) => {
      const results: PublishResult[] = [];
      for (const pin of pins) results.push(await publishOne(pin, config));
      return textResult({ count: results.length, results });
    },
  );

  server.tool(
    "create_board",
    "Create a public Pinterest board only when PINTEREST_WRITE_MODE=live.",
    { name: z.string().min(1).max(180), description: z.string().max(500).optional() },
    async ({ name, description }) => {
      if (!isLive(config)) return textResult({ status: "dry-run", would_create: { name, description: description ?? "" } });
      const board = await createBoard(config, { name, description });
      return textResult({ status: "created", board });
    },
  );

  return server;
}
