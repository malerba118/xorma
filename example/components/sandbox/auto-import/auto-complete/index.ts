import type * as Monaco from 'monaco-editor'

import { ImportAction } from './import-action'
import ImportCompletion from './import-completion'
import ImportDb from './import-db'

export let monaco: typeof Monaco

export interface Options {
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor,
  spacesBetweenBraces: boolean,
  doubleQuotes: boolean,
  semiColon: boolean
  alwaysApply: boolean
}

class AutoImport {
  public imports = new ImportDb()
  private readonly editor: Monaco.editor.IStandaloneCodeEditor
  private readonly spacesBetweenBraces: boolean
  private readonly doubleQuotes: boolean
  private readonly semiColon: boolean
  private readonly alwaysApply: boolean

  constructor(options: Options) {
    monaco = options.monaco
    this.editor = options.editor
    this.spacesBetweenBraces = options.spacesBetweenBraces ?? true
    this.doubleQuotes = options.doubleQuotes ?? true
    this.semiColon = options.semiColon ?? true
    this.alwaysApply = options.alwaysApply ?? true
    this.attachCommands()
  }
  
  /**
   * Register the commands to monaco & enable auto-importation
   */
  public attachCommands() {
    const completor = new ImportCompletion(monaco, this.editor, this.imports, this.spacesBetweenBraces, this.doubleQuotes, this.semiColon, this.alwaysApply)
    monaco.languages.registerCompletionItemProvider('javascript', completor)
    monaco.languages.registerCompletionItemProvider('typescript', completor)

    const actions = new ImportAction(this.editor, this.imports)
    monaco.languages.registerCodeActionProvider('javascript', actions as any)
    monaco.languages.registerCodeActionProvider('typescript', actions as any)
  }
}

export default AutoImport
