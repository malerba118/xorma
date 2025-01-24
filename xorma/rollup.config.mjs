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

// Function to run npm pack and install in docs
const reinstall = async () => {
  try {
    // Run npm pack
    const { stdout } = await execAsync("npm pack");
    const tgzFile = stdout.trim(); // Get the generated tgz filename
    console.log(`Generated package: ${tgzFile}`);

    // Install the package in the docs folder
    const docsDir = path.join(process.cwd(), "../docs");
    const installCommand = `npm install "${tgzFile}" --prefix ${docsDir}`;

    const { stdout: installOutput, stderr: installError } = await execAsync(
      installCommand
    );
    console.log(`Package installed in docs: ${installOutput}`);
    if (installError) console.error(`Install stderr: ${installError}`);
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
