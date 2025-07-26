// Unit tests for ConfigBuilder

import { describe, it, expect } from "@jest/globals";
import { ConfigBuilder } from "../../../duplicate-detector/config/config-builder";
import { DEFAULT_CONFIG } from "../../../duplicate-detector/config/index";

describe("ConfigBuilder", () => {
  describe("create", () => {
    it("should create a new ConfigBuilder instance", () => {
      const builder = ConfigBuilder.create();
      expect(builder).toBeInstanceOf(ConfigBuilder);
    });
  });

  describe("withThresholds", () => {
    it("should set threshold values", () => {
      const config = ConfigBuilder.create()
        .withThresholds({
          syntactic: 0.9,
          semantic: 0.8,
        })
        .build();

      expect(config.thresholds.syntactic).toBe(0.9);
      expect(config.thresholds.semantic).toBe(0.8);
      expect(config.thresholds.structural).toBe(
        DEFAULT_CONFIG.thresholds.structural
      );
    });

    it("should allow chaining multiple threshold calls", () => {
      const config = ConfigBuilder.create()
        .withThresholds({ syntactic: 0.9 })
        .withThresholds({ semantic: 0.8 })
        .build();

      expect(config.thresholds.syntactic).toBe(0.9);
      expect(config.thresholds.semantic).toBe(0.8);
    });

    it("should override previous threshold values", () => {
      const config = ConfigBuilder.create()
        .withThresholds({ syntactic: 0.9 })
        .withThresholds({ syntactic: 0.95 })
        .build();

      expect(config.thresholds.syntactic).toBe(0.95);
    });
  });

  describe("withFilters", () => {
    it("should set filter values", () => {
      const config = ConfigBuilder.create()
        .withFilters({
          minLines: 10,
          excludePatterns: ["test/**"],
        })
        .build();

      expect(config.filters.minLines).toBe(10);
      expect(config.filters.excludePatterns).toEqual(["test/**"]);
      expect(config.filters.minTokens).toBe(DEFAULT_CONFIG.filters.minTokens);
    });

    it("should handle array merging correctly", () => {
      const config = ConfigBuilder.create()
        .withFilters({
          excludePatterns: ["test/**"],
          includePatterns: ["src/**"],
        })
        .build();

      expect(config.filters.excludePatterns).toEqual(["test/**"]);
      expect(config.filters.includePatterns).toEqual(["src/**"]);
    });
  });

  describe("withAnalysis", () => {
    it("should set analysis values", () => {
      const config = ConfigBuilder.create()
        .withAnalysis({
          enableSemanticAnalysis: false,
          concurrency: 8,
        })
        .build();

      expect(config.analysis.enableSemanticAnalysis).toBe(false);
      expect(config.analysis.concurrency).toBe(8);
      expect(config.analysis.enablePatternDetection).toBe(
        DEFAULT_CONFIG.analysis.enablePatternDetection
      );
    });
  });

  describe("withOutput", () => {
    it("should set output values", () => {
      const config = ConfigBuilder.create()
        .withOutput({
          format: "html",
          includeCode: false,
        })
        .build();

      expect(config.output.format).toBe("html");
      expect(config.output.includeCode).toBe(false);
      expect(config.output.groupSimilar).toBe(
        DEFAULT_CONFIG.output.groupSimilar
      );
    });
  });

  describe("withDefaults", () => {
    it("should apply default configuration", () => {
      const config = ConfigBuilder.create()
        .withThresholds({ syntactic: 0.9 })
        .withDefaults()
        .build();

      expect(config.thresholds.syntactic).toBe(0.9);
      expect(config.thresholds.semantic).toBe(
        DEFAULT_CONFIG.thresholds.semantic
      );
      expect(config.filters).toEqual(DEFAULT_CONFIG.filters);
    });

    it("should not override existing values when applying defaults", () => {
      const customFilters = {
        minLines: 15,
        minTokens: 25,
        excludePatterns: ["custom/**"],
        includePatterns: ["**/*.custom.ts"],
      };

      const config = ConfigBuilder.create()
        .withFilters(customFilters)
        .withDefaults()
        .build();

      expect(config.filters).toEqual(customFilters);
    });
  });

  describe("build", () => {
    it("should build a complete configuration with defaults", () => {
      const config = ConfigBuilder.create().build();

      expect(config).toHaveProperty("thresholds");
      expect(config).toHaveProperty("filters");
      expect(config).toHaveProperty("analysis");
      expect(config).toHaveProperty("output");

      // Should use default values
      expect(config.thresholds).toEqual(DEFAULT_CONFIG.thresholds);
      expect(config.filters).toEqual(DEFAULT_CONFIG.filters);
      expect(config.analysis).toEqual(DEFAULT_CONFIG.analysis);
      expect(config.output).toEqual(DEFAULT_CONFIG.output);
    });

    it("should build configuration with custom values", () => {
      const config = ConfigBuilder.create()
        .withThresholds({ syntactic: 0.95 })
        .withFilters({ minLines: 5 })
        .withAnalysis({ concurrency: 2 })
        .withOutput({ format: "markdown" })
        .build();

      expect(config.thresholds.syntactic).toBe(0.95);
      expect(config.filters.minLines).toBe(5);
      expect(config.analysis.concurrency).toBe(2);
      expect(config.output.format).toBe("markdown");

      // Should still have defaults for unspecified values
      expect(config.thresholds.semantic).toBe(
        DEFAULT_CONFIG.thresholds.semantic
      );
      expect(config.filters.minTokens).toBe(DEFAULT_CONFIG.filters.minTokens);
    });

    it("should handle array properties correctly", () => {
      const customExcludePatterns = ["node_modules/**", "dist/**"];
      const customIncludePatterns = ["**/*.ts", "**/*.js"];

      const config = ConfigBuilder.create()
        .withFilters({
          excludePatterns: customExcludePatterns,
          includePatterns: customIncludePatterns,
        })
        .build();

      expect(config.filters.excludePatterns).toEqual(customExcludePatterns);
      expect(config.filters.includePatterns).toEqual(customIncludePatterns);
    });

    it("should support method chaining", () => {
      const config = ConfigBuilder.create()
        .withThresholds({ syntactic: 0.9 })
        .withFilters({ minLines: 10 })
        .withAnalysis({ enableSemanticAnalysis: false })
        .withOutput({ format: "html" })
        .build();

      expect(config.thresholds.syntactic).toBe(0.9);
      expect(config.filters.minLines).toBe(10);
      expect(config.analysis.enableSemanticAnalysis).toBe(false);
      expect(config.output.format).toBe("html");
    });
  });

  describe("complex scenarios", () => {
    it("should handle multiple updates to the same section", () => {
      const config = ConfigBuilder.create()
        .withThresholds({ syntactic: 0.8 })
        .withThresholds({ semantic: 0.7 })
        .withThresholds({ syntactic: 0.9 }) // Override previous syntactic
        .build();

      expect(config.thresholds.syntactic).toBe(0.9);
      expect(config.thresholds.semantic).toBe(0.7);
      expect(config.thresholds.structural).toBe(
        DEFAULT_CONFIG.thresholds.structural
      );
    });

    it("should build valid configuration that passes validation", () => {
      const config = ConfigBuilder.create()
        .withThresholds({
          syntactic: 0.95,
          semantic: 0.85,
          structural: 0.75,
        })
        .withFilters({
          minLines: 5,
          minTokens: 15,
          excludePatterns: ["node_modules/**", "**/*.test.ts"],
          includePatterns: ["**/*.ts", "**/*.js"],
        })
        .withAnalysis({
          enableSemanticAnalysis: true,
          enablePatternDetection: true,
          maxFileSize: 1024 * 1024,
          concurrency: 4,
        })
        .withOutput({
          format: "json",
          includeCode: true,
          groupSimilar: true,
        })
        .build();

      // Verify all properties are set correctly
      expect(config.thresholds.syntactic).toBe(0.95);
      expect(config.thresholds.semantic).toBe(0.85);
      expect(config.thresholds.structural).toBe(0.75);

      expect(config.filters.minLines).toBe(5);
      expect(config.filters.minTokens).toBe(15);
      expect(config.filters.excludePatterns).toEqual([
        "node_modules/**",
        "**/*.test.ts",
      ]);
      expect(config.filters.includePatterns).toEqual(["**/*.ts", "**/*.js"]);

      expect(config.analysis.enableSemanticAnalysis).toBe(true);
      expect(config.analysis.enablePatternDetection).toBe(true);
      expect(config.analysis.maxFileSize).toBe(1024 * 1024);
      expect(config.analysis.concurrency).toBe(4);

      expect(config.output.format).toBe("json");
      expect(config.output.includeCode).toBe(true);
      expect(config.output.groupSimilar).toBe(true);
    });
  });
});
