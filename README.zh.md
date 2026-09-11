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

MCP 配置读取项目级 `.mcp.json` 与全局 `~/.config/mcp/mcp.json`（兼容 `~/.agents/mcp.json`），首次使用可运行 `/mcp setup` 从 Cursor、Claude Code、Codex 等已有配置导入。

### Global packages

| Package | 用途 |
| --- | --- |
| [pi-web-access 集成](docs/pi-web-access.md)（上游 [nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access)） | 在所有项目中加载网页搜索、内容读取与主张核验工具 |
| [open-tui 配置](docs/open-tui.md)（[fork 自 OldSuns/pi-open-tui](https://github.com/OldSuns/pi-open-tui) v0.3.5，源码在 `extensions/pi-open-tui/`） | Pi TUI 的 header、footer、圆角 editor 与每轮 telemetry；可配置项都在 `~/.pi/agent/open-tui.json` |

### Skills

| Skill | 用途 |
| --- | --- |
| [grilling](skills/grilling/SKILL.md) | 拷问计划与决策，多轮收敛共识 |
| [writing-for-agents](skills/writing-for-agents/SKILL.md) | 写给 agent 看的文档（skill、AGENTS.md）的写法 |

> `extensions/pi-mcp-adapter/skills/mcp-scripting/` 是该 adapter 自带的 skill，但根 `pi.skills` 只声明了 `./skills`，所以它当前不在可用 skill 列表中。

<sub>grilling 与 writing-for-agents 源自 [mattpocock/skills](https://github.com/mattpocock/skills)（[grilling](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling) 上游 08-20 · [writing-for-agents](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents) 上游 08-21）。</sub>
