import type { Monaco } from "@monaco-editor/react";
import { wireTmGrammars } from "monaco-editor-textmate";
import { Registry } from "monaco-textmate";
import { loadWASM } from "onigasm";
import { JsxEmit } from "typescript";

export async function initializeMonaco(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: JsxEmit.React,
  });
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  try {
    await loadWASM("/onigasm.wasm");
  } catch {
    // try/catch prevents onigasm from erroring on fast refreshes
  }

  const registry = new Registry({
    // @ts-ignore
    getGrammarDefinition: async (scopeName) => {
      switch (scopeName) {
        case "source.js":
          return {
            format: "json",
            content: await (await fetch("/javascript.tmLanguage.json")).text(),
          };
        case "source.jsx":
          return {
            format: "json",
            content: await (await fetch("/jsx.tmLanguage.json")).text(),
          };
        case "source.ts":
          return {
            format: "json",
            content: await (await fetch("/typescript.tmLanguage.json")).text(),
          };
        case "source.tsx":
          return {
            format: "json",
            content: await (await fetch("/tsx.tmLanguage.json")).text(),
          };
        default:
          return null;
      }
    },
  });

  const grammars = new Map();

  grammars.set("javascript", "source.jsx");
  grammars.set("typescript", "source.tsx");

  /* Wire up TextMate grammars */
  await wireTmGrammars(monaco, registry, grammars);
}
