import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  ASTParser as IASTParser,
  AST,
  NormalizedAST,
  FileMetadata,
  ASTNode,
  FunctionNode,
  ClassNode,
  ModuleNode,
  ParameterNode,
  PropertyNode,
  ImportNode,
  ExportNode,
  DuplicateDetectionError,
  ErrorType
} from '../types/index';

/**
 * TypeScript AST Parser and Normalizer
 * Implements parsing of TypeScript files using the TypeScript Compiler API
 */
export class TypeScriptASTParser implements IASTParser {
  constructor(_compilerOptions?: ts.CompilerOptions) {
    // Compiler options could be used for future customization
    // Currently using default options for parsing
  }

  /**
   * Parse a TypeScript/JavaScript file and return its AST
   */
  async parseFile(filePath: string): Promise<AST> {
    try {
      // Read file content
      const sourceCode = await fs.readFile(filePath, 'utf-8');

      // Create source file
      const sourceFile = ts.createSourceFile(
        path.basename(filePath),
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );

      // Convert TypeScript AST to our AST format
      const root = this.convertTSNodeToASTNode(sourceFile);

      return {
        nodeCount: this.countNodes(root),
        root,
        sourceFile: filePath
      };
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.PARSE_ERROR,
        filePath
      );
    }
  }

  /**
   * Normalize AST for comparison by removing position information and standardizing structure
   */
  normalizeAST(ast: AST): NormalizedAST {
    try {
      const normalizedRoot = this.normalizeASTNode(ast.root);
      const hash = this.generateASTHash(normalizedRoot);

      return {
        ...ast,
        root: normalizedRoot,
        normalized: true,
        hash
      };
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.PARSE_ERROR,
        ast.sourceFile
      );
    }
  }

  /**
   * Extract metadata from AST including functions, classes, modules, imports, and exports
   */
  extractMetadata(ast: AST): FileMetadata {
    try {
      const metadata: FileMetadata = {
        filePath: ast.sourceFile,
        functions: [],
        classes: [],
        modules: [],
        imports: [],
        exports: [],
        lineCount: 0,
        tokenCount: 0
      };

      this.extractMetadataFromNode(ast.root, metadata);

      // Calculate line count and token count
      metadata.lineCount = this.calculateLineCount(ast.root);
      metadata.tokenCount = ast.nodeCount;

      return metadata;
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.PARSE_ERROR,
        ast.sourceFile
      );
    }
  }

  /**
   * Convert TypeScript AST Node to our AST Node format
   */
  private convertTSNodeToASTNode(node: ts.Node): ASTNode {
    const children: ASTNode[] = [];

    ts.forEachChild(node, (child) => {
      children.push(this.convertTSNodeToASTNode(child));
    });

    const sourceFile = node.getSourceFile();
    const position = sourceFile ? sourceFile.getLineAndCharacterOfPosition(node.getStart()) : { line: 0, character: 0 };

    return {
      type: ts.SyntaxKind[node.kind],
      children,
      value: this.extractNodeValue(node),
      position: {
        line: position.line + 1,
        column: position.character + 1
      }
    };
  }

  /**
   * Extract meaningful value from TypeScript node
   */
  private extractNodeValue(node: ts.Node): unknown {
    switch (node.kind) {
      case ts.SyntaxKind.Identifier:
        return (node as ts.Identifier).text;
      case ts.SyntaxKind.StringLiteral:
        return (node as ts.StringLiteral).text;
      case ts.SyntaxKind.NumericLiteral:
        return (node as ts.NumericLiteral).text;
      case ts.SyntaxKind.TrueKeyword:
        return true;
      case ts.SyntaxKind.FalseKeyword:
        return false;
      case ts.SyntaxKind.NullKeyword:
        return null;
      default:
        return undefined;
    }
  }

  /**
   * Normalize AST node by removing position information and standardizing structure
   */
  private normalizeASTNode(node: ASTNode): ASTNode {
    return {
      type: node.type,
      children: node.children.map(child => this.normalizeASTNode(child)),
      value: node.value,
      position: { line: 0, column: 0 } // Normalize position for comparison
    };
  }

  /**
   * Generate hash for normalized AST
   */
  private generateASTHash(node: ASTNode): string {
    const nodeString = JSON.stringify(node, (key, value) => {
      if (key === 'position') return undefined; // Exclude position from hash
      return value;
    });

    // Simple hash function (in production, consider using crypto.createHash)
    let hash = 0;
    for (let i = 0; i < nodeString.length; i++) {
      const char = nodeString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Count total nodes in AST
   */
  private countNodes(node: ASTNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Calculate line count from AST
   */
  private calculateLineCount(node: ASTNode): number {
    let maxLine = node.position.line;

    const traverse = (n: ASTNode) => {
      if (n.position.line > maxLine) {
        maxLine = n.position.line;
      }
      for (const child of n.children) {
        traverse(child);
      }
    };

    traverse(node);
    return maxLine;
  }

  /**
   * Extract metadata from AST node recursively
   */
  private extractMetadataFromNode(node: ASTNode, metadata: FileMetadata): void {
    switch (node.type) {
      case 'FunctionDeclaration':
      case 'MethodDeclaration':
      case 'ArrowFunction':
      case 'FunctionExpression': {
        const functionNode = this.extractFunctionNode(node);
        if (functionNode) {
          metadata.functions.push(functionNode);
        }
        break;
      }

      case 'ClassDeclaration': {
        const classNode = this.extractClassNode(node);
        if (classNode) {
          metadata.classes.push(classNode);
        }
        break;
      }

      case 'ModuleDeclaration': {
        const moduleNode = this.extractModuleNode(node);
        if (moduleNode) {
          metadata.modules.push(moduleNode);
        }
        break;
      }

      case 'ImportDeclaration': {
        const importNode = this.extractImportNode(node);
        if (importNode) {
          metadata.imports.push(importNode);
        }
        break;
      }

      case 'ExportDeclaration':
      case 'ExportAssignment': {
        const exportNode = this.extractExportNode(node);
        if (exportNode) {
          metadata.exports.push(exportNode);
        }
        break;
      }
    }

    // Recursively process children
    for (const child of node.children) {
      this.extractMetadataFromNode(child, metadata);
    }
  }

  /**
   * Extract function node information
   */
  private extractFunctionNode(node: ASTNode): FunctionNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || 'anonymous';

      const parameters = this.extractParameters(node);
      const body = node.children.filter(child =>
        child.type === 'Block' || child.type === 'ArrowFunction'
      );

      const isAsync = node.children.some(child => child.type === 'AsyncKeyword');
      const isExported = this.isNodeExported(node);

      return {
        ...node,
        name,
        parameters,
        returnType: this.extractReturnType(node),
        body,
        isAsync,
        isExported
      } as FunctionNode;
    } catch {
      return null;
    }
  }

  /**
   * Extract class node information
   */
  private extractClassNode(node: ASTNode): ClassNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || 'anonymous';

      const methods: FunctionNode[] = [];
      const properties: PropertyNode[] = [];

      // Extract methods and properties
      for (const child of node.children) {
        if (child.type === 'MethodDeclaration') {
          const method = this.extractFunctionNode(child);
          if (method) methods.push(method);
        } else if (child.type === 'PropertyDeclaration') {
          const property = this.extractPropertyNode(child);
          if (property) properties.push(property);
        }
      }

      const extendsClause = this.extractExtendsClause(node);
      const implementsClause = this.extractImplementsClause(node);
      const isExported = this.isNodeExported(node);

      return {
        ...node,
        name,
        methods,
        properties,
        extends: extendsClause,
        implements: implementsClause,
        isExported
      } as ClassNode;
    } catch {
      return null;
    }
  }

  /**
   * Extract module node information
   */
  private extractModuleNode(node: ASTNode): ModuleNode | null {
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

  /**
   * Extract import node information
   */
  private extractImportNode(node: ASTNode): ImportNode | null {
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
  private extractExportNode(node: ASTNode): ExportNode | null {
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

  // Helper methods for extraction
  private extractParameters(node: ASTNode): ParameterNode[] {
    const parameters: ParameterNode[] = [];

    for (const child of node.children) {
      if (child.type === 'Parameter') {
        const param = this.extractParameterNode(child);
        if (param) parameters.push(param);
      }
    }

    return parameters;
  }

  private extractParameterNode(node: ASTNode): ParameterNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || '';

      const isOptional = node.children.some(child => child.type === 'QuestionToken');
      const parameterType = this.extractTypeAnnotation(node);
      const defaultValue = this.extractDefaultValue(node);

      return {
        ...node,
        name,
        parameterType,
        defaultValue,
        isOptional
      } as ParameterNode;
    } catch {
      return null;
    }
  }

  private extractPropertyNode(node: ASTNode): PropertyNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || '';

      const isPrivate = node.children.some(child => child.type === 'PrivateKeyword');
      const isStatic = node.children.some(child => child.type === 'StaticKeyword');
      const propertyType = this.extractTypeAnnotation(node);
      const defaultValue = this.extractDefaultValue(node);

      return {
        ...node,
        name,
        propertyType,
        isPrivate,
        isStatic,
        defaultValue
      } as PropertyNode;
    } catch {
      return null;
    }
  }

  private extractReturnType(node: ASTNode): string | undefined {
    const typeNode = node.children.find(child => child.type === 'TypeAnnotation');
    return typeNode?.children[0]?.value as string;
  }

  private extractTypeAnnotation(node: ASTNode): string | undefined {
    const typeNode = node.children.find(child => child.type === 'TypeAnnotation');
    return typeNode?.children[0]?.value as string;
  }

  private extractDefaultValue(node: ASTNode): unknown {
    const defaultNode = node.children.find(child =>
      child.type === 'EqualsToken' || child.type === 'Initializer'
    );
    return defaultNode?.children[0]?.value;
  }

  private extractExtendsClause(node: ASTNode): string | undefined {
    const extendsNode = node.children.find(child => child.type === 'HeritageClause');
    if (extendsNode) {
      const typeNode = extendsNode.children.find(child => child.type === 'ExpressionWithTypeArguments');
      return typeNode?.children[0]?.value as string;
    }
    return undefined;
  }

  private extractImplementsClause(node: ASTNode): string[] | undefined {
    const implementsNodes = node.children.filter(child => child.type === 'HeritageClause');
    const implementsClause: string[] = [];

    for (const implementsNode of implementsNodes) {
      const typeNodes = implementsNode.children.filter(child =>
        child.type === 'ExpressionWithTypeArguments'
      );
      for (const typeNode of typeNodes) {
        const name = typeNode.children[0]?.value as string;
        if (name) implementsClause.push(name);
      }
    }

    return implementsClause.length > 0 ? implementsClause : undefined;
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

  private isNodeExported(_node: ASTNode): boolean {
    // This would need to be determined from the parent context
    // For now, return false as a placeholder
    return false;
  }
}

// Export the TypeScript parser as the default ASTParser implementation
export const ASTParser = TypeScriptASTParser;
