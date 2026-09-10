# Pi toolkit

个人 Pi package，集中维护可复用的 Pi extensions 与 skills。当前注册 `session_search` 与项目级 `pi-mem`；`grilling` 与 `writing-for-agents` 作为 skills 提供。其他 extension 源码暂不随 package 加载。

## 安装

仅在当前项目启用（推荐）：

```sh
pi install -l git:github.com/paiad/pi-toolkit
```

本地开发：clone 后用相对路径安装，例如在仓库父目录执行 `pi install ./pi-toolkit`。

本地安装保存 package 路径，Pi 重启后加载该路径上的最新源码。更新 package 后运行 `npm test`，重启 Pi，并在工具列表中确认每个工具只注册一次。

## 开发与测试

项目测试固定使用 `@earendil-works/pi-coding-agent@0.85.1` 的本地 devDependency，不依赖机器全局安装的 Pi。运行：

```sh
npm ci
npm run typecheck
npm test
```

需要用另一个 Pi CLI 做 smoke test 时，可设置 `PI_CODING_AGENT_BIN` 为该可执行文件路径。CI 在 Windows、Linux、macOS 的 Node 22.19.x 与 Node 24.x 上运行相同检查。

## 资源

### Tools

| 工具 | 用途 |
| --- | --- |
| [session search](extensions/session-search/README.md)（入参与返回见 [docs/session-search.md](docs/session-search.md)） | 检索历史 Pi session，恢复上下文 |
| [pi-mem](extensions/pi-mem/README.md) | 项目私有的长期记忆、日志、scratchpad 与可选 qmd 搜索 |

### Optional project package

| Package | Purpose |
| --- | --- |
| [pi-web-access 集成](docs/pi-web-access.md) | 在当前 Pi project scope 中加载网页搜索与内容读取工具 |

### Skills

| Skill | 用途 |
| --- | --- |
| [grilling](skills/grilling/SKILL.md) | 拷问计划与决策，多轮收敛共识 |
| [writing-for-agents](skills/writing-for-agents/SKILL.md) | 写给 agent 看的文档（skill、AGENTS.md）的写法 |

每个 extension 位于 `extensions/<name>/index.ts`，并在根 `package.json` 的 `pi.extensions` 中声明。每个 skill 位于 `skills/<name>/SKILL.md`，并在根 `package.json` 的 `pi.skills` 中声明。测试随 extension 存放，统一由 `npm test` 运行。

<sub>grilling 与 writing-for-agents 源自 [mattpocock/skills](https://github.com/mattpocock/skills)（[grilling](https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling) 上游 08-20 · [writing-for-agents](https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents) 上游 08-21）。</sub>
