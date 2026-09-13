# Cloudflare MCP

Cloudflare's API MCP server (`https://mcp.cloudflare.com/mcp`) is wired into the global MCP config, so every Pi project reaches `cloudflare_docs`, `cloudflare_search` and `cloudflare_execute` through the `mcp` gateway.

## Wiring (all of it lives outside this repo)

| Piece | Location |
| --- | --- |
| Server entry | `~/.config/mcp/mcp.json` → `cloudflare`: `auth: "bearer"`, `bearerToken: "!~/.local/bin/cloudflare-mcp-token"` |
| Token script | `~/.local/bin/cloudflare-mcp-token` — prints the token, exits non-zero when the file is missing or empty |
| Token file | `~/.config/cloudflare-mcp/token`, mode `600` |

No secret is stored in the repo or in `mcp.json`: the `!command` form runs the script at connect time.

Editing `mcp.json` needs a reload — the adapter reads it at startup only (`/reload` in the TUI, or restart Pi). Until then the server shows as unknown.

## Why a token, not OAuth or the credential store

This host is headless (no browser; OAuth redirects to `localhost`) and has no Secret Service — `@napi-rs/keyring` needs libsecret — so `auth: "oauth"` and `bearerTokenStore: true` are both unusable here. An account-owned API token (`cfat_…`) sent as a bearer token was verified working (`initialize` 200, `tools/list` returns the three tools).

## Rotating the token

- It expires **2027-09-13**. Recreate it in the [dashboard](https://dash.cloudflare.com/profile/api-tokens) before then, then rewrite `~/.config/cloudflare-mcp/token`; the script and `mcp.json` stay unchanged.
- Rotation **cannot** be automated: Cloudflare refuses to grant `Account API Tokens Write` to a sub-token created through the API (`sub-token is not allowed to have permissions to manage other tokens`), so no token here can create or delete tokens. The last rotation was done by letting the outgoing token delete itself.
- Scopes: 166 permission groups — account-wide plus every zone in the account (the original 167 minus `Account API Tokens Write`).

## Tools

| Tool | Use |
| --- | --- |
| `cloudflare_docs` | Cloudflare documentation search |
| `cloudflare_search` | Cloudflare OpenAPI spec search (with `$ref`s pre-resolved) |
| `cloudflare_execute` | Runs JavaScript against `cloudflare.request()` |

`execute` is **write-capable**: it does whatever the token allows, including DNS, Workers, Zero Trust and Billing. Destructive or resolution-affecting changes (deleting DNS records, deleting Workers/KV/R2/D1 data, Billing / Zero Trust / users / tokens, anything that could take `paiad.top` offline) are confirmed with the user beforehand.
