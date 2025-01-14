import type * as Monaco from 'monaco-editor'
import { getMatches } from './../parser/util'
import type { ImportObject } from './import-db'
import type { Expression } from '../parser'

export class ImportFixer {
  private monaco: typeof Monaco
  private editor: Monaco.editor.IStandaloneCodeEditor
  private spacesBetweenBraces: boolean
  private doubleQuotes: boolean
  private semiColon: boolean
  private alwaysApply: boolean

  constructor(monaco: typeof Monaco, editor: Monaco.editor.IStandaloneCodeEditor, spacesBetweenBraces: boolean, doubleQuotes: boolean, semiColon: boolean, alwaysApply: boolean) {
    this.monaco = monaco
    this.editor = editor
    this.spacesBetweenBraces = spacesBetweenBraces
    this.doubleQuotes = doubleQuotes
    this.semiColon = semiColon
    this.alwaysApply = alwaysApply
  }

  public fix(document: Monaco.editor.ITextModel, imp: ImportObject): void {
    const position = this.editor.getPosition()!
    const edits = this.getTextEdits(document, imp)
    if (position.lineNumber <= 1) {
      const text = edits[0].text ?? ""
      const offset = edits[0].range.endLineNumber > 0 ? 0 : 1
      this.editor.executeEdits('', edits)
      this.editor.setPosition(new this.monaco.Position(position.lineNumber + offset, text.length + position.column))
    }
    else {
      const offset = edits[0].range.endLineNumber > 0 ? 0 : 1
      this.editor.executeEdits('', edits)
      this.editor.setPosition(new this.monaco.Position(position.lineNumber + offset, position.column))
    }
  }

  public getTextEdits(document: Monaco.editor.ITextModel, imp: ImportObject): Monaco.editor.IIdentifiedSingleEditOperation[] {
    const edits = new Array<Monaco.editor.IIdentifiedSingleEditOperation>()
    const { importResolved, fileResolved, imports } = this.parseResolved(document, imp)

    if (importResolved) {
      return edits
    }

    if (fileResolved) {
      edits.push({
        range: new this.monaco.Range(0, 0, document.getLineCount() + 1, 0),
        text: this.mergeImports(document, imp, imports.filter(({ path }) => path === imp.file.path || imp.file.aliases!.indexOf(path) > -1)[0].path)
      })
    } 
    else {
      edits.push({
        range: new this.monaco.Range(0, 0, 0, 0),
        text: this.createImportStatement(document, imp) + '\n'
      })
    }

    return edits
  }

  /**
   * Returns whether a given import has already been
   * resolved by the user
   */
  private parseResolved(document: Monaco.editor.ITextModel, imp: ImportObject): { imports: { names: string[]; path: string; }[], importResolved: boolean, fileResolved: boolean } {
    const exp = /(?:[ \t]*import[ \t]+{)(.*)}[ \t]+from[ \t]+['"](.*)['"](;?)/g
    const value = document.getValue()
    const matches = getMatches(value, exp)
    const parsed = matches.map(([_, names, path]) => ({ names: names.split(',').map(imp => imp.trim().replace(/\n/g, '')), path }))
    const imports = parsed.filter(({ path }) => path === imp.file.path || imp.file.aliases!.indexOf(path) > -1)
    const importResolved = imports.findIndex(i => i.names.indexOf(imp.name) > -1) > -1
    return { imports, importResolved, fileResolved: !!imports.length }
  }

  /**
   * Merges an import statement into the document
   */
  private mergeImports(document: Monaco.editor.ITextModel, imp: ImportObject, path: string): string {
    let currentDoc = document.getValue()
    const exp = new RegExp(`(?:[ \t]*import[ \t]+{)(.*)}[ \t]+from[ \t]+['"](${path})['"](;?)`)
    const match = exp.exec(currentDoc)

    if (match) {
      let [_, workingString, __] = match
      const imports = [...workingString.split(',').map(name => name.trim()), imp.name]
      const newImport = this.createImportStatement(document, { name: imports.join(', '), path: path, type: imp.type })
      currentDoc = currentDoc.replace(exp, newImport)
    }

    return currentDoc
  }

  /**
   * Adds a new import statement to the document
   */
  private createImportStatement(document: Monaco.editor.ITextModel, imp: ImportObject | { name: string, path: string, type: Expression }): string {
    const path = 'path' in imp ? imp.path : imp.file.aliases![0] || imp.file.path

    const formattedPath = path.replace(/\"/g, '').replace(/\'/g, '').replace(';', '')
    let returnStr = ""

    let currentDoc = document.getValue()
    const existsExp = new RegExp(`(?:import[ \t]+{)(?:.*)(?:}[ \t]+from[ \t]+['"])(?:${path})(?:['"])`)
    const doubleQuoteExp = new RegExp(`(?:import[ \t]+{)(?:.*)(?:}[ \t]+from[ \t]+")(?:${path})(?:")`)
    const spacesExp = new RegExp(`(?:import[ \t]+{[ \t]+)(?:.*)(?:[ \t]*}[ \t]+from[ \t]+['"])(?:${path})(?:['"])`)
    const semiColonExp = new RegExp(`(?:import[ \t]+{)(?:.*)(?:}[ \t]+from[ \t]+['"])(?:${path})(?:['"]);`)

    const exists = currentDoc.match(existsExp) !== null
    const doubleQuote = currentDoc.match(doubleQuoteExp) !== null
    const spaces = currentDoc.match(spacesExp) !== null
    const semiColon = currentDoc.match(semiColonExp) !== null ? ';' : ''

    if (doubleQuote && spaces) {
      returnStr = `import { ${imp.name} } from "${formattedPath}"${semiColon}`
    } else if (doubleQuote) {
      returnStr = `import {${imp.name}} from "${formattedPath}"${semiColon}`
    } else if (spaces) {
      returnStr = `import { ${imp.name} } from '${formattedPath}'${semiColon}`
    } else {
      returnStr = `import {${imp.name}} from '${formattedPath}'${semiColon}`
    }

    if (!exists || this.alwaysApply) {
      const s = this.spacesBetweenBraces ? ' ' : ''
      const q = this.doubleQuotes ? '\"' : '\''
      const c = this.semiColon ? ';' : ''
      returnStr = `import {${s}${imp.name}${s}} from ${q}${formattedPath}${q}${c}`
    }

    return returnStr
  }

  private getRelativePath(importObj: Monaco.Uri | any): string {
    return importObj
  }

  private normaliseRelativePath(relativePath: string): string {
    const removeFileExtenion = (rp: string) => rp ? rp.substring(0, rp.lastIndexOf('.')) : rp
    const makeRelativePath = (rp: string) => {
      let preAppend = './'
      if (!rp.startsWith(preAppend)) {
        rp = preAppend + rp
      }
      rp = rp.replace(/\\/g, '/')
      return rp
    }

    relativePath = makeRelativePath(relativePath)
    relativePath = removeFileExtenion(relativePath)

    return relativePath
  }
}
