// Pattern grouping module for semantic analyzer

import { v4 as uuidv4 } from 'uuid';
import { LogicPattern, PatternGroup } from '../../types';
import { SimilarityCalculator } from './similarity-calculator';
import { RefactoringGenerator } from './refactoring-generator';

/**
 * Groups similar patterns together
 */
export class PatternGrouper {
  private readonly similarityCalculator: SimilarityCalculator;
  private readonly refactoringGenerator: RefactoringGenerator;
  private readonly SIMILARITY_THRESHOLD: number;

  constructor(similarityThreshold: number = 0.7) {
    this.SIMILARITY_THRESHOLD = similarityThreshold;
    this.similarityCalculator = new SimilarityCalculator();
    this.refactoringGenerator = new RefactoringGenerator();
  }

  /**
   * Groups similar patterns together
   * @param patterns - Array of logic patterns to group
   * @param categorizedPatterns - Patterns categorized by function
   * @returns Array of pattern groups
   */
  groupPatterns(
    patterns: LogicPattern[],
    categorizedPatterns: Record<string, LogicPattern[]>
  ): PatternGroup[] {
    if (!patterns || patterns.length === 0) {
      return [];
    }

    const groups: PatternGroup[] = [];
    const processedPatterns = new Set<string>();

    // Process each category separately to improve grouping accuracy
    for (const [category, categoryPatterns] of Object.entries(categorizedPatterns)) {
      if (categoryPatterns.length <= 1) {
        continue; // Skip categories with only one pattern
      }

      for (let i = 0; i < categoryPatterns.length; i++) {
        const pattern = categoryPatterns[i];

        if (processedPatterns.has(pattern.signature)) {
          continue;
        }

        const similarPatterns = [pattern];
        processedPatterns.add(pattern.signature);

        // Find similar patterns within the same category
        for (let j = i + 1; j < categoryPatterns.length; j++) {
          const otherPattern = categoryPatterns[j];

          if (processedPatterns.has(otherPattern.signature)) {
            continue;
          }

          const similarity = this.similarityCalculator.calculatePatternSimilarity(pattern, otherPattern);

          if (similarity >= this.SIMILARITY_THRESHOLD) {
            similarPatterns.push(otherPattern);
            processedPatterns.add(otherPattern.signature);
          }
        }

        // Only create groups with multiple similar patterns
        if (similarPatterns.length > 1) {
          const group: PatternGroup = {
            id: uuidv4(),
            pattern: this.mergePatterns(similarPatterns, category),
            instances: [], // Will be populated with actual function instances
            similarity: this.similarityCalculator.calculateGroupSimilarity(similarPatterns),
            refactoringSuggestion: this.refactoringGenerator.generateRefactoringSuggestion(similarPatterns, category)
          };

          groups.push(group);
        }
      }
    }

    return groups;
  }

  /**
   * Merges multiple similar patterns into a representative pattern
   */
  private mergePatterns(patterns: LogicPattern[], category: string): LogicPattern {
    if (patterns.length === 1) {
      return patterns[0];
    }

    // Use the first pattern as base and merge others
    const basePattern = patterns[0];
    const allOperations = new Set<string>();
    const allControlFlow = new Set<string>();
    let totalComplexity = 0;

    for (const pattern of patterns) {
      pattern.operations.forEach(op => allOperations.add(op));
      pattern.controlFlow.forEach(cf => allControlFlow.add(cf));
      totalComplexity += pattern.complexity;
    }

    return {
      signature: `merged:${category}:${patterns.length}:${basePattern.signature}`,
      complexity: Math.round(totalComplexity / patterns.length),
      operations: Array.from(allOperations).sort(),
      controlFlow: Array.from(allControlFlow).sort()
    };
  }
}
