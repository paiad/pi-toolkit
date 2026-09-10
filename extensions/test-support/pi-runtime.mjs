import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const projectRequire = createRequire(import.meta.url);
const packageEntryPath = fileURLToPath(import.meta.resolve('@earendil-works/pi-coding-agent'));
const packageDir = resolve(dirname(packageEntryPath), '..');
const packageJsonPath = resolve(packageDir, 'package.json');
const packageRequire = createRequire(packageJsonPath);

export async function loadPiRuntime(sourceUrl) {
  const manifest = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const { createJiti } = packageRequire('jiti');
  const config = await import(pathToFileURL(`${packageDir}/dist/config.js`).href);
  const sessionManager = await import(pathToFileURL(`${packageDir}/dist/core/session-manager.js`).href);
  const typebox = await import(pathToFileURL(packageRequire.resolve('typebox')).href);
  return {
    packageDir,
    manifest,
    config,
    buildContextEntries: sessionManager.buildContextEntries,
    jiti: createJiti(sourceUrl, {
      tryNative: false,
      virtualModules: { typebox, '@earendil-works/pi-coding-agent': config },
    }),
  };
}

export async function resolvePiCli(env = process.env, cwd = process.cwd()) {
  const override = env.PI_CODING_AGENT_BIN?.trim();
  if (override) {
    const command = isAbsolute(override) ? override : resolve(cwd, override);
    await access(command, constants.X_OK).catch(async () => access(command, constants.F_OK));
    return { command, args: [] };
  }
  const manifest = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const bin = typeof manifest.bin === 'object' ? manifest.bin.pi : undefined;
  if (typeof bin !== 'string') throw new Error('The local Pi package does not declare a pi CLI binary.');
  return { command: process.execPath, args: [resolve(packageDir, bin)] };
}
