import Bun from "bun";
import { existsSync, renameSync } from "node:fs";
import { resolve } from "node:path";

console.log("Starting build...");
const start = Date.now();

const buildConfig: Bun.BuildConfig = {
  entrypoints: ["src/index.ts", "src/neverthrow/index.ts", "src/colors/index.ts", "src/cache/index.ts"],
  outdir: "dist",
  target: "node",
  sourcemap: "inline",
  minify: false,
  packages: "external",
  root: "./src",
};

const esmBuild = await Bun.build({
  ...buildConfig,
  format: "esm",
});
outputLogs(esmBuild);

if (esmBuild.success) {
  for (const output of esmBuild.outputs.filter((o) => o.kind === "entry-point")) {
    const path = resolve(output.path);
    if (!existsSync(path) || !/\.js$/.test(path)) {
      continue;
    }

    renameSync(path, path.replace(/\.js$/, ".mjs"));
  }
}

const cjsBuild = await Bun.build({
  ...buildConfig,
  format: "cjs",
});

outputLogs(cjsBuild);

if (cjsBuild.success) {
  for (const output of cjsBuild.outputs.filter((o) => o.kind === "entry-point")) {
    const path = resolve(output.path);
    if (!existsSync(path) || !/\.js$/.test(path)) {
      continue;
    }

    renameSync(path, path.replace(/\.js$/, ".cjs"));
  }
}

function outputLogs(result: Bun.BuildOutput) {
  if (result.logs.length > 0) {
    console.warn("Build succeeded with warnings:");
    for (const message of result.logs) {
      // Bun will pretty print the message object
      console.warn(message);
    }
  }
}

console.log(`Build finished in ${Date.now() - start}ms`);
