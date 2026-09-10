import { mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { resolvePiCli } from '../../test-support/pi-runtime.mjs';
const temp = await mkdtemp(join(tmpdir(), 'pi-session-search-smoke-'));
const report = join(temp, 'report.json');
const cli = await resolvePiCli();
const extensionPath = fileURLToPath(new URL('./smoke.ts', import.meta.url));
const child = spawn(cli.command, [...cli.args, '--offline', '--mode', 'rpc', '--no-session', '--no-extensions', '--no-skills', '--no-prompt-templates', '--no-themes', '--no-context-files', '-e', extensionPath], { cwd: temp, env: { ...process.env, PI_CODING_AGENT_DIR: temp, PI_TELEMETRY: '0', SESSION_SEARCH_SMOKE_REPORT: report }, stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', b => { stderr += b; });
child.stdout.resume();
child.stdin.write(JSON.stringify({ type: 'get_state', id: 'smoke-state' }) + '\n');
const timeout = setTimeout(() => child.kill('SIGTERM'), 15000);
try {
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  assert.equal(code, 0, stderr);
  const result = JSON.parse(await readFile(report, 'utf8'));
  assert.deepEqual(result, { registered: true, mode: 'browse' });
  console.log('Actual Pi 0.85 bundled CLI: extension loaded, tool registered and executed successfully (offline, ephemeral profile).');
} finally { clearTimeout(timeout); child.stdin.destroy(); }
