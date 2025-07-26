import { ASTNode, NormalizedAST, AST } from '../../types/index';

/**
 * Normalizes AST for comparison purposes
 */
export class ASTNormalizer {
  /**
   * Normalize AST node by removing position information and standardizing structure
   */
  normalizeASTNode(node: ASTNode): ASTNode {
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
  generateASTHash(node: ASTNode): string {
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
   * Create normalized AST from regular AST
   */
  createNormalizedAST(ast: AST): NormalizedAST {
    const normalizedRoot = this.normalizeASTNode(ast.root);
    const hash = this.generateASTHash(normalizedRoot);

    return {
      ...ast,
      root: normalizedRoot,
      normalized: true,
      hash
    };
  }
}
