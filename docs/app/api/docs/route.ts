import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const filePaths = [
    path.join(process.cwd(), "/app/docs/overview.mdx"),
    path.join(process.cwd(), "/app/docs/getting-started.mdx"),
    path.join(process.cwd(), "/app/docs/reactivity.mdx"),
    path.join(process.cwd(), "/app/docs/store.mdx"),
    path.join(process.cwd(), "/app/docs/relationships.mdx"),
    path.join(process.cwd(), "/app/docs/inheritance.mdx"),
    path.join(process.cwd(), "/app/docs/persistence.mdx"),
    path.join(process.cwd(), "/app/docs/api-reference.mdx"),
    path.join(process.cwd(), "/app/docs/examples.mdx"),
  ];
  return new Response(
    filePaths
      .map((filePath) => fs.readFileSync(filePath, "utf-8"))
      .join("\n\n\n")
  );
}
