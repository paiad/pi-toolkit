import assert from "node:assert/strict";
import { resolve } from "node:path";
import { loadPiRuntime } from "../../test-support/pi-runtime.mjs";

const sourceUrl = new URL("../index.ts", import.meta.url).href;
const runtime = await loadPiRuntime(sourceUrl);
const memory = runtime.jiti(sourceUrl);

const toolNames = [];
memory.default({
  on() {},
  registerTool(tool) {
    toolNames.push(tool.name);
  },
});
assert.deepEqual(toolNames, [
  "memory_write",
  "scratchpad",
  "memory_read",
  "memory_forget",
  "memory_restore",
  "memory_search",
  "memory_status",
]);

const projectDir = resolve("C:/work/example-project");
assert.equal(memory.resolveMemoryDir({}, projectDir), resolve(projectDir, ".pi", "memory"));
assert.equal(memory.resolveMemoryDir({ PI_MEMORY_DIR: "D:/custom-memory" }, projectDir), "D:/custom-memory");

const one = memory.getQmdCollectionName(resolve("C:/work/project-one/.pi/memory"));
const sameOne = memory.getQmdCollectionName(resolve("C:/work/project-one/.pi/memory"));
const two = memory.getQmdCollectionName(resolve("C:/work/project-two/.pi/memory"));
assert.match(one, /^pi-mem-[a-f0-9]{12}$/);
assert.equal(one, sameOne);
assert.notEqual(one, two);

console.log("pi-mem tools and qmd collection scope are isolated by project path.");
