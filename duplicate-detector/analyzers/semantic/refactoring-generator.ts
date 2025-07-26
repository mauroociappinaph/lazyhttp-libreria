// Refactoring suggestion generator for semantic analyzer

import { LogicPattern, RefactoringSuggestion } from '../../types';

/**
 * Generates refactoring suggestions for similar patterns
 */
export class RefactoringGenerator {
  /**
   * Generates refactoring suggestions for similar patterns
   */
  generateRefactoringSuggestion(patterns: LogicPattern[], category: string): RefactoringSuggestion {
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
}
