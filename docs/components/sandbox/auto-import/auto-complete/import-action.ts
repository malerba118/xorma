import type * as Monaco from 'monaco-editor'

import { IMPORT_COMMAND } from './import-completion'
import type { ImportDb, ImportObject } from './import-db'

export interface Context {
  document: Monaco.editor.ITextModel
  range: Monaco.Range
  context: Monaco.languages.CodeActionContext
  token: Monaco.CancellationToken
  imports?: ImportObject[]
}

export class ImportAction implements Monaco.languages.CodeActionProvider {
  constructor(private editor: Monaco.editor.IStandaloneCodeEditor, private importDb: ImportDb) {
    this.editor.updateOptions({ lightbulb: { enabled: true } })
  }

  // @ts-ignore
  public provideCodeActions(document: Monaco.editor.ITextModel, range: Monaco.Range, context: Monaco.languages.CodeActionContext, token: Monaco.CancellationToken): Monaco.languages.CodeAction[]|undefined {
    let actionContext = { document, range, context, token }
    if (this.canHandleAction(actionContext)) {
      return this.actionHandler(actionContext)
    }
    return undefined;
  }

  private canHandleAction(context: Context): boolean {
    if (!context.context.markers) {
      return false
    }

    let [diagnostic] = context.context.markers
    if (!diagnostic) {
      return false
    }

    if (diagnostic.message.startsWith('Typescript Cannot find name') || diagnostic.message.startsWith('Cannot find name')) {
      const imp = diagnostic.message.replace('Typescript Cannot find name', '').replace('Cannot find name', '').replace(/{|}|from|import|'|"| |\.|;/gi, '')
      const found = this.importDb.getImports(imp)
      if (found.length) {
        context.imports = found
        return true
      }
    }
    return false
  }

  private actionHandler(context: Context) {
    let path = ({ file }: ImportObject) => { return file.aliases![0] || file.path }
    let handlers = new Array<Monaco.languages.CodeAction>();
    (handlers as any).dispose = () => {}
    context.imports!.forEach(i => {
      handlers.push({
        title: `Import '${i.name}' from module "${path(i)}"`,
        command: {
          title: 'AI: Autocomplete',
          id: `vs.editor.ICodeEditor:1:${IMPORT_COMMAND}`,
          arguments: [i, context.document]
        }
      })
    })
    return handlers
  }
}
