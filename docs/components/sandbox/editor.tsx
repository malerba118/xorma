"use client";
import React, { memo, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { FROSTIN_DARK, getHighlighter } from "@/utils/shiki";
import { cn } from "@/utils/css";
import AutoImport, { regexTokeniser } from "./auto-import";
import { initializeMonaco } from "./setup";
// import darkTheme from "shiki/themes/dracula.mjs";

// const DARK_THEME = JSON.parse(JSON.stringify(darkTheme));
// DARK_THEME.tokenColors[0].settings.background = "#000000";
// DARK_THEME.colors["editor.background"] = "#000000";
// DARK_THEME.bg = "#000000";

interface SandboxEditorProps {
  value?: string;
  onChange?: (val: string | undefined) => void;
}

export const SandboxEditor = memo(({ value, onChange }: SandboxEditorProps) => {
  const [ready, setReady] = useState(false);
  return (
    <Editor
      loading={null}
      height="100%"
      width="100%"
      defaultLanguage="javascript"
      // path="file.jsx"
      value={value}
      onChange={onChange}
      onMount={async (editor, monaco) => {
        await initializeMonaco(monaco);
        editor.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
          function () {
            editor.getAction("editor.action.formatDocument")?.run();
          }
        );
        // const completor = new AutoImport({
        //   monaco: monaco,
        //   editor: editor,
        //   spacesBetweenBraces: true,
        //   doubleQuotes: true,
        //   semiColon: true,
        //   alwaysApply: true,
        // });

        getHighlighter()
          .then((highlighter) => {
            shikiToMonaco(highlighter, monaco, {
              tokenizeMaxLineLength: 100000,
              tokenizeTimeLimit: 2000,
            });
            setReady(true);
          })
          .catch(console.error);
      }}
      options={{
        minimap: { enabled: false },
        scrollbar: {
          horizontal: "hidden",
          vertical: "hidden",
          alwaysConsumeMouseWheel: false,
          handleMouseWheel: true,
        },
        glyphMargin: false,
        lineNumbersMinChars: 4,
        padding: { top: 16, bottom: 16 },
        folding: false,
        guides: {
          highlightActiveIndentation: false,
          indentation: false,
        },
        fontFamily: "var(--font-geist-mono)",
        fontSize: 14,
        scrollBeyondLastLine: false,
        inlineSuggest: { enabled: false },
        quickSuggestions: false,
        hover: {
          enabled: false,
          above: false,
        },
        overviewRulerBorder: false,
        renderLineHighlight: "none",
        occurrencesHighlight: "off",
        hideCursorInOverviewRuler: true,
        overviewRulerLanes: 0,
        lineDecorationsWidth: 20,
      }}
      className={cn(
        "transition-opacity bg-editor",
        ready ? "opacity-100" : "opacity-0"
      )}
    />
  );
});
