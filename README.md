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

MCP config is read from project-level `.mcp.json` and global `~/.config/mcp/mcp.json` (also `~/.agents/mcp.json`); run `/mcp setup` on first use to import existing Cursor / Claude Code / Codex configs.

### Optional project package

| Package | Purpose |
| --- | --- |
| [pi-web-access integration](docs/pi-web-access.md) (upstream [nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access)) | Load web search and content fetching tools in the current Pi project scope |

### Skills

| Skill | Purpose |
| --- | --- |
| [grilling](skills/grilling/SKILL.md) | Interrogate a plan or decision until it converges |
| [writing-for-agents](skills/writing-for-agents/SKILL.md) | How to write documents an agent consumes (skills, `AGENTS.md`) |

> `extensions/pi-mcp-adapter/skills/mcp-scripting/` is a skill shipped by that adapter, but the root `pi.skills` only declares `./skills`, so it is not currently in the available skill list.

<sub>grilling and writing-for-agents come from [mattpocock/skills](https://github.com/mattpocock/skills) ([grilling](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling) upstream 08-20 · [writing-for-agents](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents) upstream 08-21).</sub>
