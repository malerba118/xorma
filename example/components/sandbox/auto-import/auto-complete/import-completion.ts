import type * as Monaco from "monaco-editor";

import type { ImportDb, ImportObject } from "./import-db";
import { ImportFixer } from "./import-fixer";
import kindResolver from "./util/kind-resolution";

export const IMPORT_COMMAND = "resolveImport";

class ImportCompletion implements Monaco.languages.CompletionItemProvider {
  private monaco: typeof Monaco;
  private editor: Monaco.editor.IStandaloneCodeEditor;
  private importDb: ImportDb;
  private spacesBetweenBraces: boolean;
  private doubleQuotes: boolean;
  private semiColon: boolean;
  private alwaysApply: boolean;

  constructor(
    monaco: typeof Monaco,
    editor: Monaco.editor.IStandaloneCodeEditor,
    importDb: ImportDb,
    spacesBetweenBraces: boolean,
    doubleQuotes: boolean,
    semiColon: boolean,
    alwaysApply: boolean
  ) {
    this.monaco = monaco;
    this.editor = editor;
    this.importDb = importDb;
    this.spacesBetweenBraces = spacesBetweenBraces;
    this.doubleQuotes = doubleQuotes;
    this.semiColon = semiColon;
    this.alwaysApply = alwaysApply;

    // Register the resolveImport
    editor.addAction({
      id: IMPORT_COMMAND,
      label: "resolve imports",
      run: (_, ...args) => {
        const [imp, doc] = args;
        this.handleCommand.call(this, imp, doc);
      },
    });
  }

  /**
   * Handles a command sent by monaco, when the
   * suggestion has been selected
   */
  public handleCommand(imp: ImportObject, document: Monaco.editor.ITextModel) {
    new ImportFixer(
      this.monaco,
      this.editor,
      this.spacesBetweenBraces,
      this.doubleQuotes,
      this.semiColon,
      this.alwaysApply
    ).fix(document, imp);
  }

  public provideCompletionItems(document: Monaco.editor.ITextModel) {
    const imports = this.importDb.all();
    const currentDoc = document.getValue();
    const exp = /(?:[ \t]*import[ \t]+{)(.*)}[ \t]+from[ \t]+['"](.*)['"]/g;
    const match = exp.exec(currentDoc);
    let existing: string[] = [];

    if (match) {
      const [_, workingString, __] = match;
      existing = workingString.split(",").map((name) => name.trim());
    }

    return {
      suggestions: imports
        .filter(
          (i) =>
            existing.includes(i.name) === false || i.name.startsWith("type ")
        )
        .map((i) =>
          this.buildCompletionItem(i, document, existing.includes(i.name))
        ),
      incomplete: true,
    };
  }

  private buildCompletionItem(
    imp: ImportObject,
    document: Monaco.editor.ITextModel,
    alias: boolean
  ): Monaco.languages.CompletionItem {
    const path = this.createDescription(imp);
    const name = imp.name.startsWith("type ") ? imp.name.slice(5) : imp.name;
    const kind = alias
      ? this.monaco.languages.CompletionItemKind.Property
      : kindResolver(imp);
    const detail = alias
      ? `(alias) ${imp.type} ${name}`
      : `import ${imp.name} from "${path}"`;

    return {
      label: name,
      kind: kind,
      detail: detail,
      insertText: name,
      command: {
        title: "AI: Autocomplete",
        id: `vs.editor.ICodeEditor:1:${IMPORT_COMMAND}`,
        arguments: [imp, document],
      },
    } as any;
  }

  private createDescription({ file }: ImportObject) {
    return file.aliases![0] || file.path;
  }
}

export default ImportCompletion;
