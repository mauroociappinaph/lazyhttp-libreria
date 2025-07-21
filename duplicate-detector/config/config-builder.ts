// Builder pattern for configuration management

import { DetectionConfig } from '../types';
import { DEFAULT_CONFIG } from './index';

export class ConfigBuilder {
  private config: Partial<DetectionConfig> = {};

  static create(): ConfigBuilder {
    return new ConfigBuilder();
  }

  withThresholds(thresholds: Partial<DetectionConfig['thresholds']>): ConfigBuilder {
    this.config.thresholds = { ...this.config.thresholds, ...thresholds };
    return this;
  }

  withFilters(filters: Partial<DetectionConfig['filters']>): ConfigBuilder {
    this.config.filters = { ...this.config.filters, ...filters };
    return this;
  }

  withAnalysis(analysis: Partial<DetectionConfig['analysis']>): ConfigBuilder {
    this.config.analysis = { ...this.config.analysis, ...analysis };
    return this;
  }

  withOutput(output: Partial<DetectionConfig['output']>): ConfigBuilder {
    this.config.output = { ...this.config.output, ...output };
    return this;
  }

  withDefaults(): ConfigBuilder {
    this.config = { ...DEFAULT_CONFIG, ...this.config };
    return this;
  }

  build(): DetectionConfig {
    return {
      thresholds: {
        ...DEFAULT_CONFIG.thresholds,
        ...this.config.thresholds
      },
      filters: {
        ...DEFAULT_CONFIG.filters,
        ...this.config.filters,
        excludePatterns: this.config.filters?.excludePatterns ?? DEFAULT_CONFIG.filters.excludePatterns,
        includePatterns: this.config.filters?.includePatterns ?? DEFAULT_CONFIG.filters.includePatterns
      },
      analysis: {
        ...DEFAULT_CONFIG.analysis,
        ...this.config.analysis
      },
      output: {
        ...DEFAULT_CONFIG.output,
        ...this.config.output
      }
    };
  }
}
