import extension from '../index.ts';
import { writeFile } from 'node:fs/promises';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

// Loaded explicitly by smoke.mjs, never installed as a global extension.
export default function smoke(pi: ExtensionAPI) {
  let tool: any;
  extension(new Proxy(pi, { get(target, property) { return property === 'registerTool' ? (definition: any) => { tool = definition; target.registerTool(definition); } : Reflect.get(target, property); } }));
  pi.on('session_start', async (_event, ctx) => {
    const names = pi.getAllTools().map(t => t.name);
    const result = await tool.execute('smoke', { scope: 'all' }, undefined, undefined, ctx);
    await writeFile(process.env.SESSION_SEARCH_SMOKE_REPORT!, JSON.stringify({ registered: names.includes('session_search'), mode: result.details.mode, error: result.details.error }));
    ctx.shutdown();
  });
}
