import type { AppConfig } from "./config.js";

export const PINTEREST_SCOPES = ["boards:read", "boards:write", "pins:read", "pins:write"] as const;

export type PinterestBoard = {
  id: string;
  name: string;
  description?: string | null;
  privacy?: string;
};

export type PinterestPin = {
  id: string;
  title?: string | null;
  description?: string | null;
  alt_text?: string | null;
  link?: string | null;
  board_id?: string | null;
  created_at?: string | null;
};

export type PinInput = {
  board_id: string;
  title: string;
  description: string;
  alt_text: string;
  link: string;
  image_url: string;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

type ListResponse<T> = { items: T[]; bookmark?: string | null };

let cachedToken: { value: string; expiresAt: number } | null = null;

function basicAuth(config: AppConfig): string {
  return Buffer.from(`${config.PINTEREST_APP_ID}:${config.PINTEREST_APP_SECRET}`).toString("base64");
}

export async function getAccessToken(config: AppConfig): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - now > 5 * 60_000) return cachedToken.value;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: PINTEREST_SCOPES.join(","),
  });

  const response = await fetch(`${config.PINTEREST_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth(config)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = (await response.json()) as Partial<TokenResponse> & { message?: string };
  if (!response.ok || !json.access_token || !json.expires_in) {
    throw new Error(`Pinterest token request failed (${response.status}): ${json.message ?? JSON.stringify(json)}`);
  }

  cachedToken = {
    value: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return json.access_token;
}

async function pinterestRequest<T>(config: AppConfig, path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken(config);
  const response = await fetch(`${config.PINTEREST_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`Pinterest API ${response.status}: ${json.message ?? text}`);
  }
  return json as T;
}

export async function listBoards(config: AppConfig): Promise<PinterestBoard[]> {
  const result = await pinterestRequest<ListResponse<PinterestBoard>>(config, "/boards?page_size=100");
  return result.items ?? [];
}

export async function getPin(config: AppConfig, pinId: string): Promise<PinterestPin> {
  return pinterestRequest<PinterestPin>(config, `/pins/${encodeURIComponent(pinId)}`);
}

export async function listBoardPins(config: AppConfig, boardId: string): Promise<PinterestPin[]> {
  const result = await pinterestRequest<ListResponse<PinterestPin>>(
    config,
    `/boards/${encodeURIComponent(boardId)}/pins?page_size=100`,
  );
  return result.items ?? [];
}

export async function createBoard(
  config: AppConfig,
  input: { name: string; description?: string },
): Promise<PinterestBoard> {
  return pinterestRequest<PinterestBoard>(config, "/boards", {
    method: "POST",
    body: JSON.stringify({ name: input.name, description: input.description ?? "" }),
  });
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export async function findDuplicatePin(config: AppConfig, input: PinInput): Promise<PinterestPin | null> {
  const pins = await listBoardPins(config, input.board_id);
  return (
    pins.find(
      (pin) => normalize(pin.title) === normalize(input.title) && normalize(pin.link) === normalize(input.link),
    ) ?? null
  );
}

export async function createPin(config: AppConfig, input: PinInput): Promise<PinterestPin> {
  const created = await pinterestRequest<PinterestPin>(config, "/pins", {
    method: "POST",
    body: JSON.stringify({
      board_id: input.board_id,
      title: input.title,
      description: input.description,
      alt_text: input.alt_text,
      link: input.link,
      media_source: {
        source_type: "image_url",
        url: input.image_url,
        is_standard: true,
      },
    }),
  });
  if (!created.id) throw new Error("Pinterest create response did not contain a Pin ID.");
  return getPin(config, created.id);
}
