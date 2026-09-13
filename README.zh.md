# Pi toolkit

[English](README.md) · 简体中文

个人的 Pi package —— 可复用的 Pi extensions 与 skills，集中一处，按需装载。

## For AI agents

本仓库的资源都在仓库内，且由根 [`package.json`](package.json) 声明：新增 tool 或 skill 必须写进 `pi.extensions` / `pi.skills` 才会生效，仅把源码放进目录不加载。

- 验证：`npm ci && npm run typecheck && npm test`。测试固定使用本地 devDependency 的 `@earendil-works/pi-coding-agent@0.85.1`，不依赖机器上全局安装的 Pi；用另一个 Pi CLI 做 smoke test 时设置 `PI_CODING_AGENT_BIN`。
- 在别的项目加载本 package：`pi install -l git:github.com/paiad/pi-toolkit`。
- 安装依赖、删除文件、运行完整构建之前先询问用户。
- `AGENTS.md` 的行为准则取自 [andrej-karpathy-skills 的 CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md)（逐字一致，仅首行标题不同）。

## 资源

### Tools

| 工具 | 用途 |
| --- | --- |
| [session search](extensions/session-search/README.md)（入参与返回见 [docs/session-search.md](docs/session-search.md)） | 检索历史 Pi session，恢复上下文 |
| [pi-mem](extensions/pi-mem/README.md)（派生自 [jayzeng/pi-memory](https://github.com/jayzeng/pi-memory)） | 项目私有的长期记忆、日志、scratchpad 与可选 qmd 搜索 |
| [pi-mcp-adapter](extensions/pi-mcp-adapter/README.md)（上游 [nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter) v2.32.1，MIT） | 用单个 `mcp` 网关按需接入 MCP servers，工具定义不常驻 context；批处理用 `mcpScript` |

MCP 配置读取项目级 `.mcp.json` 与全局 `~/.config/mcp/mcp.json`（兼容 `~/.agents/mcp.json`），首次使用可运行 `/mcp setup` 从 Cursor、Claude Code、Codex 等已有配置导入。本机已接入的两个 server：`github` 与 [cloudflare](docs/cloudflare-mcp.md)——两者都把 token 交给 `~/.local/bin/*-mcp-token` 脚本现取，配置文件里不存密钥。

### Global packages

| Package | 用途 |
| --- | --- |
| [pi-web-access 集成](docs/pi-web-access.md)（上游 [nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access)） | 在所有项目中加载网页搜索、内容读取与主张核验工具 |
| [open-tui 配置](docs/open-tui.md)（[fork 自 OldSuns/pi-open-tui](https://github.com/OldSuns/pi-open-tui) v0.3.5，源码在 `extensions/pi-open-tui/`） | Pi TUI 的 header、footer、圆角 editor 与每轮 telemetry；可配置项都在 `~/.pi/agent/open-tui.json` |

### Skills

第三方 skill 统一放在 `skills/<上游作者>/` 下；pi 递归发现任意层级的 `SKILL.md`。

**[mattpocock/skills](https://github.com/mattpocock/skills)** — vendor 于 08-20（`grilling`）/ 08-21（`writing-for-agents`）

| Skill | 用途 |
| --- | --- |
| [grilling](skills/mattpocock/grilling/SKILL.md) | 拷问计划与决策，多轮收敛共识 |
| [writing-for-agents](skills/mattpocock/writing-for-agents/SKILL.md) | 写给 agent 看的文档（skill、AGENTS.md）的写法 |

**[cloudflare/skills](https://github.com/cloudflare/skills)** — vendor 于 `b052c32`（2026-09-07），Apache-2.0（[许可证](skills/cloudflare/LICENSE)）；上游的 `rules/` 与各 plugin 清单未安装

| Skill | 用途 |
| --- | --- |
| [cloudflare](skills/cloudflare/cloudflare/SKILL.md) | 入口：选定要用的 Cloudflare 产品，再指向对应的 skill 与文档 |
| [wrangler](skills/cloudflare/wrangler/SKILL.md) | Wrangler CLI 的使用与排错；配置 Worker 项目与资源 |
| [workers-best-practices](skills/cloudflare/workers-best-practices/SKILL.md) | 生产环境 Workers 的编写、审阅与配置 |
| [durable-objects](skills/cloudflare/durable-objects/SKILL.md) | Durable Objects 持久化状态与协调：RPC、SQLite、alarms、WebSocket |
| [agents-sdk](skills/cloudflare/agents-sdk/SKILL.md) | Agents SDK 应用：状态、调度、RPC、MCP server、邮件、流式对话 |
| [sandbox-next](skills/cloudflare/sandbox-next/SKILL.md) | `@cloudflare/sandbox@next`（1.0 预览）上的 Sandbox；新项目推荐 |
| [sandbox-stable](skills/cloudflare/sandbox-stable/SKILL.md) | 稳定版 `@cloudflare/sandbox` 上的 Sandbox |
| [sandbox-migrate-to-next](skills/cloudflare/sandbox-migrate-to-next/SKILL.md) | 把稳定版 Sandbox 应用迁到 `@cloudflare/sandbox@next` |
| [cloudflare-email-service](skills/cloudflare/cloudflare-email-service/SKILL.md) | Email Sending、Email Routing 与投递配置 |
| [turnstile-spin](skills/cloudflare/turnstile-spin/SKILL.md) | Turnstile 的搭建、修复、迁移，含服务端 Siteverify |
| [web-perf](skills/cloudflare/web-perf/SKILL.md) | Core Web Vitals、阻塞渲染资源、网络链路的体检与优化 |
| [cloudflare-one](skills/cloudflare/cloudflare-one/SKILL.md) | Zero Trust 与 SASE：Access、Gateway、WARP、Tunnel、Magic WAN、DLP、CASB、设备态势、身份 |
| [cloudflare-one-migrations](skills/cloudflare/cloudflare-one-migrations/SKILL.md) | 从 Zscaler / Palo Alto / 传统 VPN、SWG 迁到 Cloudflare One 的方案与差距分析 |
| [nextjs-on-cloudflare](skills/cloudflare/nextjs-on-cloudflare/SKILL.md) | 用 vinext 在 Workers 上跑 Next.js；会转去 vinext 上游的 skill 与文档 |

> `extensions/pi-mcp-adapter/skills/mcp-scripting/` 是该 adapter 自带的 skill，但根 `pi.skills` 只声明了 `./skills`，所以它当前不在可用 skill 列表中。
