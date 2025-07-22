// Pattern extraction module for semantic analyzer

import { FunctionNode, ASTNode, LogicPattern } from '../../types';

/**
 * Extracts logic patterns from function nodes
 */
export class PatternExtractor {
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
}
