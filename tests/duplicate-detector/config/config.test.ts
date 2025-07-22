// Unit tests for configuration management

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  ConfigValidator,
  DEFAULT_CONFIG,
  mergeConfig,
  validateAndMergeConfig,
  loadConfigFromFile,
  ensureCompleteConfig
} from '../../../duplicate-detector/config/index';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe('validate', () => {
    it('should validate a complete valid configuration', () => {
      const result = validator.validate(DEFAULT_CONFIG);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate an empty configuration', () => {
      const result = validator.validate({});

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    describe('thresholds validation', () => {
      it('should accept valid threshold values', () => {
        const config = {
          thresholds: {
            syntactic: 0.95,
            semantic: 0.80,
            structural: 0.75
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(true);
      });

      it('should reject threshold values outside 0-1 range', () => {
        const config = {
          thresholds: {
            syntactic: 1.5,
            semantic: -0.1,
            structural: 0.75
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0].field).toBe('thresholds.syntactic');
        expect(result.errors[1].field).toBe('thresholds.semantic');
      });

      it('should reject non-numeric threshold values', () => {
        const config = {
          thresholds: {
            syntactic: '0.95' as any,
            semantic: true as any,
            structural: null as any
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(3);
      });

      it('should warn about very low thresholds', () => {
        const config = {
          thresholds: {
            syntactic: 0.3,
            semantic: 0.4
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(2);
        expect(result.warnings[0].field).toBe('thresholds.syntactic');
        expect(result.warnings[1].field).toBe('thresholds.semantic');
      });
    });

    describe('filters validation', () => {
      it('should accept valid filter values', () => {
        const config = {
          filters: {
            minLines: 5,
            minTokens: 15,
            excludePatterns: ['node_modules/**'],
            includePatterns: ['**/*.ts']
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(true);
      });

      it('should reject non-positive minLines and minTokens', () => {
        const config = {
          filters: {
            minLines: 0,
            minTokens: -5
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
      });

      it('should reject non-array patterns', () => {
        const config = {
          filters: {
            excludePatterns: 'node_modules/**' as any,
            includePatterns: true as any
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
      });

      it('should warn about very high minLines', () => {
        const config = {
          filters: {
            minLines: 100
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].field).toBe('filters.minLines');
      });
    });

    describe('analysis validation', () => {
      it('should accept valid analysis values', () => {
        const config = {
          analysis: {
            maxFileSize: 1024 * 1024,
            concurrency: 4,
            enableSemanticAnalysis: true,
            enablePatternDetection: false
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(true);
      });

      it('should reject non-positive maxFileSize and concurrency', () => {
        const config = {
          analysis: {
            maxFileSize: -1000,
            concurrency: 0
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
      });

      it('should warn about very large file size and high concurrency', () => {
        const config = {
          analysis: {
            maxFileSize: 50 * 1024 * 1024, // 50MB
            concurrency: 32
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(2);
      });
    });

    describe('output validation', () => {
      it('should accept valid output formats', () => {
        const formats = ['json', 'html', 'markdown'] as const;

        formats.forEach(format => {
          const config = { output: { format } };
          const result = validator.validate(config);
          expect(result.isValid).toBe(true);
        });
      });

      it('should reject invalid output formats', () => {
        const config = {
          output: {
            format: 'xml' as any
          }
        };

        const result = validator.validate(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('output.format');
      });
    });
  });
});

describe('Configuration merging', () => {
  describe('mergeConfig', () => {
    it('should merge partial config with defaults', () => {
      const userConfig = {
        thresholds: {
          syntactic: 0.90
        },
        filters: {
          minLines: 10
        }
      };

      const result = mergeConfig(userConfig);

      expect(result.thresholds.syntactic).toBe(0.90);
      expect(result.thresholds.semantic).toBe(DEFAULT_CONFIG.thresholds.semantic);
      expect(result.filters.minLines).toBe(10);
      expect(result.filters.minTokens).toBe(DEFAULT_CONFIG.filters.minTokens);
    });

    it('should handle array merging correctly', () => {
      const userConfig = {
        filters: {
          excludePatterns: ['custom/**'],
          includePatterns: ['**/*.custom.ts']
        }
      };

      const result = mergeConfig(userConfig);

      expect(result.filters.excludePatterns).toEqual(['custom/**']);
      expect(result.filters.includePatterns).toEqual(['**/*.custom.ts']);
    });

    it('should preserve undefined values correctly', () => {
      const userConfig = {
        filters: {
          excludePatterns: undefined
        }
      };

      const result = mergeConfig(userConfig);

      expect(result.filters.excludePatterns).toEqual(DEFAULT_CONFIG.filters.excludePatterns);
    });
  });

  describe('validateAndMergeConfig', () => {
    it('should validate and merge valid config', () => {
      const userConfig = {
        thresholds: {
          syntactic: 0.85
        }
      };

      const result = validateAndMergeConfig(userConfig);

      expect(result.thresholds.syntactic).toBe(0.85);
      expect(result.thresholds.semantic).toBe(DEFAULT_CONFIG.thresholds.semantic);
    });

    it('should throw error for invalid config', () => {
      const userConfig = {
        thresholds: {
          syntactic: 2.0
        }
      };

      expect(() => validateAndMergeConfig(userConfig)).toThrow('Configuration validation failed');
    });

    it('should log warnings for problematic but valid config', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const userConfig = {
        thresholds: {
          syntactic: 0.3
        }
      };

      validateAndMergeConfig(userConfig);

      expect(consoleSpy).toHaveBeenCalledWith('Configuration warnings:');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('thresholds.syntactic'));

      consoleSpy.mockRestore();
    });
  });

  describe('ensureCompleteConfig', () => {
    it('should return complete config for valid partial config', () => {
      const partialConfig = {
        thresholds: {
          syntactic: 0.90
        }
      };

      const result = ensureCompleteConfig(partialConfig);

      expect(result).toHaveProperty('thresholds');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('output');
    });

    it('should work with empty config', () => {
      const result = ensureCompleteConfig({});

      expect(result).toEqual(DEFAULT_CONFIG);
    });
  });
});

describe('Configuration file loading', () => {
  // Mock fs/promises
  const mockFs = {
    access: jest.fn() as jest.MockedFunction<any>,
    readFile: jest.fn() as jest.MockedFunction<any>
  };

  const mockPath = {
    extname: jest.fn() as jest.MockedFunction<any>,
    resolve: jest.fn() as jest.MockedFunction<any>
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock dynamic imports
    jest.doMock('fs/promises', () => mockFs);
    jest.doMock('path', () => mockPath);
  });

  afterEach(() => {
    jest.dontMock('fs/promises');
    jest.dontMock('path');
  });

  describe('loadConfigFromFile', () => {
    it('should load JSON config file', async () => {
      const configData = {
        thresholds: {
          syntactic: 0.90
        }
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(configData));
      mockPath.extname.mockReturnValue('.json');

      const result = await loadConfigFromFile('config.json');

      expect(result.thresholds.syntactic).toBe(0.90);
      expect(mockFs.access).toHaveBeenCalledWith('config.json');
      expect(mockFs.readFile).toHaveBeenCalledWith('config.json', 'utf-8');
    });

    it('should handle file access errors', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'));

      await expect(loadConfigFromFile('nonexistent.json')).rejects.toThrow('Failed to load configuration');
    });

    it('should handle JSON parsing errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue('invalid json');
      mockPath.extname.mockReturnValue('.json');

      await expect(loadConfigFromFile('invalid.json')).rejects.toThrow('Failed to load configuration');
    });

    it('should reject unsupported file formats', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue('content');
      mockPath.extname.mockReturnValue('.yaml');

      await expect(loadConfigFromFile('config.yaml')).rejects.toThrow('Unsupported config file format');
    });

    it('should handle validation errors in loaded config', async () => {
      const invalidConfig = {
        thresholds: {
          syntactic: 2.0 // Invalid threshold
        }
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(invalidConfig));
      mockPath.extname.mockReturnValue('.json');

      await expect(loadConfigFromFile('invalid-config.json')).rejects.toThrow('Configuration validation failed');
    });
  });
});

describe('DEFAULT_CONFIG', () => {
  it('should have all required properties', () => {
    expect(DEFAULT_CONFIG).toHaveProperty('thresholds');
    expect(DEFAULT_CONFIG).toHaveProperty('filters');
    expect(DEFAULT_CONFIG).toHaveProperty('analysis');
    expect(DEFAULT_CONFIG).toHaveProperty('output');
  });

  it('should have valid threshold values', () => {
    expect(DEFAULT_CONFIG.thresholds.syntactic).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CONFIG.thresholds.syntactic).toBeLessThanOrEqual(1);
    expect(DEFAULT_CONFIG.thresholds.semantic).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CONFIG.thresholds.semantic).toBeLessThanOrEqual(1);
    expect(DEFAULT_CONFIG.thresholds.structural).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CONFIG.thresholds.structural).toBeLessThanOrEqual(1);
  });

  it('should have reasonable default values', () => {
    expect(DEFAULT_CONFIG.filters.minLines).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.filters.minTokens).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.analysis.maxFileSize).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.analysis.concurrency).toBeGreaterThan(0);
  });

  it('should pass its own validation', () => {
    const validator = new ConfigValidator();
    const result = validator.validate(DEFAULT_CONFIG);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
