// Configuration management for duplicate code detection

import { DetectionConfig } from '../types';

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  field: string;
  message: string;
  value: unknown;
}

export interface ConfigValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export class ConfigValidator {
  validate(config: Partial<DetectionConfig>): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    // Validate thresholds
    if (config.thresholds) {
      this.validateThresholds(config.thresholds, errors, warnings);
    }

    // Validate filters
    if (config.filters) {
      this.validateFilters(config.filters, errors, warnings);
    }

    // Validate analysis settings
    if (config.analysis) {
      this.validateAnalysis(config.analysis, errors, warnings);
    }

    // Validate output settings
    if (config.output) {
      this.validateOutput(config.output, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateThresholds(
    thresholds: Partial<DetectionConfig['thresholds']>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    const validateThreshold = (name: string, value: number) => {
      if (typeof value !== 'number') {
        errors.push({
          field: `thresholds.${name}`,
          message: 'Must be a number',
          value
        });
      } else if (value < 0 || value > 1) {
        errors.push({
          field: `thresholds.${name}`,
          message: 'Must be between 0 and 1',
          value
        });
      } else if (value < 0.5) {
        warnings.push({
          field: `thresholds.${name}`,
          message: 'Very low threshold may produce too many false positives',
          suggestion: 'Consider using a threshold >= 0.5'
        });
      }
    };

    if (thresholds.syntactic !== undefined) {
      validateThreshold('syntactic', thresholds.syntactic);
    }
    if (thresholds.semantic !== undefined) {
      validateThreshold('semantic', thresholds.semantic);
    }
    if (thresholds.structural !== undefined) {
      validateThreshold('structural', thresholds.structural);
    }
  }

  private validateFilters(
    filters: Partial<DetectionConfig['filters']>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (filters.minLines !== undefined) {
      if (typeof filters.minLines !== 'number' || filters.minLines < 1) {
        errors.push({
          field: 'filters.minLines',
          message: 'Must be a positive number',
          value: filters.minLines
        });
      } else if (filters.minLines > 50) {
        warnings.push({
          field: 'filters.minLines',
          message: 'Very high minimum lines may miss smaller duplications',
          suggestion: 'Consider using a value between 3-20'
        });
      }
    }

    if (filters.minTokens !== undefined) {
      if (typeof filters.minTokens !== 'number' || filters.minTokens < 1) {
        errors.push({
          field: 'filters.minTokens',
          message: 'Must be a positive number',
          value: filters.minTokens
        });
      }
    }

    if (filters.excludePatterns !== undefined) {
      if (!Array.isArray(filters.excludePatterns)) {
        errors.push({
          field: 'filters.excludePatterns',
          message: 'Must be an array of strings',
          value: filters.excludePatterns
        });
      }
    }

    if (filters.includePatterns !== undefined) {
      if (!Array.isArray(filters.includePatterns)) {
        errors.push({
          field: 'filters.includePatterns',
          message: 'Must be an array of strings',
          value: filters.includePatterns
        });
      }
    }
  }

  private validateAnalysis(
    analysis: Partial<DetectionConfig['analysis']>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (analysis.maxFileSize !== undefined) {
      if (typeof analysis.maxFileSize !== 'number' || analysis.maxFileSize < 1) {
        errors.push({
          field: 'analysis.maxFileSize',
          message: 'Must be a positive number',
          value: analysis.maxFileSize
        });
      } else if (analysis.maxFileSize > 10 * 1024 * 1024) { // 10MB
        warnings.push({
          field: 'analysis.maxFileSize',
          message: 'Very large file size limit may impact performance',
          suggestion: 'Consider using a limit under 10MB'
        });
      }
    }

    if (analysis.concurrency !== undefined) {
      if (typeof analysis.concurrency !== 'number' || analysis.concurrency < 1) {
        errors.push({
          field: 'analysis.concurrency',
          message: 'Must be a positive number',
          value: analysis.concurrency
        });
      } else if (analysis.concurrency > 16) {
        warnings.push({
          field: 'analysis.concurrency',
          message: 'Very high concurrency may not improve performance',
          suggestion: 'Consider using a value between 2-8'
        });
      }
    }
  }

  private validateOutput(
    output: Partial<DetectionConfig['output']>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (output.format !== undefined) {
      const validFormats = ['json', 'html', 'markdown'];
      if (!validFormats.includes(output.format)) {
        errors.push({
          field: 'output.format',
          message: `Must be one of: ${validFormats.join(', ')}`,
          value: output.format
        });
      }
    }
  }
}

export const DEFAULT_CONFIG: DetectionConfig = {
  thresholds: {
    syntactic: 0.95,
    semantic: 0.80,
    structural: 0.75
  },
  filters: {
    minLines: 3,
    minTokens: 10,
    excludePatterns: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.d.ts'
    ],
    includePatterns: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx'
    ]
  },
  analysis: {
    enableSemanticAnalysis: true,
    enablePatternDetection: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    concurrency: 4
  },
  output: {
    format: 'json',
    includeCode: true,
    groupSimilar: true
  }
};

/**
 * Deeply merges user configuration with default configuration
 * @param userConfig - Partial user configuration
 * @returns Complete configuration with user overrides
 */
export function mergeConfig(userConfig: Partial<DetectionConfig>): DetectionConfig {
  return {
    thresholds: {
      ...DEFAULT_CONFIG.thresholds,
      ...userConfig.thresholds
    },
    filters: {
      ...DEFAULT_CONFIG.filters,
      ...userConfig.filters,
      // Handle array merging properly
      excludePatterns: userConfig.filters?.excludePatterns ?? DEFAULT_CONFIG.filters.excludePatterns,
      ...userConfig.output
    }
  };
}

export function loadConfigFromFile(_filePath: string): Promise<DetectionConfig> {
  // This will be implemented in a later task
  return Promise.reject(new Error('loadConfigFromFile not yet implemented'));
}

export function validateAndMergeConfig(userConfig: Partial<DetectionConfig>): DetectionConfig {
  const validator = new ConfigValidator();
  const validation = validator.validate(userConfig);

  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`);
    throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
  }

  return mergeConfig(userConfig);
}
