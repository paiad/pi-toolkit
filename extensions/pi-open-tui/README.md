# pi-open-tui（本仓库 fork）

从 [OldSuns/pi-open-tui](https://github.com/OldSuns/pi-open-tui) **0.3.5** fork 进本仓库的本地扩展，随项目走 git，不再 patch 全局 node_modules。

## 相对上游的本地改动

1. `footer.ts` — cost 显示去掉 `$` 前缀（`:172`）
2. `footer.ts` / `utils.ts` — 模型名改为逐字符彩虹（`rainbowText`，truecolor；`utils.ts:224-258`）

## 跟随上游

```bash
npm pack pi-open-tui@<新版本> --pack-destination /tmp
tar xzf /tmp/pi-open-tui-<版本>.tgz -C /tmp
diff -ru <(cd /tmp/package/extensions/open-tui && ls *.ts) extensions/pi-open-tui  # 或逐个文件 diff
```

合并时注意本仓库版本是 **LF 行尾**，上游 tarball 是 CRLF；两处本地补丁（上方）需要重放。上游改动合入后：`npm run typecheck`。

## 配置

沿用上游路径 `~/.pi/agent/open-tui.json`，面板命令 `/open-tui`。字段参考同目录 `config.ts`（或仓库 `docs/open-tui.md`）。