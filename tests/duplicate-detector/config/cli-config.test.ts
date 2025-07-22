// Unit tests for CLI configuration parsing

import { describe, it, expect } from '@jest/globals';
import { CLIConfigParser, type CLIOptions } from '../../../duplicate-detector/config/cli-config';
import { DEFAULT_CONFIG } from '../../../duplicate-detector/config/index';

describe('CLIConfigParser', () => {
  describe('parseArgs', () => {
    it('should parse basic configuration options', () => {
      const args = [
        '--config', 'my-config.json',
        '--threshold', '0.85',
        '--format', 'html'
      ];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.config).toBe('my-config.json');
      expect(result.threshold).toBe(0.85);
      expect(result.format).toBe('html');
    });

    it('should parse specific threshold options', () => {
      const args = [
        '--syntactic-threshold', '0.95',
        '--semantic-threshold', '0.80',
        '--structural-threshold', '0.75'
      ];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.syntacticThreshold).toBe(0.95);
      expect(result.semanticThreshold).toBe(0.80);
      expect(result.structuralThreshold).toBe(0.75);
    });

    it('should parse filter options', () => {
      const args = [
        '--min-lines', '5',
        '--min-tokens', '10',
        '--exclude', 'node_modules/**',
        '--exclude', '**/*.test.ts',
        '--include', '**/*.ts',
        '--include', '**/*.js'
      ];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.minLines).toBe(5);
      expect(result.minTokens).toBe(10);
      expect(result.exclude).toEqual(['node_modules/**', '**/*.test.ts']);
      expect(result.include).toEqual(['**/*.ts', '**/*.js']);
    });

    it('should parse analysis options', () => {
      const args = [
        '--max-file-size', '1048576',
        '--concurrency', '8',
        '--enable-semantic',
        '--disable-patterns'
      ];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.maxFileSize).toBe(1048576);
      expect(result.concurrency).toBe(8);
      expect(result.enableSemantic).toBe(true);
      expect(result.enablePatterns).toBe(false);
    });

    it('should parse output options', () => {
      const args = [
        '--format', 'markdown',
        '--include-code',
        '--no-group-similar'
      ];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.format).toBe('markdown');
      expect(result.includeCode).toBe(true);
      expect(result.groupSimilar).toBe(false);
    });

    it('should parse help and version flags', () => {
      const helpResult = CLIConfigParser.parseArgs(['--help']);
      const versionResult = CLIConfigParser.parseArgs(['--version']);

      expect(helpResult.help).toBe(true);
      expect(versionResult.version).toBe(true);
    });

    it('should handle short flags', () => {
      const args = ['-c', 'config.json', '-t', '0.9', '-f', 'json', '-h'];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.config).toBe('config.json');
      expect(result.threshold).toBe(0.9);
      expect(result.format).toBe('json');
      expect(result.help).toBe(true);
    });

    it('should handle empty arguments', () => {
      const result = CLIConfigParser.parseArgs([]);

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should ignore unknown arguments', () => {
      const args = ['--unknown-flag', 'value', '--threshold', '0.8'];

      const result = CLIConfigParser.parseArgs(args);

      expect(result.threshold).toBe(0.8);
      expect(result).not.toHaveProperty('unknownFlag');
    });
  });

  describe('cliOptionsToConfig', () => {
    it('should convert basic CLI options to config', () => {
      const options: CLIOptions = {
        threshold: 0.85,
        format: 'html',
        includeCode: true
      };

      const result = CLIConfigParser.cliOptionsToConfig(options);

      expect(result.thresholds?.syntactic).toBe(0.85);
      expect(result.thresholds?.semantic).toBe(0.85);
      expect(result.thresholds?.structural).toBe(0.85);
      expect(result.output?.format).toBe('html');
      expect(result.output?.includeCode).toBe(true);
    });

    it('should handle specific thresholds overriding global threshold', () => {
      const options: CLIOptions = {
        threshold: 0.8,
        syntacticThreshold: 0.95,
        semanticThreshold: 0.75
      };

      const result = CLIConfigParser.cliOptionsToConfig(options);

      expect(result.thresholds?.syntactic).toBe(0.95);
      expect(result.thresholds?.semantic).toBe(0.75);
      expect(result.thresholds?.structural).toBe(0.8);
    });

    it('should convert filter options', () => {
      const options: CLIOptions = {
        minLines: 10,
        minTokens: 20,
        exclude: ['node_modules/**', '**/*.test.ts'],
        include: ['**/*.ts']
      };

      const result = CLIConfigParser.cliOptionsToConfig(options);

      expect(result.filters?.minLines).toBe(10);
      expect(result.filters?.minTokens).toBe(20);
      expect(result.filters?.excludePatterns).toEqual(['node_modules/**', '**/*.test.ts']);
      expect(result.filters?.includePatterns).toEqual(['**/*.ts']);
    });

    it('should convert analysis options', () => {
      const options: CLIOptions = {
        maxFileSize: 2048576,
        concurrency: 6,
        enableSemantic: false,
        enablePatterns: true
      };

      const result = CLIConfigParser.cliOptionsToConfig(options);

      expect(result.analysis?.maxFileSize).toBe(2048576);
      expect(result.analysis?.concurrency).toBe(6);
      expect(result.analysis?.enableSemanticAnalysis).toBe(false);
      expect(result.analysis?.enablePatternDetection).toBe(true);
    });

    it('should handle empty options', () => {
      const result = CLIConfigParser.cliOptionsToConfig({});

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should not create config sections for undefined values', () => {
      const options: CLIOptions = {
        threshold: 0.8,
        enableSemantic: undefined
      };

      const result = CLIConfigParser.cliOptionsToConfig(options);

      expect(result.thresholds).toBeDefined();
      expect(result.analysis).toBeUndefined();
    });
  });

  describe('loadConfiguration', () => {
    it('should merge CLI options with defaults when no config file specified', async () => {
      const cliOptions: CLIOptions = {
        threshold: 0.9,
        format: 'html'
      };

      const result = await CLIConfigParser.loadConfiguration(cliOptions);

      expect(result.thresholds.syntactic).toBe(0.9);
      expect(result.thresholds.semantic).toBe(0.9);
      expect(result.thresholds.structural).toBe(0.9);
      expect(result.output.format).toBe('html');
      expect(result.filters.minLines).toBe(DEFAULT_CONFIG.filters.minLines);
    });

    it('should handle specific thresholds overriding global threshold', async () => {
      const cliOptions: CLIOptions = {
        threshold: 0.8,
        syntacticThreshold: 0.95,
        semanticThreshold: 0.75
      };

      const result = await CLIConfigParser.loadConfiguration(cliOptions);

      expect(result.thresholds.syntactic).toBe(0.95);
      expect(result.thresholds.semantic).toBe(0.75);
      expect(result.thresholds.structural).toBe(0.8);
    });

    it('should handle filter options correctly', async () => {
      const cliOptions: CLIOptions = {
        minLines: 10,
        minTokens: 20,
        exclude: ['node_modules/**', '**/*.test.ts'],
        include: ['**/*.ts']
      };

      const result = await CLIConfigParser.loadConfiguration(cliOptions);

      expect(result.filters.minLines).toBe(10);
      expect(result.filters.minTokens).toBe(20);
      expect(result.filters.excludePatterns).toEqual(['node_modules/**', '**/*.test.ts']);
      expect(result.filters.includePatterns).toEqual(['**/*.ts']);
    });

    it('should handle analysis options correctly', async () => {
      const cliOptions: CLIOptions = {
        maxFileSize: 2048576,
        concurrency: 6,
        enableSemantic: false,
        enablePatterns: true
      };

      const result = await CLIConfigParser.loadConfiguration(cliOptions);

      expect(result.analysis.maxFileSize).toBe(2048576);
      expect(result.analysis.concurrency).toBe(6);
      expect(result.analysis.enableSemanticAnalysis).toBe(false);
      expect(result.analysis.enablePatternDetection).toBe(true);
    });

    it('should handle output options correctly', async () => {
      const cliOptions: CLIOptions = {
        format: 'markdown',
        includeCode: false,
        groupSimilar: true
      };

      const result = await CLIConfigParser.loadConfiguration(cliOptions);

      expect(result.output.format).toBe('markdown');
      expect(result.output.includeCode).toBe(false);
      expect(result.output.groupSimilar).toBe(true);
    });

    it('should use defaults when no options provided', async () => {
      const cliOptions: CLIOptions = {};

      const result = await CLIConfigParser.loadConfiguration(cliOptions);

      expect(result).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('getHelpText', () => {
    it('should return help text string', () => {
      const helpText = CLIConfigParser.getHelpText();

      expect(typeof helpText).toBe('string');
      expect(helpText).toContain('Duplicate Code Detector');
      expect(helpText).toContain('USAGE:');
      expect(helpText).toContain('OPTIONS:');
      expect(helpText).toContain('EXAMPLES:');
    });

    it('should include all major option categories', () => {
      const helpText = CLIConfigParser.getHelpText();

      expect(helpText).toContain('Configuration:');
      expect(helpText).toContain('Thresholds:');
      expect(helpText).toContain('Filters:');
      expect(helpText).toContain('Analysis:');
      expect(helpText).toContain('Output:');
      expect(helpText).toContain('General:');
    });

    it('should include usage examples', () => {
      const helpText = CLIConfigParser.getHelpText();

      expect(helpText).toContain('duplicate-detector');
      expect(helpText).toContain('--threshold');
      expect(helpText).toContain('--config');
      expect(helpText).toContain('--format');
    });
  });
});
