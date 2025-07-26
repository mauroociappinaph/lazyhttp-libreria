// Syntactic duplication analysis

import { v4 as uuidv4 } from 'uuid';
import {
  AST,
  Duplication,
  DuplicationType,
  CodeInstance,
  ASTNode
} from '../types';
import { SimilarityCalculator } from '../core/similarity-calculator';
import {
  generateHash,
  generateNormalizedCodeHash
} from '../utils/hash-utils';

export interface SyntacticAnalyzer {
  detectExactDuplicates(asts: AST[]): Duplication[];
  detectSimilarCode(asts: AST[], threshold: number): Duplication[];
}

export class DefaultSyntacticAnalyzer implements SyntacticAnalyzer {
  private similarityCalculator: InstanceType<typeof SimilarityCalculator>;

  constructor(threshold: number = 0.8) {
    this.similarityCalculator = new SimilarityCalculator(threshold);
  }

  /**
   * Detects exact code duplications using hash-based comparison
   * @param asts - Array of ASTs to analyze
   * @returns Array of detected duplications
   */
  detectExactDuplicates(asts: AST[]): Duplication[] {
    if (!asts || asts.length < 2) {
      return [];
    }

    const duplications: Duplication[] = [];
    const hashMap = new Map<string, CodeInstance[]>();

    // First pass: normalize ASTs and generate hashes
    for (const ast of asts) {
      // Extract code from the AST
      const code = this.extractCodeFromAST(ast);

      // Generate hash for the normalized code
      const codeHash = generateNormalizedCodeHash(code);

      // Create code instance
      const instance: CodeInstance = {
        file: ast.sourceFile,
        startLine: ast.root.position.line,
        endLine: this.findEndLine(ast.root),
        code,
        hash: codeHash
      };

      // Add to hash map
      if (!hashMap.has(codeHash)) {
        hashMap.set(codeHash, []);
      }
      hashMap.get(codeHash)!.push(instance);
    }

    // Second pass: identify duplications
    for (const [_, instances] of hashMap.entries()) {
      if (instances.length > 1) {
        // Create duplication entry for exact matches
        duplications.push({
          id: uuidv4(),
          type: DuplicationType.IDENTICAL,
          similarity: {
            score: 1.0,
            confidence: 1.0,
            type: 'syntactic',
            details: {
              commonTokens: instances[0].code.split(/\s+/).length
            }
          },
          instances
        });
      }
    }

    return duplications;
  }

  /**
   * Detects similar code blocks based on similarity threshold
   * @param asts - Array of ASTs to analyze
   * @param threshold - Similarity threshold (0-1)
   * @returns Array of detected similar code duplications
   */
  detectSimilarCode(asts: AST[], threshold: number): Duplication[] {
    if (!asts || asts.length < 2) {
      return [];
    }

    // Set threshold for similarity calculator
    this.similarityCalculator.setThreshold(threshold);

    const duplications: Duplication[] = [];
    const processedPairs = new Set<string>();

    // Compare each AST with every other AST
    for (let i = 0; i < asts.length; i++) {
      for (let j = i + 1; j < asts.length; j++) {
        const ast1 = asts[i];
        const ast2 = asts[j];

        // Skip if already processed this pair
        const pairKey = `${ast1.sourceFile}:${ast2.sourceFile}`;
        if (processedPairs.has(pairKey)) {
          continue;
        }
        processedPairs.add(pairKey);

        // Calculate similarity between the two ASTs
        const similarityScore = this.similarityCalculator.calculateSimilarity(ast1, ast2);

        // If similarity is above threshold but not exactly 1.0 (exact duplicates are handled separately)
        if (similarityScore.score >= threshold && similarityScore.score < 1.0) {
          // Extract code from both ASTs
          const code1 = this.extractCodeFromAST(ast1);
          const code2 = this.extractCodeFromAST(ast2);

          // Create code instances
          const instance1: CodeInstance = {
            file: ast1.sourceFile,
            startLine: ast1.root.position.line,
            endLine: this.findEndLine(ast1.root),
            code: code1,
            hash: generateHash(code1)
          };

          const instance2: CodeInstance = {
            file: ast2.sourceFile,
            startLine: ast2.root.position.line,
            endLine: this.findEndLine(ast2.root),
            code: code2,
            hash: generateHash(code2)
          };

          // Create duplication entry
          duplications.push({
            id: uuidv4(),
            type: DuplicationType.SIMILAR,
            similarity: similarityScore,
            instances: [instance1, instance2]
          });
        }
      }
    }

    return duplications;
  }

  /**
   * Extract code representation from AST
   * @param ast - The AST to extract code from
   * @returns String representation of the code
   */
  private extractCodeFromAST(ast: AST): string {
    // In a real implementation, this would reconstruct the code from the AST
    // For simplicity, we'll assume the AST has a reference to the original code
    // This is a placeholder that should be replaced with actual code extraction
    return `Code from ${ast.sourceFile} with ${ast.nodeCount} nodes`;
  }

  /**
   * Find the end line of an AST node
   * @param node - The AST node
   * @returns The end line number
   */
  private findEndLine(node: ASTNode): number {
    let maxLine = node.position.line;

    const traverse = (n: ASTNode) => {
      if (n.position && n.position.line > maxLine) {
        maxLine = n.position.line;
      }
      if (n.children) {
        for (const child of n.children) {
          traverse(child);
        }
      }
    };

    traverse(node);
    return maxLine;
  }
}
