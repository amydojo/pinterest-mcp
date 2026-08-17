# Security

This repository must never contain Pinterest app secrets, access tokens, refresh tokens, MCP bearer tokens, or other credentials.

## Secret handling

Use deployment environment variables only:

- `PINTEREST_APP_ID`
- `PINTEREST_APP_SECRET`
- `MCP_BRIDGE_TOKEN`

Do not paste production credentials into issues, pull requests, README examples, Notion, Figma, Google Drive docs, screenshots, or chat.

Pinterest participates in GitHub secret scanning. A leaked Pinterest token can be detected and revoked. Treat every token as compromised if it ever appears in committed content.

## Write safety

Production writes require `PINTEREST_WRITE_MODE=live`. Keep `dry-run` as the parked default for maintenance and development.

The v0.1 server intentionally exposes no Pin/board update or delete tools.
