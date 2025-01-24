import { cn } from "@/utils/css";
import React from "react";
// import houston from "shiki/themes/poimandres.mjs";
// import houston from "shiki/themes/vesper.mjs";
// import houston from "shiki/themes/catppuccin-mocha.mjs"; // 60deg
// import houston from "shiki/themes/github-dark-default.mjs"; // 270deg
// import houston from "shiki/themes/nord.mjs"; // hue-rotate(90deg) saturate(1.5)
import { FROSTIN_DARK, getHighlighter } from "@/utils/shiki";
import { CodeBlock } from "./code-block";

// import Color from "color";

// const FROSTIN_DARK = JSON.parse(JSON.stringify(houston));
// FROSTIN_DARK.name = "frostin-dark";
// FROSTIN_DARK.bg = "#0c0c0c";
// FROSTIN_DARK.colors["editor.background"] = "#0c0c0c";
// FROSTIN_DARK.tokenColors[0].settings.background = "#000000";

// function hueRotateColor(hex, degrees) {
//   try {
//     return Color(hex).rotate(105).saturate(0.4).lighten(0.05).hex();
//   } catch (e) {
//     // If the input is not a valid color, just return it unchanged
//     return hex;
//   }
// }

// function deepHueRotate(obj, degrees) {
//   Object.keys(obj).forEach((key) => {
//     if (typeof obj[key] === "object" && obj[key] !== null) {
//       // Recursively apply deepHueRotate if the property is an object
//       deepHueRotate(obj[key], degrees);
//     } else if (
//       typeof obj[key] === "string" &&
//       /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(obj[key])
//     ) {
//       // Check if the property is a string that looks like a hex color
//       obj[key] = hueRotateColor(obj[key], degrees);
//     }
//   });
// }

// deepHueRotate(FROSTIN_DARK, 90);

// console.log(JSON.stringify(FROSTIN_DARK));

// const MY_DARK_THEME = {
//   ...poimandres,
//   name: "frostin-dark",
//   colors: {
//     ...poimandres.colors,
//     "editor.background": "#ff0000",
//   },
// };

const codeToHtml = async ({ code, language }: any) => {
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, {
    lang: language,
    themes: { dark: "frostin-dark", light: "frostin-dark" },
  });
};

// import CopyButton from "@/core/components/copy-button";

interface ServerCodeBlockProps {
  value: string;
  language: string;
  className?: string;
}

export default async function ServerCodeBlock({
  value,
  language = "tsx",
  className,
}: ServerCodeBlockProps) {
  const html = await codeToHtml({
    code: value,
    language,
  });

  return (
    <CodeBlock
      value={value}
      language={language}
      className={className}
      defaultHtml={html}
    />
  );
}
