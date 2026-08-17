# pinterest-mcp

A guarded remote MCP bridge for publishing original Pinterest Pins without living in the Pinterest UI.

## Current status

v0.1 implements the Pinterest API + MCP safety core. It is designed for Amy/LabDojo's own Pinterest business account and defaults to **dry-run**.

### MCP tools

- `pinterest_status` — read safety/config state
- `list_boards` — read boards
- `get_pin` — direct Pin readback
- `preview_pin` — validate + duplicate-check, never writes
- `publish_pin` — create one image Pin only in `live` mode
- `publish_batch` — sequential bounded batch, maximum 10 Pins
- `create_board` — create one board only in `live` mode

There are deliberately **no update or delete tools** in v0.1.

## Safety contract

1. `PINTEREST_WRITE_MODE=dry-run` is the default.
2. The remote MCP endpoint requires `MCP_BRIDGE_TOKEN` bearer auth.
3. Pin destinations are restricted to `PINTEREST_ALLOWED_LINK_HOSTS` (Etsy by default).
4. Pin images must use HTTPS.
5. Pinterest field limits are enforced before API calls: title 100, description 800, alt text 500, link 2048 characters.
6. Before creation, the bridge checks the target board for an existing Pin with the same normalized title + destination link.
7. After creation, the bridge reads the returned Pin ID back and verifies board, title, and destination.
8. Batch writes are sequential and bounded to 10.
9. No secret belongs in Git, Notion, Figma, Drive docs, or chat transcripts.

## Authentication

The MVP uses Pinterest **Client Credentials** because this bridge automates the app owner's own account. Store only the app ID and app secret in deployment environment variables. Pinterest requires two-factor authentication for this grant type.

Requested scopes:

- `boards:read`
- `boards:write`
- `pins:read`
- `pins:write`

The server mints and caches access tokens as needed; no long-lived access token is committed.

## Pinterest developer prerequisites

1. Use a Pinterest business account and verify its email.
2. Enable 2FA for the account/app owner.
3. Register a Pinterest developer app and request API access.
4. Trial access can exercise Pin creation but created Pins are visible only to the creator. Standard access is the production target for public automation.
5. Copy the App ID + App Secret into deployment secrets only.

## Environment

Copy `.env.example` and set:

```bash
PINTEREST_APP_ID=...
PINTEREST_APP_SECRET=...
PINTEREST_WRITE_MODE=dry-run
PINTEREST_DEFAULT_BOARD_ID=...
PINTEREST_ALLOWED_LINK_HOSTS=etsy.com,www.etsy.com
MCP_BRIDGE_TOKEN=<random 24+ char secret>
```

## Deploy

The repo is Vercel-ready.

- health: `/health`
- MCP: `/mcp`

The MCP endpoint uses stateless Streamable HTTP so it works cleanly on serverless infrastructure.

## Image delivery

Pinterest can create image Pins from a public HTTPS `image_url`. Private Google Drive files should remain private and are **not** valid direct Pinterest media sources.

Planned Remy workflow:

`Drive approved master -> posting derivative -> controlled public asset URL -> preview_pin -> publish_pin/publish_batch -> Pinterest readback -> Notion status`

The public delivery layer is intentionally separate from source truth. Drive remains the authoritative archive.

## Remy Relics

`examples/remy-relics-parked-evidence-batch.json` contains the four evidence Pins that remain parked after the first four object Pins were manually posted. Their image URLs are intentionally blank until the controlled public media layer is connected.

## Local checks

```bash
npm install
npm run check
```

## Production rule

Do not flip `PINTEREST_WRITE_MODE=live` until all of the following are true:

- Pinterest app access is approved
- board ID is verified from API readback
- media URL is the approved final derivative
- `preview_pin` shows no collision
- title/description/alt/link match canon

Then write narrowly, verify the Pin ID, and park the bridge back in `dry-run` when doing one-off maintenance.
