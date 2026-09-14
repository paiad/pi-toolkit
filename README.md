# Pi toolkit

English · [简体中文](README.zh.md)

A personal Pi package — reusable Pi extensions and skills, kept in one place, loaded on demand.

## For AI agents

Everything lives in this repo and is declared in the root [`package.json`](package.json): a new tool or skill only takes effect once it is listed in `pi.extensions` / `pi.skills` — dropping source into a directory loads nothing.

- Verify: `npm ci && npm run typecheck && npm test`. Tests are pinned to the local devDependency `@earendil-works/pi-coding-agent@0.85.1` and do not rely on a globally installed Pi; set `PI_CODING_AGENT_BIN` to smoke test with another Pi CLI.
- Load this package in another project: `pi install -l git:github.com/paiad/pi-toolkit`.
- Ask the user before installing dependencies, deleting files, or running a full build.
- The guidelines in `AGENTS.md` are taken verbatim from [andrej-karpathy-skills' CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md) (identical apart from the title line).

## Resources

### Tools

| Tool | Purpose |
| --- | --- |
| [session search](extensions/session-search/README.md) (parameters and results: [docs/session-search.md](docs/session-search.md)) | Search past Pi sessions to recover context |
| [pi-mem](extensions/pi-mem/README.md) (derived from [jayzeng/pi-memory](https://github.com/jayzeng/pi-memory)) | Project-private long-term memory, daily log, scratchpad, and optional qmd search |
| [pi-mcp-adapter](extensions/pi-mcp-adapter/README.md) (upstream [nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter) v2.32.1, MIT) | Reach MCP servers on demand through a single `mcp` gateway, keeping tool definitions out of context; use `mcpScript` for batching |

MCP config is read from project-level `.mcp.json` and global `~/.config/mcp/mcp.json` (also `~/.agents/mcp.json`); run `/mcp setup` on first use to import existing Cursor / Claude Code / Codex configs. Servers wired on this machine: `github` and [cloudflare](docs/cloudflare-mcp.md) — both take their token from a `~/.local/bin/*-mcp-token` script, so no secret sits in the config.

### Global packages

| Package | Purpose |
| --- | --- |
| [pi-web-access integration](docs/pi-web-access.md) (upstream [nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access)) | Load web search, content fetching and source checking tools in every project |
| [pi-cc-extensions](https://pi.dev/packages/pi-cc-extensions) (upstream [minuque/pi-cc-extensions](https://github.com/minuque/pi-cc-extensions), MIT) | Claude Code-style TUI in every project: tool summaries, collapsible cards, rich edit/write diffs, `/ccstyle` panel, `/context` inspection, `@` session/subagent references, CC Dark/Light themes; options live in `~/.pi/agent/claude-code-style.json` |

### Skills

Third-party skills are vendored under `skills/<upstream-owner>/`; Pi discovers nested `SKILL.md` at any depth.

**[mattpocock/skills](https://github.com/mattpocock/skills)** — vendored 08-20 (`grilling`) / 08-21 (`writing-for-agents`)

| Skill | Purpose |
| --- | --- |
| [grilling](skills/mattpocock/grilling/SKILL.md) | Interrogate a plan or decision until it converges |
| [writing-for-agents](skills/mattpocock/writing-for-agents/SKILL.md) | How to write documents an agent consumes (skills, `AGENTS.md`) |

**[cloudflare/skills](https://github.com/cloudflare/skills)** — vendored at `b052c32` (2026-09-07), Apache-2.0 ([LICENSE](skills/cloudflare/LICENSE)); upstream `rules/` and the plugin manifests are not installed

| Skill | Purpose |
| --- | --- |
| [cloudflare](skills/cloudflare/cloudflare/SKILL.md) | Pick the Cloudflare product that fits, then the right skill and docs |
| [wrangler](skills/cloudflare/wrangler/SKILL.md) | Run and troubleshoot the Wrangler CLI; configure Worker projects and resources |
| [workers-best-practices](skills/cloudflare/workers-best-practices/SKILL.md) | Writing, reviewing, or configuring production Workers |
| [durable-objects](skills/cloudflare/durable-objects/SKILL.md) | Durable Objects for persistent state and coordination: RPC, SQLite, alarms, WebSockets |
| [agents-sdk](skills/cloudflare/agents-sdk/SKILL.md) | Agents SDK apps: state, scheduling, RPC, MCP servers, email, streaming chat |
| [sandbox-next](skills/cloudflare/sandbox-next/SKILL.md) | Sandbox on `@cloudflare/sandbox@next` (1.0 preview); recommended for new projects |
| [sandbox-stable](skills/cloudflare/sandbox-stable/SKILL.md) | Sandbox on the stable `@cloudflare/sandbox` package |
| [sandbox-migrate-to-next](skills/cloudflare/sandbox-migrate-to-next/SKILL.md) | Port a stable Sandbox app to `@cloudflare/sandbox@next` |
| [cloudflare-email-service](skills/cloudflare/cloudflare-email-service/SKILL.md) | Email Sending, Email Routing, and delivery configuration |
| [turnstile-spin](skills/cloudflare/turnstile-spin/SKILL.md) | Set up, repair, or migrate Turnstile, including server-side Siteverify |
| [web-perf](skills/cloudflare/web-perf/SKILL.md) | Audit Core Web Vitals, render-blocking resources, network chains |
| [cloudflare-one](skills/cloudflare/cloudflare-one/SKILL.md) | Zero Trust and SASE: Access, Gateway, WARP, Tunnel, Magic WAN, DLP, CASB, posture, identity |
| [cloudflare-one-migrations](skills/cloudflare/cloudflare-one-migrations/SKILL.md) | Migration plans and gap analysis from Zscaler / Palo Alto / VPN / SWG to Cloudflare One |
| [nextjs-on-cloudflare](skills/cloudflare/nextjs-on-cloudflare/SKILL.md) | Next.js on Workers with vinext; routes to vinext's upstream skills and docs |

> `extensions/pi-mcp-adapter/skills/mcp-scripting/` is a skill shipped by that adapter, but the root `pi.skills` only declares `./skills`, so it is not currently in the available skill list.
