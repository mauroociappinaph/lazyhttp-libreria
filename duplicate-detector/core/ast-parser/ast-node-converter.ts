import * as ts from 'typescript';
import { ASTNode } from '../../types/index';

/**
 * Converts TypeScript AST nodes to our custom AST format
 */
export class ASTNodeConverter {
  /**
   * Convert TypeScript AST Node to our AST Node format
   */
  convertTSNodeToASTNode(node: ts.Node): ASTNode {
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
}
