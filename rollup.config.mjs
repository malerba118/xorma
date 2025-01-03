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

// Function to run npm pack and install in example
const reinstall = async () => {
  try {
    // Run npm pack
    const { stdout } = await execAsync("npm pack");
    const tgzFile = stdout.trim(); // Get the generated tgz filename
    console.log(`Generated package: ${tgzFile}`);

    // Install the package in the example folder
    const exampleDir = path.join(process.cwd(), "example");
    const installCommand = `npm install "${tgzFile}" --prefix example`;

    const { stdout: installOutput, stderr: installError } = await execAsync(
      installCommand
    );
    console.log(`Package installed in example: ${installOutput}`);
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
