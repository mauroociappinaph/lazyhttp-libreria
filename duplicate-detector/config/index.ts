// Configuration management for duplicate code detection

import { DetectionConfig, PartialDetectionConfig } from '../types';

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

// Validation constants
const VALIDATION_CONSTANTS = {
  THRESHOLD: {
    MIN: 0,
    MAX: 1,
    LOW_WARNING: 0.5
  },
  FILE_SIZE: {
    MAX_RECOMMENDED: 10 * 1024 * 1024, // 10MB
    DEFAULT: 5 * 1024 * 1024 // 5MB
  },
  CONCURRENCY: {
    MAX_RECOMMENDED: 16,
    DEFAULT: 4
  },
  MIN_LINES: {
    HIGH_WARNING: 50,
    DEFAULT: 3
  },
  MIN_TOKENS: {
    DEFAULT: 10
  }
} as const;

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

  validate(config: PartialDetectionConfig): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    if (config.thresholds) {
      this.validateThresholds(config.thresholds, errors, warnings);
    }

    if (config.filters) {
      this.validateFilters(config.filters, errors, warnings);
    }

    if (config.analysis) {
      this.validateAnalysis(config.analysis, errors, warnings);
    }

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
    const validateThreshold = (name: string, value: unknown) => {
      const field = `thresholds.${name}`;
      if (this.validateNumericRange(value, field, VALIDATION_CONSTANTS.THRESHOLD.MIN, VALIDATION_CONSTANTS.THRESHOLD.MAX, errors)) {
        this.addWarningIf(
          typeof value === 'number' && value < VALIDATION_CONSTANTS.THRESHOLD.LOW_WARNING,
          field,
          'Very low threshold may produce too many false positives',
          `Consider using a threshold >= ${VALIDATION_CONSTANTS.THRESHOLD.LOW_WARNING}`,
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
          typeof filters.minLines === 'number' && filters.minLines > VALIDATION_CONSTANTS.MIN_LINES.HIGH_WARNING,
          'filters.minLines',
          'Very high minimum lines may miss smaller duplications',
          `Consider using a value between ${VALIDATION_CONSTANTS.MIN_LINES.DEFAULT}-20`,
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
      if (this.validatePositiveNumber(analysis.maxFileSize, 'analysis.maxFileSize', errors)) {
        this.addWarningIf(
          typeof analysis.maxFileSize === 'number' && analysis.maxFileSize > VALIDATION_CONSTANTS.FILE_SIZE.MAX_RECOMMENDED,
          'analysis.maxFileSize',
          'Very large file size limit may impact performance',
          'Consider using a limit under 10MB',
          warnings
        );
      }
    }

    if (analysis.concurrency !== undefined) {
      if (this.validatePositiveNumber(analysis.concurrency, 'analysis.concurrency', errors)) {
        this.addWarningIf(
          typeof analysis.concurrency === 'number' && analysis.concurrency > VALIDATION_CONSTANTS.CONCURRENCY.MAX_RECOMMENDED,
          'analysis.concurrency',
          'Very high concurrency may not improve performance',
          'Consider using a value between 2-8',
          warnings
        );
      }
    }
  }

  private validateOutput(
    output: Partial<DetectionConfig['output']>,
    errors: ConfigValidationError[],
    _warnings: ConfigValidationWarning[]
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
    minLines: VALIDATION_CONSTANTS.MIN_LINES.DEFAULT,
    minTokens: VALIDATION_CONSTANTS.MIN_TOKENS.DEFAULT,
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
    maxFileSize: VALIDATION_CONSTANTS.FILE_SIZE.DEFAULT,
    concurrency: VALIDATION_CONSTANTS.CONCURRENCY.DEFAULT
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
export function mergeConfig(userConfig: PartialDetectionConfig): DetectionConfig {
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
export function ensureCompleteConfig(config: PartialDetectionConfig): DetectionConfig {
  const merged = mergeConfig(config);

  // Validate that all required fields are present
  const requiredFields = ['thresholds', 'filters', 'analysis', 'output'] as const;
  const missingFields = requiredFields.filter(field => !merged[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }

  return merged;
}

export async function loadConfigFromFile(filePath: string): Promise<DetectionConfig> {
  try {
    // Use require for Node.js modules to avoid dynamic import issues in tests
    const fs = require('fs/promises');
    const path = require('path');

    // Check if file exists
    await fs.access(filePath);

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const extension = path.extname(filePath).toLowerCase();

    let userConfig: PartialDetectionConfig;

    switch (extension) {
      case '.json':
        userConfig = JSON.parse(fileContent);
        break;
      case '.js':
      case '.mjs':
        // For JS config files, use require for CommonJS or dynamic import for ES modules
        try {
          // Try dynamic import first for ES modules
          const configModule = await import(path.resolve(filePath));
          userConfig = configModule.default || configModule;
        } catch {
          // Fallback to require for CommonJS
          delete require.cache[require.resolve(path.resolve(filePath))];
          userConfig = require(path.resolve(filePath));
        }
        break;
      default:
        throw new Error(`Unsupported config file format: ${extension}. Supported formats: .json, .js, .mjs`);
    }

    return validateAndMergeConfig(userConfig);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
    }
    throw new Error(`Failed to load configuration from ${filePath}: Unknown error`);
  }
}

export function validateAndMergeConfig(userConfig: PartialDetectionConfig): DetectionConfig {
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

// Re-export CLI configuration utilities
export { CLIConfigParser, type CLIOptions } from './cli-config';
