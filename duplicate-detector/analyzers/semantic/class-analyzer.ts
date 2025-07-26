// Class analysis module for semantic analyzer

import { ClassNode, FunctionNode, PatternGroup } from '../../types';
import { PatternExtractor } from './pattern-extractor';
import { SimilarityCalculator } from './similarity-calculator';

/**
 * Analyzes patterns in classes to detect similar implementations
 */
export class ClassAnalyzer {
  private readonly patternExtractor: PatternExtractor;
  private readonly similarityCalculator: SimilarityCalculator;
  private readonly SIMILARITY_THRESHOLD: number;

  constructor(similarityThreshold: number = 0.7) {
    this.SIMILARITY_THRESHOLD = similarityThreshold;
    this.patternExtractor = new PatternExtractor();
    this.similarityCalculator = new SimilarityCalculator();
  }

  /**
   * Analyzes patterns in classes to detect similar implementations
   * @param classes - Array of class nodes to analyze
   * @param groups - Existing pattern groups
   * @returns Enhanced pattern groups with class information
   */
  enhanceGroupsWithClassInfo(classes: ClassNode[], groups: PatternGroup[]): PatternGroup[] {
    if (!classes || classes.length === 0 || !groups || groups.length === 0) {
      return groups;
    }

    const allMethods: FunctionNode[] = [];
    const methodToClassMap = new Map<string, ClassNode>();

    // Extract all methods from all classes
    for (const classNode of classes) {
      for (const method of classNode.methods) {
        allMethods.push(method);
        methodToClassMap.set(this.getFunctionId(method), classNode);
      }
    }

    // Enhance groups with class information
    for (const group of groups) {
      // Populate instances with the actual function nodes
      group.instances = allMethods.filter(method => {
        const pattern = this.patternExtractor.extractLogicPattern(method);
        return this.similarityCalculator.calculatePatternSimilarity(pattern, group.pattern) >= this.SIMILARITY_THRESHOLD;
      });

      // Add class-specific refactoring suggestions
      if (group.instances.length > 1) {
        const classesInvolved = new Set<string>();

        for (const method of group.instances) {
          const classNode = methodToClassMap.get(this.getFunctionId(method));
          if (classNode) {
            classesInvolved.add(classNode.name);
          }
        }

        // If methods from multiple classes have similar patterns, suggest abstraction
        if (classesInvolved.size > 1) {
          group.refactoringSuggestion = {
            type: 'create-abstract-class',
            description: 'Extract common behavior into an abstract class or interface',
            estimatedEffort: 'high',
            benefits: [
              'Standardizes implementation across classes',
              'Reduces code duplication',
              'Improves maintainability',
              'Enforces consistent behavior'
            ],
            codeExample: `abstract class Base${group.pattern.controlFlow.join('')}Handler {\n  abstract handle${group.pattern.operations.join('')}(): void;\n}`
          };
        }
      }
    }

    return groups;
  }

  /**
   * Gets a unique identifier for a function
   */
  private getFunctionId(func: FunctionNode): string {
    return `${func.name}:${func.parameters.length}:${func.isAsync}`;
  }
}
