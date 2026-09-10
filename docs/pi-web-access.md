# pi-web-access 项目集成

`pi-web-access` 是提供 `web_search` 与 `fetch_content` 的外部 Pi package。它只在当前项目安装；本仓库 `package.json` 声明的 extension 仍只有 `session_search`。

各 provider 的字段与限制以上游配置文档为准：<https://github.com/nicobailon/pi-web-access#configuration>。

## 安装与验证

在仓库根目录执行，将 package 写入项目的 Pi 设置：

```powershell
pi install -l npm:pi-web-access --approve
```

完成标准：`.pi/settings.json` 同时列出本地 toolkit 路径与 `"npm:pi-web-access"`。从本仓库重启 Pi 后，确认可用工具包含 `session_search`、`web_search` 与 `fetch_content`。

不要把 `pi-web-access` 加入本仓库的 `package.json`：Pi 从 `.pi/settings.json` 加载项目 package，不会自动加载 npm 的传递依赖。`.pi/` 是本地状态，保持由 Git 忽略。

## 全局 provider 配置

网页搜索 provider 设置存放在 `~/.pi/agent/web-search.json`。该文件是用户本地配置，不提交到 Git；它对每个加载 `pi-web-access` 的项目生效。

最小配置保留上游的自动路由：

```json
{
  "provider": "auto"
}
```

没有配置 SearXNG、且当前模型不是 `openai-codex`（例如 LongCat）时，自动路由会优先尝试 Exa，再依次尝试其他可用 provider。`openai-codex` 可以优先使用 Codex 支持的 OpenAI search。实际可用性仍取决于认证和网络。

## 工具与使用场景

| 工具 | 适用场景 | 先做什么 |
| --- | --- | --- |
| `web_search` | 发现来源、比较多个结果、按时效或域名检索 | 先写清查询、时效和可信域名 |
| `fetch_content` | 读取已知 URL、GitHub 仓库/PR/Issue、PDF、视频、图片或原始接口响应 | 已有具体 URL 时直接调用，不必先搜索 |
| `get_search_content` | 从本次会话的已保存搜索/抓取结果中定位原文 | 使用返回的 `responseId`，避免重复抓取大页面 |
| `source_check` | 核验一个明确主张并返回可审计的证据状态 | 将需要验证的陈述写入 `claim`，必要时限制域名 |

### `web_search`：发现与比较来源

默认每个查询返回 5 条结果，最多 20 条；批量查询最多并发 3 条。`workflow` 默认为 `summary-review`，会打开 curator 供人工筛选；agent 需要直接得到结果时，优先用 `auto-summary` 或 `none`。

```ts
// 时效与域名约束
web_search({
  query: "Pi coding agent extension packages",
  recencyFilter: "month",
  domainFilter: ["github.com", "-gist.github.com"],
  numResults: 10,
  workflow: "auto-summary"
})

// 并列检索；适合比较两个候选方案
web_search({
  queries: ["LongCat coding benchmark", "LongCat API pricing"],
  workflow: "none"
})

// 仅在已配置对应凭据时指定 provider
web_search({ query: "Tavily API changelog", provider: "tavily" })
```

设置 `includeContent: true` 会后台抓取搜索结果的全文，适合需要立刻比较正文的任务；仅需链接和摘要时保持默认，减少网络调用。

### Curator：本地人工筛选界面

`web_search` 默认使用 `summary-review`。每次调用会启动一个临时的 curator：它绑定在 `127.0.0.1`、随机分配端口，并生成形如 `http://localhost:<port>/?session=<token>` 的地址。该 `session` 是 curator 的临时访问令牌，不是 Pi 的 session ID；搜索完成、超时或取消后服务会退出。

| `workflow` | 行为 | 适用场景 |
| --- | --- | --- |
| `summary-review` | 默认。打开 curator，生成摘要草稿，等待人工选择或确认 | 需要人审结果与来源 |
| `auto-summary` | 不打开 curator，直接生成摘要 | agent 自主检索且需要简洁结论 |
| `none` | 不打开 curator，直接返回原始搜索结果 | 后续由 agent 自己比较、筛选或核验 |

可以为单次调用指定模式，也可以在 `~/.pi/agent/web-search.json` 设置默认值：

```ts
web_search({
  query: "Pi extension security guidance",
  workflow: "none"
})
```

```json
{
  "provider": "auto",
  "workflow": "auto-summary",
  "curatorTimeoutSeconds": 20,
  "autoOpenBrowser": false
}
```

