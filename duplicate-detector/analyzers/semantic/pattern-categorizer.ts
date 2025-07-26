// Pattern categorization module for semantic analyzer

import { LogicPattern } from '../../types';

/**
 * Categorizes logic patterns into functional categories
 */
export class PatternCategorizer {
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
   * Categorizes patterns into functional categories
   * @param patterns - Array of logic patterns to categorize
   * @returns Object mapping categories to arrays of patterns
   */
  categorizePatterns(patterns: LogicPattern[]): Record<string, LogicPattern[]> {
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
  determinePatternCategory(pattern: LogicPattern): string {
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
}
