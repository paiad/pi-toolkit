# open-tui 配置

`pi-open-tui` 是提供 header、footer、圆角 editor 与每轮 telemetry 的外部 Pi package。它装在**全局 scope**（`~/.pi/agent/settings.json` 的 `packages` 中的 `npm:pi-open-tui`），本仓库的 `package.json` 不声明它。

配置只有一个文件：`~/.pi/agent/open-tui.json`。字段定义以上游 `extensions/open-tui/config.ts` 为准，下表对应 0.3.5。

两种改法：

- `/open-tui` 面板（General / Appearance / Footer / Telemetry 四页）：每次改动即写回 JSON、立即生效并重渲染。
- 直接编辑 JSON：配置在 session 启动时读取一次，**重开 Pi 后生效**。

越界的 `wheelScrollLines` 会被截到 1–10，无法识别的枚举值回退到默认值；未知键保留在文件里但不生效。

## 总表

| 键 | 取值 | 默认 | 说明 |
| --- | --- | --- | --- |
| `enabled` | boolean | `true` | 总开关；`false` 会连 header 与 editor 一起卸掉 |
| `settingsLanguage` | `"en"` \| `"zh"` | `"en"` | 只影响 `/open-tui` 面板文案 |
| `cursorStyle` | `"block"` \| `"bar"` \| `"underline"` | `"block"` | `bar`/`underline` 需要终端支持设置光标形状 |
| `fullscreen.wheelScrollLines` | integer 1–10 | `4` | 全屏模式下每个滚轮格滚动的行数；在面板里对该项按 Enter 输入数字 |
| `icons.mode` | `"auto"` \| `"nerd"` \| `"ascii"` | `"auto"` | footer 与 telemetry 的字形集 |
| `footerSegments.*` | 10 个 boolean | 见下 | footer 显示哪些数据 |
| `telemetry.*` | `enabled` + 6 个 boolean | 全为 `true` | 每轮 agent 结束后的一条临时结果 |
| `thinkingPeek.lines` | `0` \| `1` \| `2` | `1` | 用 ticker 取代原生的 `Thinking...` 标签；`0` 关闭 |

## `icons.mode`

`auto` 依据环境变量 `TERM_PROGRAM`、`LC_TERMINAL`、`TERM`、`WT_SESSION` 判定，**不检测已安装的字体文件**。装了 Nerd Font 却仍出现方块或错字时，显式设为 `nerd`；明确不需要字体时设为 `ascii`。

## `fullscreen.wheelScrollLines`

只在 fullscreen（备用屏）模式生效。普通滚轮 = `wheelScrollLines` 行；按住 Alt 的滚轮 = 5 倍。

## `thinkingPeek.lines`

在 Pi 的 **Hide thinking** 打开、且模型确实在流式输出推理时，ticker 占用一行或两行。Hide thinking 关闭时该设置不产生任何显示。

## `footerSegments`

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `cwd` | `true` | 当前目录；宽度不足时缩短为 basename |
| `sessionName` | `false` | 仅在会话已命名时出现 |
| `gitBranch` | `true` | 分支名；detached HEAD 时显示 `HEAD` |
| `gitStatus` | `true` | 方括号内的计数：冲突、删除、修改、重命名、暂存、未跟踪、stash，以及 ahead / behind / diverged |
| `gitCommit` | `false` | 仅在 detached HEAD 时附上短 hash 与 tag |
| `runtime` | `true` | 项目运行时与版本（探测 57 种） |
| `context` | `true` | 上下文用量；宽度不足时降为图标+百分比，再不足时整段让位给其它段 |
| `tokens` | `true` | 输入 token（未缓存 + 缓存读）与输出 token，附缓存命中率 |
| `cost` | `true` | 本 session 累计成本 |
| `extensionStatuses` | `true` | 额外一行扩展状态；关掉会连 MCP 状态行一起隐藏 |

footer 固定两行：第一行左侧为 `cwd`、计时、git、`runtime`，右侧为 `context`；第二行左侧为模型与 thinking 等级，右侧为 `tokens`、`cost`。全部关掉 `footerSegments` 后这两行仍在，只有 `enabled: false` 才移除 footer。

## `telemetry`

| 键 | 默认 | 含义 |
| --- | --- | --- |
| `enabled` | `true` | 总开关 |
| `tps` | `true` | 输出 token 数 ÷ 生成总时间 |
| `ttft` | `true` | 首个 token 的延迟 |
| `duration` | `true` | 整轮耗时 |
| `tokens` | `true` | 输入与输出 token 数 |
| `stalls` | `true` | 停顿次数与总时长；间隔超过 1s 记一次 |
| `cost` | `true` | 该轮的 list-price 费率（每百万 token 的美元数），不是累计成本 |

## 完成标准

`/open-tui` 四页显示的取值与 `~/.pi/agent/open-tui.json` 一致，且 footer 与每轮 telemetry 按新配置渲染。手工改过 JSON 时，重开 Pi 后再核对这两处。
