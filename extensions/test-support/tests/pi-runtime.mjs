import assert from 'node:assert/strict';
import { resolvePiCli } from '../pi-runtime.mjs';

const local = await resolvePiCli({});
assert.equal(local.command, process.execPath);
assert.match(local.args[0], /pi-coding-agent[\\/]dist[\\/]bundle[\\/]cli\.js$/);

const overridden = await resolvePiCli({ PI_CODING_AGENT_BIN: process.execPath });
assert.equal(overridden.command, process.execPath);
assert.deepEqual(overridden.args, []);
console.log('Pi runtime resolver uses the local package and honors overrides.');
