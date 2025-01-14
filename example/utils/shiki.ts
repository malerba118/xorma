// THIS FROSTIN_DARK PALETTE NEEDS TWEAKING, BUT THE BELOW CODE IS HOW IT WAS DERIVED

import { bundledLanguages, createHighlighter } from "shiki";

// import nord from "shiki/themes/nord.mjs"; // hue-rotate(90deg) saturate(1.5)

// import Color from "color";

// const FROSTIN_DARK = JSON.parse(JSON.stringify(nord));
// FROSTIN_DARK.name = "frostin-dark";
// FROSTIN_DARK.bg = "var(--editor-bg)";
// FROSTIN_DARK.colors["editor.background"] = "var(--editor-bg)";

// function hueRotateColor(hex, degrees) {
//   try {
//     return Color(hex).lighten(0.2).rotate(100).saturate(1.5).hex();
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

export const FROSTIN_DARK = {
  colors: {
    "activityBar.activeBackground": "#BD93F910",
    "activityBar.activeBorder": "#ffaddc80",
    "activityBar.background": "#343746",
    "activityBar.foreground": "#F8F8F2",
    "activityBar.inactiveForeground": "#FFFFFF55",
    "activityBarBadge.background": "#ffaddc",
    "activityBarBadge.foreground": "#F8F8F2",
    "badge.background": "#44475A",
    "badge.foreground": "#F8F8F2",
    "breadcrumb.activeSelectionForeground": "#F8F8F2",
    "breadcrumb.background": "var(--editor-bg)",
    "breadcrumb.focusForeground": "#F8F8F2",
    "breadcrumb.foreground": "#FFFFFF55",
    "breadcrumbPicker.background": "#191A21",
    "button.background": "#44475A",
    "button.foreground": "#F8F8F2",
    "button.secondaryBackground": "var(--editor-bg)",
    "button.secondaryForeground": "#F8F8F2",
    "button.secondaryHoverBackground": "#343746",
    "debugToolBar.background": "#21222C",
    "diffEditor.insertedTextBackground": "#dbcbd920",
    "diffEditor.removedTextBackground": "#FF555550",
    "dropdown.background": "#343746",
    "dropdown.border": "#191A21",
    "dropdown.foreground": "#F8F8F2",
    "editor.background": "var(--editor-bg)",
    "editor.findMatchBackground": "#FFB86C80",
    "editor.findMatchHighlightBackground": "#FFFFFF40",
    "editor.findRangeHighlightBackground": "#44475A75",
    "editor.foldBackground": "#21222C80",
    "editor.foreground": "#F8F8F2",
    "editor.hoverHighlightBackground": "#9db9fb50",
    "editor.lineHighlightBorder": "#44475A",
    "editor.rangeHighlightBackground": "#BD93F915",
    "editor.selectionBackground": "#44475A",
    "editor.selectionHighlightBackground": "#424450",
    "editor.snippetFinalTabstopHighlightBackground": "var(--editor-bg)",
    "editor.snippetFinalTabstopHighlightBorder": "#dbcbd9",
    "editor.snippetTabstopHighlightBackground": "var(--editor-bg)",
    "editor.snippetTabstopHighlightBorder": "#FFFFFF55",
    "editor.wordHighlightBackground": "#9db9fb50",
    "editor.wordHighlightStrongBackground": "#dbcbd950",
    "editorBracketHighlight.foreground1": "#F8F8F2",
    "editorBracketHighlight.foreground2": "#ffaddc",
    "editorBracketHighlight.foreground3": "#9db9fb",
    "editorBracketHighlight.foreground4": "#dbcbd9",
    "editorBracketHighlight.foreground5": "#BD93F9",
    "editorBracketHighlight.foreground6": "#FFB86C",
    "editorBracketHighlight.unexpectedBracket.foreground": "#FF5555",
    "editorCodeLens.foreground": "#FFFFFF55",
    "editorError.foreground": "#FF5555",
    "editorGroup.border": "#BD93F9",
    "editorGroup.dropBackground": "#44475A70",
    "editorGroupHeader.tabsBackground": "#191A21",
    "editorGutter.addedBackground": "#dbcbd980",
    "editorGutter.deletedBackground": "#FF555580",
    "editorGutter.modifiedBackground": "#9db9fb80",
    "editorHoverWidget.background": "var(--editor-bg)",
    "editorHoverWidget.border": "#FFFFFF55",
    "editorIndentGuide.activeBackground": "#FFFFFF45",
    "editorIndentGuide.background": "#FFFFFF1A",
    "editorLineNumber.foreground": "#FFFFFF55",
    "editorLink.activeForeground": "#9db9fb",
    "editorMarkerNavigation.background": "#21222C",
    "editorOverviewRuler.addedForeground": "#dbcbd980",
    "editorOverviewRuler.border": "#191A21",
    "editorOverviewRuler.currentContentForeground": "#dbcbd9",
    "editorOverviewRuler.deletedForeground": "#FF555580",
    "editorOverviewRuler.errorForeground": "#FF555580",
    "editorOverviewRuler.incomingContentForeground": "#BD93F9",
    "editorOverviewRuler.infoForeground": "#9db9fb80",
    "editorOverviewRuler.modifiedForeground": "#9db9fb80",
    "editorOverviewRuler.selectionHighlightForeground": "#FFB86C",
    "editorOverviewRuler.warningForeground": "#FFB86C80",
    "editorOverviewRuler.wordHighlightForeground": "#9db9fb",
    "editorOverviewRuler.wordHighlightStrongForeground": "#dbcbd9",
    "editorRuler.foreground": "#FFFFFF1A",
    "editorSuggestWidget.background": "#21222C",
    "editorSuggestWidget.foreground": "#F8F8F2",
    "editorSuggestWidget.selectedBackground": "#44475A",
    "editorWarning.foreground": "#9db9fb",
    "editorWhitespace.foreground": "#FFFFFF1A",
    "editorWidget.background": "#21222C",
    errorForeground: "#FF5555",
    "extensionButton.prominentBackground": "#dbcbd990",
    "extensionButton.prominentForeground": "#F8F8F2",
    "extensionButton.prominentHoverBackground": "#dbcbd960",
    focusBorder: "#FFFFFF55",
    foreground: "#F8F8F2",
    "gitDecoration.conflictingResourceForeground": "#FFB86C",
    "gitDecoration.deletedResourceForeground": "#FF5555",
    "gitDecoration.ignoredResourceForeground": "#FFFFFF55",
    "gitDecoration.modifiedResourceForeground": "#9db9fb",
    "gitDecoration.untrackedResourceForeground": "#dbcbd9",
    "inlineChat.regionHighlight": "#343746",
    "input.background": "var(--editor-bg)",
    "input.border": "#191A21",
    "input.foreground": "#F8F8F2",
    "input.placeholderForeground": "#FFFFFF55",
    "inputOption.activeBorder": "#BD93F9",
    "inputValidation.errorBorder": "#FF5555",
    "inputValidation.infoBorder": "#ffaddc",
    "inputValidation.warningBorder": "#FFB86C",
    "list.activeSelectionBackground": "#44475A",
    "list.activeSelectionForeground": "#F8F8F2",
    "list.dropBackground": "#44475A",
    "list.errorForeground": "#FF5555",
    "list.focusBackground": "#44475A75",
    "list.highlightForeground": "#9db9fb",
    "list.hoverBackground": "#44475A75",
    "list.inactiveSelectionBackground": "#44475A75",
    "list.warningForeground": "#FFB86C",
    "listFilterWidget.background": "#343746",
    "listFilterWidget.noMatchesOutline": "#FF5555",
    "listFilterWidget.outline": "#424450",
    "merge.currentHeaderBackground": "#dbcbd990",
    "merge.incomingHeaderBackground": "#BD93F990",
    "panel.background": "var(--editor-bg)",
    "panel.border": "#BD93F9",
    "panelTitle.activeBorder": "#ffaddc",
    "panelTitle.activeForeground": "#F8F8F2",
    "panelTitle.inactiveForeground": "#FFFFFF55",
    "peekView.border": "#44475A",
    "peekViewEditor.background": "var(--editor-bg)",
    "peekViewEditor.matchHighlightBackground": "#b89ae480",
    "peekViewResult.background": "#21222C",
    "peekViewResult.fileForeground": "#F8F8F2",
    "peekViewResult.lineForeground": "#F8F8F2",
    "peekViewResult.matchHighlightBackground": "#b89ae480",
    "peekViewResult.selectionBackground": "#44475A",
    "peekViewResult.selectionForeground": "#F8F8F2",
    "peekViewTitle.background": "#191A21",
    "peekViewTitleDescription.foreground": "#FFFFFF55",
    "peekViewTitleLabel.foreground": "#F8F8F2",
    "pickerGroup.border": "#BD93F9",
    "pickerGroup.foreground": "#9db9fb",
    "progressBar.background": "#ffaddc",
    "selection.background": "#BD93F9",
    "settings.checkboxBackground": "#21222C",
    "settings.checkboxBorder": "#191A21",
    "settings.checkboxForeground": "#F8F8F2",
    "settings.dropdownBackground": "#21222C",
    "settings.dropdownBorder": "#191A21",
    "settings.dropdownForeground": "#F8F8F2",
    "settings.headerForeground": "#F8F8F2",
    "settings.modifiedItemIndicator": "#FFB86C",
    "settings.numberInputBackground": "#21222C",
    "settings.numberInputBorder": "#191A21",
    "settings.numberInputForeground": "#F8F8F2",
    "settings.textInputBackground": "#21222C",
    "settings.textInputBorder": "#191A21",
    "settings.textInputForeground": "#F8F8F2",
    "sideBar.background": "#21222C",
    "sideBarSectionHeader.background": "var(--editor-bg)",
    "sideBarSectionHeader.border": "#191A21",
    "sideBarTitle.foreground": "#F8F8F2",
    "statusBar.background": "#191A21",
    "statusBar.debuggingBackground": "#FF5555",
    "statusBar.debuggingForeground": "#191A21",
    "statusBar.foreground": "#F8F8F2",
    "statusBar.noFolderBackground": "#191A21",
    "statusBar.noFolderForeground": "#F8F8F2",
    "statusBarItem.prominentBackground": "#FF5555",
    "statusBarItem.prominentHoverBackground": "#FFB86C",
    "statusBarItem.remoteBackground": "#BD93F9",
    "statusBarItem.remoteForeground": "var(--editor-bg)",
    "tab.activeBackground": "var(--editor-bg)",
    "tab.activeBorderTop": "#ffaddc80",
    "tab.activeForeground": "#F8F8F2",
    "tab.border": "#191A21",
    "tab.inactiveBackground": "#21222C",
    "tab.inactiveForeground": "#FFFFFF55",
    "terminal.ansiBlack": "#21222C",
    "terminal.ansiBlue": "#BD93F9",
    "terminal.ansiBrightBlack": "#FFFFFF55",
    "terminal.ansiBrightBlue": "#D6ACFF",
    "terminal.ansiBrightCyan": "#A4FFFF",
    "terminal.ansiBrightGreen": "#69FF94",
    "terminal.ansiBrightMagenta": "#FF92DF",
    "terminal.ansiBrightRed": "#FF6E6E",
    "terminal.ansiBrightWhite": "#FFFFFF",
    "terminal.ansiBrightYellow": "#FFFFA5",
    "terminal.ansiCyan": "#9db9fb",
    "terminal.ansiGreen": "#dbcbd9",
    "terminal.ansiMagenta": "#ffaddc",
    "terminal.ansiRed": "#FF5555",
    "terminal.ansiWhite": "#F8F8F2",
    "terminal.ansiYellow": "#b89ae4",
    "terminal.background": "var(--editor-bg)",
    "terminal.foreground": "#F8F8F2",
    "titleBar.activeBackground": "#21222C",
    "titleBar.activeForeground": "#F8F8F2",
    "titleBar.inactiveBackground": "#191A21",
    "titleBar.inactiveForeground": "#FFFFFF55",
    "walkThrough.embeddedEditorBackground": "#21222C",
  },
  displayName: "Frostin Dark", // dracula
  name: "frostin-dark",
  semanticHighlighting: true,
  tokenColors: [
    {
      scope: ["emphasis"],
      settings: {
        fontStyle: "italic",
      },
    },
    {
      scope: ["strong"],
      settings: {
        fontStyle: "bold",
      },
    },
    {
      scope: ["header"],
      settings: {
        foreground: "#BD93F9",
      },
    },
    {
      scope: ["meta.diff", "meta.diff.header"],
      settings: {
        foreground: "#FFFFFF55",
      },
    },
    {
      scope: ["markup.inserted"],
      settings: {
        foreground: "#dbcbd9",
      },
    },
    {
      scope: ["markup.deleted"],
      settings: {
        foreground: "#FF5555",
      },
    },
    {
      scope: ["markup.changed"],
      settings: {
        foreground: "#FFB86C",
      },
    },
    {
      scope: ["invalid"],
      settings: {
        fontStyle: "underline italic",
        foreground: "#FF5555",
      },
    },
    {
      scope: ["invalid.deprecated"],
      settings: {
        fontStyle: "underline italic",
        foreground: "#F8F8F2",
      },
    },
    {
      scope: ["entity.name.filename"],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: ["markup.error"],
      settings: {
        foreground: "#FF5555",
      },
    },
    {
      scope: ["markup.underline"],
      settings: {
        fontStyle: "underline",
      },
    },
    {
      scope: ["markup.bold"],
      settings: {
        fontStyle: "bold",
        foreground: "#FFB86C",
      },
    },
    {
      scope: ["markup.heading"],
      settings: {
        fontStyle: "bold",
        foreground: "#BD93F9",
      },
    },
    {
      scope: ["markup.italic"],
      settings: {
        fontStyle: "italic",
        foreground: "#b89ae4",
      },
    },
    {
      scope: [
        "beginning.punctuation.definition.list.markdown",
        "beginning.punctuation.definition.quote.markdown",
        "punctuation.definition.link.restructuredtext",
      ],
      settings: {
        foreground: "#9db9fb",
      },
    },
    {
      scope: ["markup.inline.raw", "markup.raw.restructuredtext"],
      settings: {
        foreground: "#dbcbd9",
      },
    },
    {
      scope: ["markup.underline.link", "markup.underline.link.image"],
      settings: {
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "meta.link.reference.def.restructuredtext",
        "punctuation.definition.directive.restructuredtext",
        "string.other.link.description",
        "string.other.link.title",
      ],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["entity.name.directive.restructuredtext", "markup.quote"],
      settings: {
        // fontStyle: "italic",
        foreground: "#b89ae4",
      },
    },
    {
      scope: ["meta.separator.markdown"],
      settings: {
        foreground: "#FFFFFF55",
      },
    },
    {
      scope: [
        "fenced_code.block.language",
        "markup.raw.inner.restructuredtext",
        "markup.fenced_code.block.markdown punctuation.definition.markdown",
      ],
      settings: {
        foreground: "#dbcbd9",
      },
    },
    {
      scope: ["punctuation.definition.constant.restructuredtext"],
      settings: {
        foreground: "#BD93F9",
      },
    },
    {
      scope: [
        "markup.heading.markdown punctuation.definition.string.begin",
        "markup.heading.markdown punctuation.definition.string.end",
      ],
      settings: {
        foreground: "#BD93F9",
      },
    },
    {
      scope: [
        "meta.paragraph.markdown punctuation.definition.string.begin",
        "meta.paragraph.markdown punctuation.definition.string.end",
      ],
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      scope: [
        "markup.quote.markdown meta.paragraph.markdown punctuation.definition.string.begin",
        "markup.quote.markdown meta.paragraph.markdown punctuation.definition.string.end",
      ],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: ["entity.name.type.class", "entity.name.class"],
      settings: {
        fontStyle: "normal",
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "keyword.expressions-and-types.swift",
        "keyword.other.this",
        "variable.language",
        "variable.language punctuation.definition.variable.php",
        "variable.other.readwrite.instance.ruby",
        "variable.parameter.function.language.special",
      ],
      settings: {
        // fontStyle: "italic",
        foreground: "#BD93F9",
      },
    },
    {
      scope: ["entity.other.inherited-class"],
      settings: {
        // fontStyle: "italic",
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "comment",
        "punctuation.definition.comment",
        "unused.comment",
        "wildcard.comment",
      ],
      settings: {
        foreground: "#FFFFFF55",
      },
    },
    {
      scope: [
        "comment keyword.codetag.notation",
        "comment.block.documentation keyword",
        "comment.block.documentation storage.type.class",
      ],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["comment.block.documentation entity.name.type"],
      settings: {
        // fontStyle: "italic",
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "comment.block.documentation entity.name.type punctuation.definition.bracket",
      ],
      settings: {
        foreground: "#9db9fb",
      },
    },
    {
      scope: ["comment.block.documentation variable"],
      settings: {
        // fontStyle: "italic",
        foreground: "#FFB86C",
      },
    },
    {
      scope: ["constant", "variable.other.constant"],
      settings: {
        foreground: "#BD93F9",
      },
    },
    {
      scope: [
        "constant.character.escape",
        "constant.character.string.escape",
        "constant.regexp",
      ],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["entity.other.attribute-name.parent-selector"],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        // fontStyle: "italic",
        foreground: "#dbcbd9",
      },
    },
    {
      scope: [
        "entity.name.function",
        "meta.function-call.object",
        "meta.function-call.php",
        "meta.function-call.static",
        "meta.method-call.java meta.method",
        "meta.method.groovy",
        "support.function.any-method.lua",
        "keyword.operator.function.infix",
      ],
      settings: {
        foreground: "#dbcbd9",
      },
    },
    {
      scope: [
        "entity.name.variable.parameter",
        "meta.at-rule.function variable",
        "meta.at-rule.mixin variable",
        "meta.function.arguments variable.other.php",
        "meta.selectionset.graphql meta.arguments.graphql variable.arguments.graphql",
        "variable.parameter",
      ],
      settings: {
        // fontStyle: "italic",
        foreground: "#FFB86C",
      },
    },
    {
      scope: [
        "meta.decorator variable.other.readwrite",
        "meta.decorator variable.other.property",
      ],
      settings: {
        // fontStyle: "italic",
        foreground: "#dbcbd9",
      },
    },
    {
      scope: ["meta.decorator variable.other.object"],
      settings: {
        foreground: "#dbcbd9",
      },
    },
    {
      scope: ["keyword", "punctuation.definition.keyword"],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["keyword.control.new", "keyword.operator.new"],
      settings: {
        fontStyle: "bold",
      },
    },
    {
      scope: ["meta.selector"],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: ["support"],
      settings: {
        // fontStyle: "italic",
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "support.function.magic",
        "support.variable",
        "variable.other.predefined",
      ],
      settings: {
        fontStyle: "regular",
        foreground: "#BD93F9",
      },
    },
    {
      scope: ["support.function", "support.type.property-name"],
      settings: {
        fontStyle: "regular",
      },
    },
    {
      scope: [
        "constant.other.symbol.hashkey punctuation.definition.constant.ruby",
        "entity.other.attribute-name.placeholder punctuation",
        "entity.other.attribute-name.pseudo-class punctuation",
        "entity.other.attribute-name.pseudo-element punctuation",
        "meta.group.double.toml",
        "meta.group.toml",
        "meta.object-binding-pattern-variable punctuation.destructuring",
        "punctuation.colon.graphql",
        "punctuation.definition.block.scalar.folded.yaml",
        "punctuation.definition.block.scalar.literal.yaml",
        "punctuation.definition.block.sequence.item.yaml",
        "punctuation.definition.entity.other.inherited-class",
        "punctuation.function.swift",
        "punctuation.separator.dictionary.key-value",
        "punctuation.separator.hash",
        "punctuation.separator.inheritance",
        "punctuation.separator.key-value",
        "punctuation.separator.key-value.mapping.yaml",
        "punctuation.separator.namespace",
        "punctuation.separator.pointer-access",
        "punctuation.separator.slice",
        "string.unquoted.heredoc punctuation.definition.string",
        "support.other.chomping-indicator.yaml",
        "punctuation.separator.annotation",
      ],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: [
        "keyword.operator.other.powershell",
        "keyword.other.statement-separator.powershell",
        "meta.brace.round",
        "meta.function-call punctuation",
        "punctuation.definition.arguments.begin",
        "punctuation.definition.arguments.end",
        "punctuation.definition.entity.begin",
        "punctuation.definition.entity.end",
        "punctuation.definition.tag.cs",
        "punctuation.definition.type.begin",
        "punctuation.definition.type.end",
        "punctuation.section.scope.begin",
        "punctuation.section.scope.end",
        "punctuation.terminator.expression.php",
        "storage.type.generic.java",
        "string.template meta.brace",
        "string.template punctuation.accessor",
      ],
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      scope: [
        "meta.string-contents.quoted.double punctuation.definition.variable",
        "punctuation.definition.interpolation.begin",
        "punctuation.definition.interpolation.end",
        "punctuation.definition.template-expression.begin",
        "punctuation.definition.template-expression.end",
        "punctuation.section.embedded.begin",
        "punctuation.section.embedded.coffee",
        "punctuation.section.embedded.end",
        "punctuation.section.embedded.end source.php",
        "punctuation.section.embedded.end source.ruby",
        "punctuation.definition.variable.makefile",
      ],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: [
        "entity.name.function.target.makefile",
        "entity.name.section.toml",
        "entity.name.tag.yaml",
        "variable.other.key.toml",
      ],
      settings: {
        foreground: "#9db9fb",
      },
    },
    {
      scope: ["constant.other.date", "constant.other.timestamp"],
      settings: {
        foreground: "#FFB86C",
      },
    },
    {
      scope: ["variable.other.alias.yaml"],
      settings: {
        fontStyle: "italic underline",
        foreground: "#dbcbd9",
      },
    },
    {
      scope: [
        "storage",
        "meta.implementation storage.type.objc",
        "meta.interface-or-protocol storage.type.objc",
        "source.groovy storage.type.def",
      ],
      settings: {
        fontStyle: "regular",
        foreground: "#ffaddc",
      },
    },
    {
      scope: [
        "entity.name.type",
        "keyword.primitive-datatypes.swift",
        "keyword.type.cs",
        "meta.protocol-list.objc",
        "meta.return-type.objc",
        "source.go storage.type",
        "source.groovy storage.type",
        "source.java storage.type",
        "source.powershell entity.other.attribute-name",
        "storage.class.std.rust",
        "storage.type.attribute.swift",
        "storage.type.c",
        "storage.type.core.rust",
        "storage.type.cs",
        "storage.type.groovy",
        "storage.type.objc",
        "storage.type.php",
        "storage.type.haskell",
        "storage.type.ocaml",
      ],
      settings: {
        // fontStyle: "italic",
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "entity.name.type.type-parameter",
        "meta.indexer.mappedtype.declaration entity.name.type",
        "meta.type.parameters entity.name.type",
      ],
      settings: {
        foreground: "#FFB86C",
      },
    },
    {
      scope: ["storage.modifier"],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: [
        "string.regexp",
        "constant.other.character-class.set.regexp",
        "constant.character.escape.backslash.regexp",
      ],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: ["punctuation.definition.group.capture.regexp"],
      settings: {
        foreground: "#ffaddc",
      },
    },
    {
      scope: [
        "string.regexp punctuation.definition.string.begin",
        "string.regexp punctuation.definition.string.end",
      ],
      settings: {
        foreground: "#FF5555",
      },
    },
    {
      scope: ["punctuation.definition.character-class.regexp"],
      settings: {
        foreground: "#9db9fb",
      },
    },
    {
      scope: ["punctuation.definition.group.regexp"],
      settings: {
        foreground: "#FFB86C",
      },
    },
    {
      scope: [
        "punctuation.definition.group.assertion.regexp",
        "keyword.operator.negation.regexp",
      ],
      settings: {
        foreground: "#FF5555",
      },
    },
    {
      scope: ["meta.assertion.look-ahead.regexp"],
      settings: {
        foreground: "#dbcbd9",
      },
    },
    {
      scope: ["string"],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: [
        "punctuation.definition.string.begin",
        "punctuation.definition.string.end",
      ],
      settings: {
        foreground: "#E9F284",
      },
    },
    {
      scope: [
        "punctuation.support.type.property-name.begin",
        "punctuation.support.type.property-name.end",
      ],
      settings: {
        foreground: "#8BE9FE",
      },
    },
    {
      scope: [
        "string.quoted.docstring.multi",
        "string.quoted.docstring.multi.python punctuation.definition.string.begin",
        "string.quoted.docstring.multi.python punctuation.definition.string.end",
        "string.quoted.docstring.multi.python constant.character.escape",
      ],
      settings: {
        foreground: "#FFFFFF55",
      },
    },
    {
      scope: [
        "variable",
        "constant.other.key.perl",
        "support.variable.property",
        "variable.other.constant.js",
        "variable.other.constant.ts",
        "variable.other.constant.tsx",
      ],
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      scope: [
        "meta.import variable.other.readwrite",
        "meta.variable.assignment.destructured.object.coffee variable",
      ],
      settings: {
        // fontStyle: "italic",
        foreground: "#FFB86C",
      },
    },
    {
      scope: [
        "meta.import variable.other.readwrite.alias",
        "meta.export variable.other.readwrite.alias",
        "meta.variable.assignment.destructured.object.coffee variable variable",
      ],
      settings: {
        fontStyle: "normal",
        foreground: "#F8F8F2",
      },
    },
    {
      scope: ["meta.selectionset.graphql variable"],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: ["meta.selectionset.graphql meta.arguments variable"],
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      scope: ["entity.name.fragment.graphql", "variable.fragment.graphql"],
      settings: {
        foreground: "#9db9fb",
      },
    },
    {
      scope: [
        "constant.other.symbol.hashkey.ruby",
        "keyword.operator.dereference.java",
        "keyword.operator.navigation.groovy",
        "meta.scope.for-loop.shell punctuation.definition.string.begin",
        "meta.scope.for-loop.shell punctuation.definition.string.end",
        "meta.scope.for-loop.shell string",
        "storage.modifier.import",
        "punctuation.section.embedded.begin.tsx",
        "punctuation.section.embedded.end.tsx",
        "punctuation.section.embedded.begin.jsx",
        "punctuation.section.embedded.end.jsx",
        "punctuation.separator.list.comma.css",
        "constant.language.empty-list.haskell",
      ],
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      scope: ["source.shell variable.other"],
      settings: {
        foreground: "#BD93F9",
      },
    },
    {
      scope: ["support.constant"],
      settings: {
        fontStyle: "normal",
        foreground: "#BD93F9",
      },
    },
    {
      scope: ["meta.scope.prerequisites.makefile"],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: ["meta.attribute-selector.scss"],
      settings: {
        foreground: "#b89ae4",
      },
    },
    {
      scope: [
        "punctuation.definition.attribute-selector.end.bracket.square.scss",
        "punctuation.definition.attribute-selector.begin.bracket.square.scss",
      ],
      settings: {
        foreground: "#F8F8F2",
      },
    },
    {
      scope: ["meta.preprocessor.haskell"],
      settings: {
        foreground: "#FFFFFF55",
      },
    },
    {
      scope: ["log.error"],
      settings: {
        fontStyle: "bold",
        foreground: "#FF5555",
      },
    },
    {
      scope: ["log.warning"],
      settings: {
        fontStyle: "bold",
        foreground: "#b89ae4",
      },
    },
  ],
  type: "dark",
};

let highlighterPromise: ReturnType<typeof createHighlighter>;

export const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [FROSTIN_DARK as any],
      langs: [bundledLanguages.tsx],
    });
  }
  return highlighterPromise;
};
