import {
  SimilarityCalculator as ISimilarityCalculator,
  AST,
  ASTNode,
  SimilarityScore,
  DuplicateDetectionError,
  ErrorType
} from '../types/index';

/**
 * Tree Edit Distance Calculator using APTED algorithm
 * Implements similarity calculation between AST structures
 */
export class TreeSimilarityCalculator implements ISimilarityCalculator {
  private threshold: number = 0.8;

  constructor(threshold: number = 0.8) {
    this.setThreshold(threshold);
  }

  /**
   * Calculate similarity between two ASTs using multiple algorithms
   */
  calculateSimilarity(ast1: AST, ast2: AST): SimilarityScore {
    try {
      // Calculate different types of similarity
      const syntacticScore = this.calculateSyntacticSimilarity(ast1.root, ast2.root);
      const structuralScore = this.calculateStructuralSimilarity(ast1.root, ast2.root);
      const editDistance = this.calculateTreeEditDistance(ast1.root, ast2.root);

      // Normalize edit distance to similarity score (0-1)
      const maxNodes = Math.max(ast1.nodeCount, ast2.nodeCount);
      const normalizedEditDistance = maxNodes > 0 ? 1 - (editDistance / maxNodes) : 1;

      // Calculate weighted average
      const combinedScore = (syntacticScore * 0.4 + structuralScore * 0.3 + normalizedEditDistance * 0.3);

      // Calculate confidence based on tree sizes and similarity consistency
      const confidence = this.calculateConfidence(ast1, ast2, syntacticScore, structuralScore, normalizedEditDistance);

      return {
        score: Math.max(0, Math.min(1, combinedScore)),
        confidence,
        type: this.determineSimilarityType(syntacticScore, structuralScore),
        details: {
          editDistance,
          commonTokens: this.countCommonTokens(ast1.root, ast2.root),
          structuralSimilarity: structuralScore
        }
      };
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.ANALYSIS_TIMEOUT,
        `${ast1.sourceFile} vs ${ast2.sourceFile}`
      );
    }
  }

  /**
   * Set similarity threshold
   */
  setThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new DuplicateDetectionError(
        ErrorType.CONFIGURATION_ERROR,
        'Threshold must be between 0 and 1'
      );
    }
    this.threshold = threshold;
  }

  /**
   * Calculate syntactic similarity based on token matching
   */
  private calculateSyntacticSimilarity(node1: ASTNode, node2: ASTNode): number {
    if (node1.type !== node2.type) {
      return 0;
    }

    let similarity = 1; // Start with perfect match for same type

    // Compare node values
    if (node1.value !== node2.value) {
      similarity *= 0.8; // Reduce similarity for different values
    }

    // Compare children recursively
    const maxChildren = Math.max(node1.children.length, node2.children.length);
    if (maxChildren === 0) {
      return similarity;
    }

    let childSimilarity = 0;
    const minChildren = Math.min(node1.children.length, node2.children.length);

    for (let i = 0; i < minChildren; i++) {
      childSimilarity += this.calculateSyntacticSimilarity(node1.children[i], node2.children[i]);
    }

    // Average child similarity, penalize for different number of children
    childSimilarity = (childSimilarity / maxChildren) * (minChildren / maxChildren);

    return similarity * 0.3 + childSimilarity * 0.7;
  }

  /**
   * Calculate structural similarity based on tree shape
   */
  private calculateStructuralSimilarity(node1: ASTNode, node2: ASTNode): number {
    const structure1 = this.extractStructure(node1);
    const structure2 = this.extractStructure(node2);

    return this.compareStructures(structure1, structure2);
  }

  /**
   * Extract structural representation of AST node
   */
  private extractStructure(node: ASTNode): string[] {
    const structure: string[] = [node.type];

    for (const child of node.children) {
      structure.push(...this.extractStructure(child));
    }

    return structure;
  }

  /**
   * Compare two structural representations
   */
  private compareStructures(struct1: string[], struct2: string[]): number {
    if (struct1.length === 0 && struct2.length === 0) {
      return 1;
    }

    const commonElements = this.findCommonElements(struct1, struct2);
    const maxLength = Math.max(struct1.length, struct2.length);

    return commonElements / maxLength;
  }

  /**
   * Find common elements between two arrays
   */
  private findCommonElements(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    let common = 0;

    for (const item of set1) {
      if (set2.has(item)) {
        common++;
      }
    }

    return common;
  }

  /**
   * Calculate Tree Edit Distance using simplified APTED algorithm
   */
  private calculateTreeEditDistance(node1: ASTNode, node2: ASTNode): number {
    // Memoization cache for dynamic programming
    const memo = new Map<string, number>();

    return this.aptedDistance(node1, node2, memo);
  }

  /**
   * APTED (All Pairs Tree Edit Distance) algorithm implementation
   */
  private aptedDistance(node1: ASTNode | null, node2: ASTNode | null, memo: Map<string, number>): number {
    // Base cases
    if (!node1 && !node2) return 0;
    if (!node1) return this.getSubtreeSize(node2!);
    if (!node2) return this.getSubtreeSize(node1);

    // Create memoization key
    const key = this.createMemoKey(node1, node2);
    if (memo.has(key)) {
      return memo.get(key)!;
    }

    let minCost = Infinity;

    // Case 1: Delete node1
    const deleteCost = 1 + this.aptedDistance(null, node2, memo);
    minCost = Math.min(minCost, deleteCost);

    // Case 2: Insert node2
    const insertCost = 1 + this.aptedDistance(node1, null, memo);
    minCost = Math.min(minCost, insertCost);

    // Case 3: Replace/Match nodes
    const replaceCost = (node1.type === node2.type && node1.value === node2.value ? 0 : 1) +
      this.calculateChildrenDistance(node1.children, node2.children, memo);
    minCost = Math.min(minCost, replaceCost);

    memo.set(key, minCost);
    return minCost;
  }

  /**
   * Calculate distance between children arrays
   */
  private calculateChildrenDistance(children1: ASTNode[], children2: ASTNode[], memo: Map<string, number>): number {
    if (children1.length === 0 && children2.length === 0) return 0;
    if (children1.length === 0) return children2.reduce((sum, child) => sum + this.getSubtreeSize(child), 0);
    if (children2.length === 0) return children1.reduce((sum, child) => sum + this.getSubtreeSize(child), 0);

    // Use dynamic programming for optimal alignment
    const dp: number[][] = Array(children1.length + 1)
      .fill(null)
      .map(() => Array(children2.length + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= children1.length; i++) {
      dp[i][0] = i === 0 ? 0 : dp[i-1][0] + this.getSubtreeSize(children1[i-1]);
    }
    for (let j = 0; j <= children2.length; j++) {
      dp[0][j] = j === 0 ? 0 : dp[0][j-1] + this.getSubtreeSize(children2[j-1]);
    }

    // Fill DP table
    for (let i = 1; i <= children1.length; i++) {
      for (let j = 1; j <= children2.length; j++) {
        const deleteCost = dp[i-1][j] + this.getSubtreeSize(children1[i-1]);
        const insertCost = dp[i][j-1] + this.getSubtreeSize(children2[j-1]);
        const replaceCost = dp[i-1][j-1] + this.aptedDistance(children1[i-1], children2[j-1], memo);

        dp[i][j] = Math.min(deleteCost, insertCost, replaceCost);
      }
    }

    return dp[children1.length][children2.length];
  }

  /**
   * Get size of subtree (number of nodes)
   */
  private getSubtreeSize(node: ASTNode): number {
    let size = 1;
    for (const child of node.children) {
      size += this.getSubtreeSize(child);
    }
    return size;
  }

  /**
   * Create memoization key for two nodes
   */
  private createMemoKey(node1: ASTNode, node2: ASTNode): string {
    return `${node1.type}:${node1.value}:${node1.children.length}|${node2.type}:${node2.value}:${node2.children.length}`;
  }

  /**
   * Count common tokens between two AST nodes
   */
  private countCommonTokens(node1: ASTNode, node2: ASTNode): number {
    const tokens1 = this.extractTokens(node1);
    const tokens2 = this.extractTokens(node2);

    const tokenSet1 = new Set(tokens1);
    const tokenSet2 = new Set(tokens2);

    let commonCount = 0;
    for (const token of tokenSet1) {
      if (tokenSet2.has(token)) {
        commonCount++;
      }
    }

    return commonCount;
  }

  /**
   * Extract all tokens from AST node
   */
  private extractTokens(node: ASTNode): string[] {
    const tokens: string[] = [];

    if (node.value !== undefined && node.value !== null) {
      tokens.push(String(node.value));
    }

    tokens.push(node.type);

    for (const child of node.children) {
      tokens.push(...this.extractTokens(child));
    }

    return tokens;
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidence(
    ast1: AST,
    ast2: AST,
    syntacticScore: number,
    structuralScore: number,
    editDistanceScore: number
  ): number {
    // Size similarity factor
    const sizeDiff = Math.abs(ast1.nodeCount - ast2.nodeCount);
    const maxSize = Math.max(ast1.nodeCount, ast2.nodeCount);
    const sizeSimilarity = maxSize > 0 ? 1 - (sizeDiff / maxSize) : 1;

    // Consistency factor (how similar are the different similarity measures)
    const scores = [syntacticScore, structuralScore, editDistanceScore];
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const consistency = Math.max(0, 1 - variance);

    // Combine factors
    return (sizeSimilarity * 0.3 + consistency * 0.4 + avgScore * 0.3);
  }

  /**
   * Determine the type of similarity based on scores
   */
  private determineSimilarityType(syntacticScore: number, structuralScore: number): 'syntactic' | 'semantic' | 'structural' {
    if (syntacticScore > 0.8) {
      return 'syntactic';
    } else if (structuralScore > 0.7) {
      return 'structural';
    } else {
      return 'semantic';
    }
  }
}

// Export as default implementation
export const SimilarityCalculator = TreeSimilarityCalculator;