上述配置保留自动搜索但不自动打开浏览器。保留 `summary-review` 且设置 `autoOpenBrowser: false` 时，curator 仍会提供本地 URL，只是需要手动打开。默认 curator 仅监听本机；只有显式配置 `curatorRemote` 才会允许其他设备访问，按本地使用场景保持默认即可。

### `fetch_content`：读取已知资源

`mode: "readable"` 是网页正文的默认模式；`raw` 返回原始文本 HTTP body；`answer` 以抓取到的正文为依据回答一个具体问题。`answer` 模式可能将页面内容发送给配置的回答模型，应只用于允许该处理的内容。

```ts
// 普通文章转为可读 Markdown
fetch_content({ url: "https://example.com/guide" })

// 读取 JSON 或其他原始文本响应
fetch_content({ url: "https://api.example.com/status", mode: "raw" })

// 只针对该页面回答问题
fetch_content({
  url: "https://example.com/guide",
  mode: "answer",
  prompt: "列出安装步骤和最低版本要求"
})

// GitHub 仓库会优先本地 clone；PR 与 Issue 会渲染为结构化 Markdown
fetch_content({ url: "https://github.com/owner/repo" })
fetch_content({ url: "https://github.com/owner/repo/pull/123" })
```

同一工具还识别 PDF、图片、YouTube 和本地视频。视频分析需提供问题；提取帧可用时间戳和帧数：

```ts
fetch_content({
  url: "https://youtube.com/watch?v=example",
  prompt: "这个视频演示了哪些工具？",
  timestamp: "02:10-02:30",
  frames: 4
})
```

视频理解和帧提取依赖可用的 Gemini/Perplexity 配置及可选的 `ffmpeg`、`yt-dlp`；不可用时应返回能力不足的结果，而不是假定视频已被读取。

### `get_search_content`：按需读取缓存正文

`web_search` 与 `fetch_content` 的正文会私有缓存，默认保存 1 小时。先用 `findText` 找到位置，再用 `offset`/`limit` 读取片段，避免把整篇长文注入上下文。

```ts
// 在缓存中定位安装相关段落
get_search_content({
  responseId: "上一步返回的 responseId",
  urlIndex: 0,
  findText: "installation"
})

// 读取指定偏移后的受限片段
get_search_content({
  responseId: "上一步返回的 responseId",
  urlIndex: 0,
  offset: 12000,
  limit: 4000
})
```

`findText` 不能与 `offset` 或 `limit` 同时使用。缓存不是会话 JSONL；其中可能包含完整抓取正文，按敏感资料处理。

### `source_check`：核验主张

对于会影响结论的事实，优先使用 `source_check` 而非仅凭搜索摘要下结论。它返回 `supported`、`contradicted`、`unclear` 或 `missing-evidence`，并提供可定位的原文段落与内容哈希。

```ts
source_check({
  claim: "该 API 支持流式响应",
  queries: ["API streaming documentation", "API streaming limitations"],
  domainFilter: ["docs.example.com", "-old.example.com"],
  fetchContent: true
})
```

## 交互命令

| 命令 | 用途 |
| --- | --- |
| `/websearch` | 打开 curator，人工选择结果并发送摘要或选中结果 |
| `/curator on\|off\|summary-review` | 切换或设置 `web_search` 的 curator 工作流 |
| `/search` | 浏览当前会话已保存的搜索结果与 `responseId` |
| `/google-account` | 检查 Gemini Web 使用的 Google 账号与浏览器 cookie 状态 |

## 选择 provider

所有搜索都使用同一 provider 时，设置顶层 `provider`。密钥引用环境变量，不把明文密钥放入文件：

```json
{
  "provider": "tavily",
  "tavilyApiKey": "$TAVILY_API_KEY"
}
```

需要明确 fallback 顺序时，使用 `searchRouting`。此时不设置顶层 `provider`，使路由按配置执行：

```json
{
  "searchRouting": {
    "providers": ["exa", "openai", "tavily"],
    "useCurrentModel": true,
    "fallbackOn": ["unsupported", "transient", "quota", "network", "invalid-response"]
  },
  "tavilyApiKey": "$TAVILY_API_KEY"
}
```

修改配置后重启 Pi。若 `web_search` 失败，先核验所选 provider 的凭据，再查看上游配置文档中的 provider 字段和限制。
