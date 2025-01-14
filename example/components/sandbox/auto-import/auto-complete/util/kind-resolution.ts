import { monaco } from '..'
import type { ImportObject } from '../import-db'

const kindResolver = (imp: ImportObject) => {
  switch (imp.type) {
    case 'function':
      return monaco.languages.CompletionItemKind.Function
      
    case 'interface':
      return monaco.languages.CompletionItemKind.Interface

    case 'var':
    case 'const':
    case 'let':
    case 'default':
      return monaco.languages.CompletionItemKind.Variable

    case 'enum':
    case 'const enum':
      return monaco.languages.CompletionItemKind.Enum

    case 'class':
      return monaco.languages.CompletionItemKind.Class

    case 'type':
      return monaco.languages.CompletionItemKind.Method

    case 'module':
      return monaco.languages.CompletionItemKind.Module

    default:
      return monaco.languages.CompletionItemKind.Reference
  }
}

export default kindResolver
