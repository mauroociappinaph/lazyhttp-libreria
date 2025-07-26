// Similarity calculation module for semantic analyzer

import { LogicPattern } from '../../types';

/**
 * Calculates similarity between logic patterns
 */
export class SimilarityCalculator {
  /**
   * Calculates similarity between two logic patterns
   */
  calculatePatternSimilarity(pattern1: LogicPattern, pattern2: LogicPattern): number {
    // Signature similarity (exact match)
    const signatureSimilarity = pattern1.signature === pattern2.signature ? 1.0 : 0.0;

    // Operations similarity
    const operationsSimilarity = this.calculateArraySimilarity(pattern1.operations, pattern2.operations);

    // Control flow similarity
    const controlFlowSimilarity = this.calculateArraySimilarity(pattern1.controlFlow, pattern2.controlFlow);

    // Complexity similarity
    const complexityDiff = Math.abs(pattern1.complexity - pattern2.complexity);
    const maxComplexity = Math.max(pattern1.complexity, pattern2.complexity);
    const complexitySimilarity = maxComplexity > 0 ? 1 - (complexityDiff / maxComplexity) : 1.0;

    // Weighted average
    return (
      signatureSimilarity * 0.4 +
      operationsSimilarity * 0.3 +
      controlFlowSimilarity * 0.2 +
      complexitySimilarity * 0.1
    );
  }

  /**
   * Calculates similarity between two arrays of strings
   */
  calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) {
      return 1.0;
    }

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0.0;
  }

  /**
   * Calculates overall similarity for a group of patterns
   */
  calculateGroupSimilarity(patterns: LogicPattern[]): number {
    if (patterns.length <= 1) {
      return 1.0;
    }

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        totalSimilarity += this.calculatePatternSimilarity(patterns[i], patterns[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0.0;
  }
}
