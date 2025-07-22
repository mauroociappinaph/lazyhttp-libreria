import { ASTNode, ClassNode, FunctionNode, PropertyNode } from '../../../types/index';
import { FunctionExtractor } from './function-extractor';

/**
 * Extracts class-related information from AST nodes
 */
export class ClassExtractor {
  private functionExtractor: FunctionExtractor;

  constructor() {
    this.functionExtractor = new FunctionExtractor();
  }

  /**
   * Extract class node information
   */
  extractClassNode(node: ASTNode): ClassNode | null {
    try {
      const nameNode = node.children.find(child => child.type === 'Identifier');
      const name = nameNode?.value as string || 'anonymous';

      const methods: FunctionNode[] = [];
      const properties: PropertyNode[] = [];

      // Extract methods and properties
      for (const child of node.children) {
        if (child.type === 'MethodDeclaration') {
          const method = this.functionExtractor.extractFunctionNode(child);
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

  private isNodeExported(_node: ASTNode): boolean {
    // This would need to be determined from the parent context
    // For now, return false as a placeholder
    return false;
  }
}
