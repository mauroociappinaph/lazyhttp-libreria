import { ASTNode, ImportNode, ExportNode, ModuleNode } from '../../../types/index';

/**
 * Extracts import/export and module information from AST nodes
 */
export class ImportExportExtractor {
  /**
   * Extract import node information
   */
  extractImportNode(node: ASTNode): ImportNode | null {
    try {
      const sourceNode = node.children.find(child => child.type === 'StringLiteral');
      const source = sourceNode?.value as string || '';

      const imports: string[] = [];
      let isDefault = false;

      // Extract import specifiers
      for (const child of node.children) {
        if (child.type === 'ImportClause') {
          const specifiers = this.extractImportSpecifiers(child);
          imports.push(...specifiers.imports);
          isDefault = specifiers.isDefault;
        }
      }

      return {
        ...node,
        source,
        imports,
        isDefault
      } as ImportNode;
    } catch {
      return null;
    }
  }

  /**
   * Extract export node information
   */
  extractExportNode(node: ASTNode): ExportNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || 'default';

      const isDefault = node.children.some(child => child.type === 'DefaultKeyword');
      const type = this.determineExportType(node);

      return {
        ...node,
        name,
        isDefault,
        type
      } as ExportNode;
    } catch {
      return null;
    }
  }

  /**
   * Extract module node information
   */
  extractModuleNode(node: ASTNode): ModuleNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || 'anonymous';

      return {
        ...node,
        name,
        exports: [],
        imports: []
      } as ModuleNode;
    } catch {
      return null;
    }
  }

  private extractImportSpecifiers(node: ASTNode): { imports: string[], isDefault: boolean } {
    const imports: string[] = [];
    let isDefault = false;

    for (const child of node.children) {
      if (child.type === 'Identifier') {
        isDefault = true;
        imports.push(child.value as string);
      } else if (child.type === 'NamedImports') {
        for (const specifier of child.children) {
          if (specifier.type === 'ImportSpecifier') {
            const nameNode = specifier.children.find(c => c.type === 'Identifier');
            if (nameNode) imports.push(nameNode.value as string);
          }
        }
      }
    }

    return { imports, isDefault };
  }

  private determineExportType(node: ASTNode): 'function' | 'class' | 'variable' | 'type' {
    if (node.children.some(child => child.type === 'FunctionDeclaration')) {
      return 'function';
    }
    if (node.children.some(child => child.type === 'ClassDeclaration')) {
      return 'class';
    }
    if (node.children.some(child => child.type === 'TypeAliasDeclaration' || child.type === 'InterfaceDeclaration')) {
      return 'type';
    }
    return 'variable';
  }
}
