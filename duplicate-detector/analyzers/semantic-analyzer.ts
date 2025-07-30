// Semantic duplication analysis

import {
  FunctionNode,
  LogicPattern,
  PatternGroup,
  ClassNode
} from '../types/index.js';

import {
  PatternExtractor,
  PatternCategorizer,
  PatternGrouper,
  ClassAnalyzer
} from './semantic/index.js';

export interface SemanticAnalyzer {
  detectSimilarLogic(functions: FunctionNode[]): LogicPattern[];
  groupPatterns(patterns: LogicPattern[]): PatternGroup[];
  extractLogicPattern(functionNode: FunctionNode): LogicPattern;
  analyzeClassPatterns(classes: ClassNode[]): PatternGroup[];
}

/**
 * Default implementation of the semantic analyzer
 * Detects similar logic patterns across functions and classes
 */
export class DefaultSemanticAnalyzer implements SemanticAnalyzer {
  private readonly patternExtractor: PatternExtractor;
  private readonly patternCategorizer: PatternCategorizer;
  private readonly patternGrouper: PatternGrouper;
  private readonly classAnalyzer: ClassAnalyzer;
  private readonly MIN_COMPLEXITY_THRESHOLD = 3;

  constructor(similarityThreshold: number = 0.7) {
    this.patternExtractor = new PatternExtractor();
    this.patternCategorizer = new PatternCategorizer();
    this.patternGrouper = new PatternGrouper(similarityThreshold);
    this.classAnalyzer = new ClassAnalyzer(similarityThreshold);
  }

  /**
   * Detects similar logic patterns across multiple functions
   * @param functions - Array of function nodes to analyze
   * @returns Array of detected logic patterns
   */
  detectSimilarLogic(functions: FunctionNode[]): LogicPattern[] {
    if (!functions || functions.length === 0) {
      return [];
    }

    const patterns: LogicPattern[] = [];
    const processedFunctions = new Set<string>();

    for (const func of functions) {
      const functionId = this.getFunctionId(func);

      if (processedFunctions.has(functionId)) {
        continue;
      }

      const pattern = this.extractLogicPattern(func);

      // Only include patterns with sufficient complexity
      if (pattern.complexity >= this.MIN_COMPLEXITY_THRESHOLD) {
        patterns.push(pattern);
        processedFunctions.add(functionId);
      }
    }

    return patterns;
  }

  /**
   * Groups similar logic patterns together
   * @param patterns - Array of logic patterns to group
   * @returns Array of pattern groups
   */
  groupPatterns(patterns: LogicPattern[]): PatternGroup[] {
    if (!patterns || patterns.length === 0) {
      return [];
    }

    // First, categorize patterns
    const categorizedPatterns = this.patternCategorizer.categorizePatterns(patterns);

    // Then, group similar patterns within each category
    return this.patternGrouper.groupPatterns(patterns, categorizedPatterns);
  }

  /**
   * Extracts logic pattern from a function node
   * @param functionNode - Function node to analyze
   * @returns Logic pattern representing the function's structure
   */
  extractLogicPattern(functionNode: FunctionNode): LogicPattern {
    return this.patternExtractor.extractLogicPattern(functionNode);
  }

  /**
   * Analyzes patterns in classes to detect similar implementations
   * @param classes - Array of class nodes to analyze
   * @returns Array of pattern groups representing similar class patterns
   */
  analyzeClassPatterns(classes: ClassNode[]): PatternGroup[] {
    if (!classes || classes.length === 0) {
      return [];
    }

    const allMethods: FunctionNode[] = [];

    // Extract all methods from all classes
    for (const classNode of classes) {
      for (const method of classNode.methods) {
        allMethods.push(method);
      }
    }

    // Detect similar logic in methods
    const patterns = this.detectSimilarLogic(allMethods);

    // Group similar patterns
    const groups = this.groupPatterns(patterns);

    // Enhance groups with class information
    return this.classAnalyzer.enhanceGroupsWithClassInfo(classes, groups);
  }

  /**
   * Gets a unique identifier for a function
   */
  private getFunctionId(func: FunctionNode): string {
    return `${func.name}:${func.parameters.length}:${func.isAsync}`;
  }
}
