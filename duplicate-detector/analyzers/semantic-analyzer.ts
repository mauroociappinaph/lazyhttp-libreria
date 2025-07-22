// Semantic duplication analysis

import { v4 as uuidv4 } from 'uuid';
import {
  FunctionNode,
  LogicPattern,
  PatternGroup,
  ASTNode,
  RefactoringSuggestion,
  ClassNode
} from '../types';

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
  private readonly SIMILARITY_THRESHOLD = 0.7;
  private readonly MIN_COMPLEXITY_THRESHOLD = 3;
  private readonly PATTERN_CATEGORIES = [
    'data-processing',
    'api-interaction',
    'error-handling',
    'ui-rendering',
    'state-management',
    'calculation',
    'validation',
    'transformation'
  ];

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

    const groups: PatternGroup[] = [];
    const processedPatterns = new Set<string>();

    // First, categorize patterns
    const categorizedPatterns = this.categorizePatterns(patterns);

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

          const similarity = this.calculatePatternSimilarity(pattern, otherPattern);

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
            similarity: this.calculateGroupSimilarity(similarPatterns),
            refactoringSuggestion: this.generateRefactoringSuggestion(similarPatterns, category)
          };

          groups.push(group);
        }
      }
    }

    return groups;
  }

  /**
   * Extracts logic pattern from a function node
   * @param functionNode - Function node to analyze
   * @returns Logic pattern representing the function's structure
   */
  extractLogicPattern(functionNode: FunctionNode): LogicPattern {
    const operations: string[] = [];
    const controlFlow: string[] = [];
    let complexity = 1; // Base complexity

    // Analyze function body
    this.analyzeNodeRecursively(functionNode.body, operations, controlFlow, (c) => complexity += c);

    // Create signature based on function characteristics
    const signature = this.createPatternSignature(functionNode, operations, controlFlow);

    return {
      signature,
      complexity,
      operations: this.normalizeOperations(operations),
      controlFlow: this.normalizeControlFlow(controlFlow)
    };
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
    const methodToClassMap = new Map<string, ClassNode>();

    // Extract all methods from all classes
    for (const classNode of classes) {
      for (const method of classNode.methods) {
        allMethods.push(method);
        methodToClassMap.set(this.getFunctionId(method), classNode);
      }
    }

    // Detect similar logic in methods
    const patterns = this.detectSimilarLogic(allMethods);

    // Group similar patterns
    const groups = this.groupPatterns(patterns);

    // Enhance groups with class information
    for (const group of groups) {
      // Populate instances with the actual function nodes
      group.instances = allMethods.filter(method => {
        const pattern = this.extractLogicPattern(method);
        return this.calculatePatternSimilarity(pattern, group.pattern) >= this.SIMILARITY_THRESHOLD;
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

        // If methods from multiple classes haveilar patterns, suggest abstraction
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
   * Categorizes patterns into functional categories
   * @param patterns - Array of logic patterns to categorize
   * @returns Object mapping categories to arrays of patterns
   */
  private categorizePatterns(patterns: LogicPattern[]): Record<string, LogicPattern[]> {
    const categorized: Record<string, LogicPattern[]> = {};

    // Initialize categories
    for (const category of this.PATTERN_CATEGORIES) {
      categorized[category] = [];
    }

    // Add "other" category for patterns that don't fit elsewhere
    categorized['other'] = [];

    for (const pattern of patterns) {
      const category = this.determinePatternCategory(pattern);
      categorized[category].push(pattern);
    }

    return categorized;
  }

  /**
   * Determines the functional category of a pattern
   * @param pattern - Logic pattern to categorize
   * @returns Category name
   */
  private determinePatternCategory(pattern: LogicPattern): string {
    const { operations, controlFlow } = pattern;

    // API interaction patterns
    if (
      operations.includes('async-await') ||
      operations.includes('function-call') &&
      (operations.includes('promise') || pattern.signature.includes('async'))
    ) {
      return 'api-interaction';
    }

    // Error handling patterns
    if (
      controlFlow.includes('exception-handling') ||
      operations.includes('throw')
    ) {
      return 'error-handling';
    }

    // Data processing patterns
    if (
      controlFlow.includes('loop') &&
      (operations.includes('array-creation') || operations.includes('object-creation'))
    ) {
      return 'data-processing';
    }

    // UI rendering patterns
    if (
      operations.includes('jsx-element') ||
      operations.includes('dom-manipulation')
    ) {
      return 'ui-rendering';
    }

    // State management patterns
    if (
      operations.includes('state-update') ||
      operations.includes('store-dispatch')
    ) {
      return 'state-management';
    }

    // Calculation patterns
    if (
      operations.includes('binary-operation') &&
      !controlFlow.includes('loop')
    ) {
      return 'calculation';
    }

    // Validation patterns
    if (
      controlFlow.includes('conditional') &&
      (operations.includes('return') || operations.includes('throw'))
    ) {
      return 'validation';
    }

    // Transformation patterns
    if (
      operations.includes('assignment') &&
      operations.includes('binary-operation')
    ) {
      return 'transformation';
    }

    // Default to "other" if no specific category matches
    return 'other';
  }

  /**
   * Analyzes AST nodes recursively to extract operations and control flow
   */
  private analyzeNodeRecursively(
    nodes: ASTNode[],
    operations: string[],
    controlFlow: string[],
    addComplexity: (complexity: number) => void
  ): void {
    for (const node of nodes) {
      this.analyzeNode(node, operations, controlFlow, addComplexity);

      if (node.children && node.children.length > 0) {
        this.analyzeNodeRecursively(node.children, operations, controlFlow, addComplexity);
      }
    }
  }

  /**
   * Analyzes a single AST node
   */
  private analyzeNode(
    node: ASTNode,
    operations: string[],
    controlFlow: string[],
    addComplexity: (complexity: number) => void
  ): void {
    switch (node.type) {
      // Control flow structures
      case 'IfStatement':
        controlFlow.push('conditional');
        addComplexity(1);
        break;
      case 'ForStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
      case 'ForOfStatement':
      case 'ForInStatement':
        controlFlow.push('loop');
        addComplexity(2);
        break;
      case 'SwitchStatement':
        controlFlow.push('switch');
        addComplexity(1);
        break;
      case 'TryStatement':
        controlFlow.push('exception-handling');
        addComplexity(1);
        break;

      // Operations
      case 'CallExpression':
        operations.push('function-call');
        break;
      case 'AssignmentExpression':
        operations.push('assignment');
        break;
      case 'BinaryExpression':
        operations.push('binary-operation');
        break;
      case 'UnaryExpression':
        operations.push('unary-operation');
        break;
      case 'ArrayExpression':
        operations.push('array-creation');
        break;
      case 'ObjectExpression':
        operations.push('object-creation');
        break;
      case 'ReturnStatement':
        operations.push('return');
        break;
      case 'ThrowStatement':
        operations.push('throw');
        break;

      // Async operations
      case 'AwaitExpression':
        operations.push('async-await');
        addComplexity(1);
        break;
      case 'PromiseExpression':
      case 'ThenExpression':
        operations.push('promise');
        addComplexity(1);
        break;

      // React/UI specific
      case 'JSXElement':
        operations.push('jsx-element');
        break;
      case 'DOMManipulation':
        operations.push('dom-manipulation');
        break;

      // State management
      case 'StateUpdate':
        operations.push('state-update');
        break;
      case 'StoreDispatch':
        operations.push('store-dispatch');
        break;

      default:
        // Generic node processing
        if (node.value !== undefined) {
          operations.push('literal');
        }
        break;
    }
  }

  /**
   * Creates a pattern signature based on function characteristics
   */
  private createPatternSignature(
    functionNode: FunctionNode,
    operations: string[],
    controlFlow: string[]
  ): string {
    const paramCount = functionNode.parameters.length;
    const isAsync = functionNode.isAsync;
    const hasReturn = functionNode.returnType !== undefined;

    const operationSummary = this.summarizeArray(operations);
    const controlFlowSummary = this.summarizeArray(controlFlow);

    return `fn(${paramCount}):${isAsync ? 'async' : 'sync'}:${hasReturn ? 'return' : 'void'}:ops[${operationSummary}]:cf[${controlFlowSummary}]`;
  }

  /**
   * Summarizes an array of strings into a compact representation
   */
  private summarizeArray(items: string[]): string {
    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([item, count]) => `${item}:${count}`)
      .join(',');
  }

  /**
   * Normalizes operations array by removing duplicates and sorting
   */
  private normalizeOperations(operations: string[]): string[] {
    return Array.from(new Set(operations)).sort();
  }

  /**
   * Normalizes control flow array by removing duplicates and sorting
   */
  private normalizeControlFlow(controlFlow: string[]): string[] {
    return Array.from(new Set(controlFlow)).sort();
  }

  /**
   * Calculates similarity between two logic patterns
   */
  private calculatePatternSimilarity(pattern1: LogicPattern, pattern2: LogicPattern): number {
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
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
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

  /**
   * Calculates overall similarity for a group of patterns
   */
  private calculateGroupSimilarity(patterns: LogicPattern[]): number {
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

  /**
   * Generates refactoring suggestions for similar patterns
   */
  private generateRefactoringSuggestion(patterns: LogicPattern[], category: string): RefactoringSuggestion {
    const hasComplexLogic = patterns.some(p => p.complexity > 5);
    const hasCommonOperations = patterns.some(p => p.operations.length > 3);
    const hasLoops = patterns.some(p => p.controlFlow.includes('loop'));
    const hasConditionals = patterns.some(p => p.controlFlow.includes('conditional'));
    const hasAsyncOperations = patterns.some(p => p.operations.includes('async-await') || p.operations.includes('promise'));

    // Category-specific suggestions
    switch (category) {
      case 'api-interaction':
        return {
          type: 'extract-function',
          description: 'Extract API interaction logic into a reusable service',
          estimatedEffort: 'medium',
          benefits: [
            'Centralizes API communication',
            'Improves error handling consistency',
            'Makes testing easier with mocks',
            'Simplifies future API changes'
          ],
          codeExample: `class ApiService {\n  async fetch${hasConditionals ? 'WithValidation' : ''}(endpoint) {\n    try {\n      const response = await fetch(endpoint);\n      return await response.json();\n    } catch (error) {\n      this.handleError(error);\n    }\n  }\n}`
        };

      case 'data-processing':
        return {
          type: 'extract-function',
          description: 'Extract data processing logic into utility functions',
          estimatedEffort: 'low',
          benefits: [
            'Improves code reusability',
            'Makes data transformations consistent',
            'Simplifies testing of transformation logic',
            'Reduces duplication in data handling code'
          ],
          codeExample: `function process${hasLoops ? 'Collection' : 'Item'}(data) {\n  ${hasLoops ? '  return data.map(item => {\n    // Processing logic\n  });' : '  // Processing logic\n  return transformedData;'}\n}`
        };

      case 'error-handling':
        return {
          type: 'extract-function',
          description: 'Standardize error handling with a centralized error processor',
          estimatedEffort: 'medium',
          benefits: [
            'Consistent error handling across the application',
            'Centralized error logging and reporting',
            'Easier to implement global error policies',
            'Improves user experience with standardized error messages'
          ],
          codeExample: `function handleError(error, context = {}) {\n  // Standardized error handling\n  logger.error(error, context);\n  return { error: error.message, code: error.code || 'UNKNOWN_ERROR' };\n}`
        };

      case 'ui-rendering':
        return {
          type: 'extract-function',
          description: 'Create reusable UI components for common rendering patterns',
          estimatedEffort: 'medium',
          benefits: [
            'Consistent UI appearance',
            'Reduced duplication in UI code',
            'Easier maintenance of design system',
            'Better component reusability'
          ],
          codeExample: `function Render${hasConditionals ? 'Conditional' : ''}Component(props) {\n  ${hasConditionals ? 'if (condition) {\n    return <ComponentA {...props} />;\n  }\n  return <ComponentB {...props} />;' : 'return <StyledComponent {...props} />;\n'}\n}`
        };

      default:
        // Default suggestions based on pattern characteristics
        if (hasComplexLogic && hasCommonOperations) {
          return {
            type: 'extract-function',
            description: 'Extract common logic into a reusable function to reduce duplication',
            estimatedEffort: 'medium',
            benefits: [
              'Reduces code duplication',
              'Improves maintainability',
              'Centralizes logic for easier updates',
              'Reduces potential for bugs'
            ],
            codeExample: `function extracted${hasAsyncOperations ? 'Async' : ''}Logic(params) {\n  ${hasAsyncOperations ? 'try {\n    // Common async logic\n  } catch (error) {\n    // Error handling\n  }' : '  // Common logic'}\n}`
          };
        } else if (hasCommonOperations) {
          return {
            type: 'extract-interface',
            description: 'Define a common interface to standardize similar implementations',
            estimatedEffort: 'low',
            benefits: [
              'Standardizes implementation patterns',
              'Improves code consistency',
              'Facilitates future refactoring'
            ]
          };
        } else {
          return {
            type: 'use-composition',
            description: 'Consider using composition to share common behavior',
            estimatedEffort: 'high',
            benefits: [
              'Promotes code reuse',
              'Improves modularity',
              'Reduces coupling'
            ]
          };
        }
    }
  }

  /**
   * Gets a unique identifier for a function
   */
  private getFunctionId(func: FunctionNode): string {
    return `${func.name}:${func.parameters.length}:${func.isAsync}`;
  }
}
