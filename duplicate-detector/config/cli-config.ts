// CLI configuration parsing and management

import { DetectionConfig, PartialDetectionConfig } from '../types';
import { validateAndMergeConfig, loadConfigFromFile } from './index.js';

export interface CLIOptions {
  config?: string;
  threshold?: number;
  syntacticThreshold?: number;
  semanticThreshold?: number;
  structuralThreshold?: number;
  minLines?: number;
  minTokens?: number;
  exclude?: string[];
  include?: string[];
  format?: 'json' | 'html' | 'markdown';
  includeCode?: boolean;
  groupSimilar?: boolean;
  maxFileSize?: number;
  concurrency?: number;
  enableSemantic?: boolean;
  enablePatterns?: boolean;
  help?: boolean;
  version?: boolean;
}

export class CLIConfigParser {
  /**
   * Parses command line arguments into CLI options
   */
  static parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '--config':
        case '-c':
          options.config = nextArg;
          i++;
          break;

        case '--threshold':
        case '-t':
          options.threshold = parseFloat(nextArg);
          i++;
          break;

        case '--syntactic-threshold':
          options.syntacticThreshold = parseFloat(nextArg);
          i++;
          break;

        case '--semantic-threshold':
          options.semanticThreshold = parseFloat(nextArg);
          i++;
          break;

        case '--structural-threshold':
          options.structuralThreshold = parseFloat(nextArg);
          i++;
          break;

        case '--min-lines':
          options.minLines = parseInt(nextArg, 10);
          i++;
          break;

        case '--min-tokens':
          options.minTokens = parseInt(nextArg, 10);
          i++;
          break;

        case '--exclude':
          options.exclude = options.exclude || [];
          options.exclude.push(nextArg);
          i++;
          break;

        case '--include':
          options.include = options.include || [];
          options.include.push(nextArg);
          i++;
          break;

        case '--format':
        case '-f':
          if (nextArg === 'json' || nextArg === 'html' || nextArg === 'markdown') {
            options.format = nextArg;
          }
          i++;
          break;

        case '--include-code':
          options.includeCode = true;
          break;

        case '--no-include-code':
          options.includeCode = false;
          break;

        case '--group-similar':
          options.groupSimilar = true;
          break;

        case '--no-group-similar':
          options.groupSimilar = false;
          break;

        case '--max-file-size':
          options.maxFileSize = parseInt(nextArg, 10);
          i++;
          break;

        case '--concurrency':
          options.concurrency = parseInt(nextArg, 10);
          i++;
          break;

        case '--enable-semantic':
          options.enableSemantic = true;
          break;

        case '--disable-semantic':
          options.enableSemantic = false;
          break;

        case '--enable-patterns':
          options.enablePatterns = true;
          break;

        case '--disable-patterns':
          options.enablePatterns = false;
          break;

        case '--help':
        case '-h':
          options.help = true;
          break;

