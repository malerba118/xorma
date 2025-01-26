import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);
const rawData = fs.readFileSync("./package.json");
const packageJson = JSON.parse(rawData);

const bundle = (config) => ({
  ...config,
  input: "index.ts",
  external: (id) => !/^[./]/.test(id),
});

// Function to run npm pack and install in docs and tests
const reinstall = async () => {
  try {
    // Run npm pack
    const { stdout } = await execAsync("npm pack");
    const tgzFile = stdout.trim(); // Get the generated tgz filename
    console.log(`Generated package: ${tgzFile}`);

    // Install the package in both docs and tests folders
    const docsDir = path.join(process.cwd(), "../docs");
    const testsDir = path.join(process.cwd(), "../tests");

    // Install in docs
    const docsInstallCommand = `npm install "${tgzFile}" --prefix ${docsDir}`;
    const { stdout: docsOutput, stderr: docsError } = await execAsync(
      docsInstallCommand
    );
    console.log(`Package installed in docs: ${docsOutput}`);
    if (docsError) console.error(`Install stderr for docs: ${docsError}`);

    // Install in tests
    const testsInstallCommand = `npm install "${tgzFile}" --prefix ${testsDir}`;
    const { stdout: testsOutput, stderr: testsError } = await execAsync(
      testsInstallCommand
    );
    console.log(`Package installed in tests: ${testsOutput}`);
    if (testsError) console.error(`Install stderr for tests: ${testsError}`);
  } catch (error) {
    console.error(`Error in pack and install: ${error}`);
  }
};

export default [
  bundle({
    plugins: [
      esbuild(),
      {
        name: "pack-after-build",
        async closeBundle() {
          await reinstall();
        },
      },
    ],
    output: [
      {
        file: `dist/index.js`,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: `dist/index.mjs`,
        format: "es",
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `dist/index.d.ts`,
      format: "es",
    },
  }),
];
