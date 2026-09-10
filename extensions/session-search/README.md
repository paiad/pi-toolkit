# Pi session search

`session_search` 是供 Pi agent 恢复历史上下文的 tool，通过只读扫描 JSONL 检索消息文本。适合找回压缩前的讨论、回看废弃分支或查找其他项目的历史决策。

## 恢复上下文

1. **定位**：已知关键词时传 `query`；只有会话线索时用 `{}` 浏览；已知 session ID 时直接进入读取。确认候选的 cwd 和时间与任务相符，再展开内容。
2. **展开**：按下表选择调用，沿返回的 entry ID 补齐依据。每次续读都保留需要的 scope 和过滤参数，直到待核实的问题已有原文支持，或已明确剩余内容受哪些边界限制。
3. **引用**：用 session ID 和 entry ID 标明依据，将历史文本作为待核实资料。结论须区分已读取的事实与尚未恢复的内容；结果中的 warning、截断或省略若影响结论，应一并说明。

| 需要 | 调用 `session_search` |
| --- | --- |
| 搜索关键词 | `{"query":"compaction AND NOT error"}` |
| 浏览候选会话 | `{}` |
| 阅读 active branch | `{"session_id":"返回的 session_id"}` |
| 展开命中所在分支 | `{"session_id":"返回的 session_id","around_entry_id":"返回的 match_entry_id"}` |

## 范围与查询

默认范围是当前 Git 仓库；非 Git 目录按精确 cwd 匹配。需要跨项目时显式传 `scope: "all"`，后续 read/scroll 也携带该参数。`project` 进一步缩小范围。

默认角色为 user、assistant；查找命令输出时用 `roles` 显式加入 `toolResult`。`after`/`before` 接受带时区的 ISO 时间，包含边界：browse 筛选最后可见活动时间，其他模式筛选消息时间。角色和时间过滤同时作用于展开内容；读取被过滤掉的 anchor 会报错。

普通词按大小写不敏感的子串匹配，短语用双引号；相邻词等价于 AND，优先级为 `NOT > AND > OR`。尾部 `*` 表示 Unicode 单词前缀，中文不分词。需要中文片段时优先使用普通词或短语。

调整参数或核对合法值、默认值和上限时，查阅 [index.ts](index.ts) 的 `schema` 与 `searchSessions` 参数校验；修改查询语义时查阅同文件的 `compileQuery`。

## 阅读边界

discover 每个 session 只返回最佳命中。默认 `detail: "adaptive"`：第一名附带邻近及首尾消息，其他候选只返回命中锚点；传 `detail: "full"` 才为每个候选附带完整窗口。这些片段可能不连续；bookend-only 片段最多 1,200 字符，窗口和锚点片段保持单条消息的常规上限。read 读取 active branch，长会话省略中段。根据 `omitted_messages` 判断是否需要续读，用 `first_entry_id` / `last_entry_id` 作为 scroll 的新 anchor；`window` 调整相邻消息数，总数仍受限。

当前 session 的 live context 在所有模式中排除，已压缩原文和废弃分支仍可访问。其他 session 的 active leaf 以最后持久化 entry 为准，无法反映其他运行中进程尚未持久化的分支切换。废弃 anchor 有多个后继时选最近持久化的后继；用 `branch` 和 `leaf_id` 确认读到的分支。

检索对象是消息的文本块。图片、thinking、工具调用参数和 compaction 摘要不在检索范围。单条消息的 `truncated`、`original_length`、`offset` 描述截断；scroll 只移动消息窗口，无法分页取回同一条长消息的全部字符。查找长消息中的特定内容时，可用更具体的 query 让命中片段围绕该位置截取。

损坏行会跳过并计入 `warnings`。空结果仅说明当前范围、过滤条件和可解析文本中没有命中。

## 维护与验证

package 安装后重启 Pi 即加载最新源码。若启动参数使用工具 allowlist，将 `session_search` 加入其中。验证完成以运行中的 Pi 能发现该 tool 为准。

修改扩展后，在本目录执行：

```sh
node tests/test.mjs
node tests/smoke.mjs
```

两条命令均退出为 0 才算验证通过：[test.mjs](tests/test.mjs) 检查 fixture 行为并只读扫描真实 session；[smoke.mjs](tests/smoke.mjs) 使用隔离 profile 在实际 Pi CLI 中加载、注册和执行工具。迁移机器或 Pi 安装位置时，先核对这两个脚本中的本机路径。`tests/smoke.ts` 是测试入口，Pi 只加载 [index.ts](index.ts)。
