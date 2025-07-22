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

export interface ValidationRule {
  validate: (value: unknown, field: string) => ConfigValidationError | null;
  warn?: (value: unknown, field: string) => ConfigValidationWarning | null;
}

export class ConfigValidator {

  /**
   * Validates a numeric value within a specified range
   */
  private validateNumericRange(
    value: unknown,
    field: string,
    min: number,
    max: number,
    errors: ConfigValidationError[]
  ): boolean {
    if (typeof value !== 'number') {
      errors.push({ field, message: 'Must be a number', value });
      return false;
    }
    if (value < min || value > max) {
      errors.push({ field, message: `Must be between ${min} and ${max}`, value });
      return false;
    }
    return true;
  }

  /**
   * Validates a positive number
   */
  private validatePositiveNumber(
    value: unknown,
    field: string,
    errors: ConfigValidationError[]
  ): boolean {
    if (typeof value !== 'number' || value < 1) {
      errors.push({ field, message: 'Must be a positive number', value });
      return false;
    }
    return true;
  }

  /**
   * Validates an array type
   */
  private validateArray(
    value: unknown,
    field: string,
    errors: ConfigValidationError[]
  ): boolean {
    if (!Array.isArray(value)) {
      errors.push({ field, message: 'Must be an array of strings', value });
      return false;
    }
    return true;
  }

  /**
   * Adds a warning if condition is met
   */
  private addWarningIf(
    condition: boolean,
    field: string,
    message: string,
    suggestion: string,
    warnings: ConfigValidationWarning[]
  ): void {
    if (condition) {
      warnings.push({ field, message, suggestion });
    }
  }

  validate(config: Partial<DetectionConfig>): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    const validators = [
      { key: 'thresholds', data: config.thresholds, validator: this.validateThresholds },
      { key: 'filters', data: config.filters, validator: this.validateFilters },
      { key: 'analysis', data: config.analysis, validator: this.validateAnalysis },
      { key: 'output', data: config.output, validator: this.validateOutput }
    ];

    validators.forEach(({ data, validator }) => {
      if (data) {
        validator.call(this, data, errors, warnings);
      }
    });

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
    const validateThreshold = (name: string, value: unknown) => {
      const field = `thresholds.${name}`;
      if (this.validateNumericRange(value, field, 0, 1, errors)) {
        this.addWarningIf(
          typeof value === 'number' && value < 0.5,
          field,
          'Very low threshold may produce too many false positives',
          'Consider using a threshold >= 0.5',
          warnings
        );
      }
    };

    const thresholdEntries = [
      ['syntactic', thresholds.syntactic],
      ['semantic', thresholds.semantic],
      ['structural', thresholds.structural]
    ] as const;

    thresholdEntries.forEach(([name, value]) => {
      if (value !== undefined) {
        validateThreshold(name, value);
      }
    });
  }

  private validateFilters(
    filters: Partial<DetectionConfig['filters']>,
    errors: ConfigValidationError[],
    warnings: ConfigValidationWarning[]
  ): void {
    if (filters.minLines !== undefined) {
      if (this.validatePositiveNumber(filters.minLines, 'filters.minLines', errors)) {
        this.addWarningIf(
          typeof filters.minLines === 'number' && filters.minLines > 50,
          'filters.minLines',
          'Very high minimum lines may miss smaller duplications',
          'Consider using a value between 3-20',
          warnings
        );
      }
    }

    if (filters.minTokens !== undefined) {
      this.validatePositiveNumber(filters.minTokens, 'filters.minTokens', errors);
    }

    if (filters.excludePatterns !== undefined) {
      this.validateArray(filters.excludePatterns, 'filters.excludePatterns', errors);
    }

    if (filters.includePatterns !== undefined) {
      this.validateArray(filters.includePatterns, 'filters.includePatterns', errors);
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
    errors: ConfigValidationError[]
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
      includePatterns: userConfig.filters?.includePatterns ?? DEFAULT_CONFIG.filters.includePatterns
    },
    analysis: {
      ...DEFAULT_CONFIG.analysis,
      ...userConfig.analysis
    },
    output: {
      ...DEFAULT_CONFIG.output,
      ...userConfig.output
    }
  };
}

/**
 * Creates a configuration with safe defaults for missing values
 * @param config - Potentially incomplete configuration
 * @returns Complete configuration with all required fields
 */
export function ensureCompleteConfig(config: Partial<DetectionConfig>): DetectionConfig {
  const merged = mergeConfig(config);

  // Validate that all required fields are present
  const requiredFields = ['thresholds', 'filters', 'analysis', 'output'] as const;
  const missingFields = requiredFields.filter(field => !merged[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }

  return merged;
}

export function loadConfigFromFile(filePath: string): Promise<DetectionConfig> {
  // This will be implemented in a later task
  return Promise.reject(new Error(`loadConfigFromFile not yet implemented for: ${filePath}`));
}

export function validateAndMergeConfig(userConfig: Partial<DetectionConfig>): DetectionConfig {
  const validator = new ConfigValidator();
  const validation = validator.validate(userConfig);

  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`);
    throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
  }

  // Log warnings if any exist
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  ${warning.field}: ${warning.message} (${warning.suggestion})`);
    });
  }

  return mergeConfig(userConfig);
}