        case '--version':
        case '-v':
          options.version = true;
          break;
      }
    }

    return options;
  }

  /**
   * Converts CLI options to DetectionConfig partial
   */
  static cliOptionsToConfig(options: CLIOptions): PartialDetectionConfig {
    const config: PartialDetectionConfig = {};

    // Handle thresholds
    if (options.threshold !== undefined ||
        options.syntacticThreshold !== undefined ||
        options.semanticThreshold !== undefined ||
        options.structuralThreshold !== undefined) {
      config.thresholds = {};

      if (options.threshold !== undefined) {
        // Apply global threshold to all types
        config.thresholds.syntactic = options.threshold;
        config.thresholds.semantic = options.threshold;
        config.thresholds.structural = options.threshold;
      }

      // Override with specific thresholds
      if (options.syntacticThreshold !== undefined) {
        config.thresholds.syntactic = options.syntacticThreshold;
      }
      if (options.semanticThreshold !== undefined) {
        config.thresholds.semantic = options.semanticThreshold;
      }
      if (options.structuralThreshold !== undefined) {
        config.thresholds.structural = options.structuralThreshold;
      }
    }

    // Handle filters
    if (options.minLines !== undefined ||
        options.minTokens !== undefined ||
        options.exclude ||
        options.include) {
      config.filters = {};

      if (options.minLines !== undefined) {
        config.filters.minLines = options.minLines;
      }
      if (options.minTokens !== undefined) {
        config.filters.minTokens = options.minTokens;
      }
      if (options.exclude) {
        config.filters.excludePatterns = options.exclude;
      }
      if (options.include) {
        config.filters.includePatterns = options.include;
      }
    }

    // Handle analysis options
    if (options.maxFileSize !== undefined ||
        options.concurrency !== undefined ||
        options.enableSemantic !== undefined ||
        options.enablePatterns !== undefined) {
      config.analysis = {};

      if (options.maxFileSize !== undefined) {
        config.analysis.maxFileSize = options.maxFileSize;
      }
      if (options.concurrency !== undefined) {
        config.analysis.concurrency = options.concurrency;
      }
      if (options.enableSemantic !== undefined) {
        config.analysis.enableSemanticAnalysis = options.enableSemantic;
      }
      if (options.enablePatterns !== undefined) {
        config.analysis.enablePatternDetection = options.enablePatterns;
      }
    }

    // Handle output options
    if (options.format !== undefined ||
        options.includeCode !== undefined ||
        options.groupSimilar !== undefined) {
      config.output = {};

      if (options.format !== undefined) {
        config.output.format = options.format;
      }
      if (options.includeCode !== undefined) {
        config.output.includeCode = options.includeCode;
      }
      if (options.groupSimilar !== undefined) {
        config.output.groupSimilar = options.groupSimilar;
      }
    }

    return config;
  }

  /**
   * Loads configuration from multiple sources with proper precedence:
   * 1. CLI arguments (highest priority)
   * 2. Config file specified via --config
   * 3. Default config files (duplicate-detector.config.js, .json)
   * 4. Default configuration (lowest priority)
   */
  static async loadConfiguration(cliOptions: CLIOptions): Promise<DetectionConfig> {
    let fileConfig: PartialDetectionConfig = {};

    // Try to load from specified config file
    if (cliOptions.config) {
      try {
        const loadedConfig = await loadConfigFromFile(cliOptions.config);
        fileConfig = loadedConfig;
      } catch (error) {
        throw new Error(`Failed to load specified config file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Try to load from default config files
      const defaultConfigFiles = [
        'duplicate-detector.config.js',
        'duplicate-detector.config.json',
        '.duplicate-detector.json'
      ];

      for (const configFile of defaultConfigFiles) {
        try {
          const fs = require('fs/promises');
          await fs.access(configFile);
          const loadedConfig = await loadConfigFromFile(configFile);
          fileConfig = loadedConfig;
          break;
        } catch {
          // File doesn't exist or can't be loaded, try next one
          continue;
        }
      }
    }

    // Convert CLI options to config
    const cliConfig = this.cliOptionsToConfig(cliOptions);

    // Merge configurations with CLI taking precedence
    const mergedConfig: PartialDetectionConfig = {
      thresholds: {
        ...fileConfig.thresholds,
        ...cliConfig.thresholds
      },
      filters: {
        ...fileConfig.filters,
        ...cliConfig.filters
      },
      analysis: {
        ...fileConfig.analysis,
        ...cliConfig.analysis
      },
      output: {
        ...fileConfig.output,
        ...cliConfig.output
      }
    };

    return validateAndMergeConfig(mergedConfig);
  }

  /**
   * Generates help text for CLI usage
   */
  static getHelpText(): string {
    return `
Duplicate Code Detector - Find and analyze code duplication in TypeScript/JavaScript projects

USAGE:
  duplicate-detector [OPTIONS] [PATHS...]

OPTIONS:
  Configuration:
    -c, --config <file>              Load configuration from file

  Thresholds:
    -t, --threshold <number>         Set global similarity threshold (0-1)
    --syntactic-threshold <number>   Set syntactic similarity threshold (0-1)
    --semantic-threshold <number>    Set semantic similarity threshold (0-1)
    --structural-threshold <number>  Set structural similarity threshold (0-1)

  Filters:
    --min-lines <number>             Minimum lines for duplication detection
    --min-tokens <number>            Minimum tokens for duplication detection
    --exclude <pattern>              Exclude files matching pattern (can be used multiple times)
    --include <pattern>              Include files matching pattern (can be used multiple times)

  Analysis:
    --max-file-size <bytes>          Maximum file size to analyze
    --concurrency <number>           Number of concurrent analysis threads
    --enable-semantic                Enable semantic analysis
    --disable-semantic               Disable semantic analysis
    --enable-patterns                Enable pattern detection
    --disable-patterns               Disable pattern detection

  Output:
    -f, --format <format>            Output format: json, html, markdown
    --include-code                   Include code snippets in output
    --no-include-code                Exclude code snippets from output
    --group-similar                  Group similar duplications
    --no-group-similar               Don't group similar duplications

  General:
    -h, --help                       Show this help message
    -v, --version                    Show version information

EXAMPLES:
  # Analyze current directory with default settings
  duplicate-detector

  # Analyze specific directory with custom threshold
  duplicate-detector --threshold 0.8 src/

  # Use custom config file and output HTML report
  duplicate-detector --config my-config.json --format html

  # Exclude test files and set minimum lines
  duplicate-detector --exclude "**/*.test.ts" --min-lines 5

  # Enable only syntactic analysis with high threshold
  duplicate-detector --disable-semantic --syntactic-threshold 0.95
`;
  }
}
