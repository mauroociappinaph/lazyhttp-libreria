import { ASTNode, FunctionNode, ParameterNode } from '../../../types/index';

/**
 * Extracts function-related information from AST nodes
 */
export class FunctionExtractor {
  /**
   * Extract function node information
   */
  extractFunctionNode(node: ASTNode): FunctionNode | null {
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

  private isNodeExported(_node: ASTNode): boolean {
    // This would need to be determined from the parent context
    // For now, return false as a placeholder
    return false;
  }
}
