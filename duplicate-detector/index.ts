/**
 * Duplicate Code Detector - Main Entry Point
 *
 * A comprehensive tool for detecting code duplication in TypeScript/JavaScript projects.
 * Supports syntactic, semantic, and structural analysis with configurable thresholds.
 */

// Export types and interfaces
export type {
  DetectionConfig,
  DuplicationReport,
  Duplication,
  CodeInstance,
  SimilarityScore,
  PatternGroup,
  RefactoringSuggestion,
  QualityMetrics,
  FileMetadata,
  FileStats,
  AST,
  NormalizedAST,
  ASTNode,
  FunctionNode,
  ClassNode,
  DuplicateDetector as IDuplicateDetector,
  SimilarityCalculator as ISimilarityCalculator,
  PatternAnalyzer as IPatternAnalyzer,
  ReportGenerator as IReportGenerator,
  FileDiscoveryEngine as IFileDiscoveryEngine,
  ASTParser as IASTParser
} from './types/index.js';

export {
  DuplicationType,
  OutputFormat,
  ErrorType,
  DuplicateDetectionError
} from './types/index.js';

// Export configuration
export {
  DEFAULT_CONFIG,
  ConfigValidator,
  mergeConfig,
  validateAndMergeConfig,
  loadConfigFromFile
} from './config/index.js';

export type {
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning
} from './config/index.js';

// Export core implementations
export { DuplicateDetector } from './core/duplicate-detector.js';
export { SimilarityCalculator } from './core/similarity-calculator.js';
export { PatternAnalyzer } from './core/pattern-analyzer.js';
export { ReportGenerator } from './core/report-generator.js';
export { FileDiscoveryEngine } from './core/file-discovery.js';
export { ASTParser } from './core/ast-parser.js';

// Export analyzers
export { DefaultSyntacticAnalyzer } from './analyzers/syntactic-analyzer.js';
export { DefaultSemanticAnalyzer } from './analyzers/semantic-analyzer.js';
export { DefaultStructuralAnalyzer } from './analyzers/structural-analyzer.js';

// Export analyzer interfaces
export type { SyntacticAnalyzer } from './analyzers/syntactic-analyzer.js';
export type { SemanticAnalyzer } from './analyzers/semantic-analyzer.js';
export type { StructuralAnalyzer } from './analyzers/structural-analyzer.js';

// Export utilities
export {
  // Hash utilities
  generateHash,
  generateShortHash,
  compareHashes,
  generateNormalizedCodeHash,

  // File utilities
  readFileContent,
  isTypeScriptFile,
  isJavaScriptFile,
  isSupportedFile,
  getFileStats,

  // Validation utilities
  isValidThreshold,
  isValidFilePath,
  isValidArray,
  isValidPositiveNumber,
  isValidNonNegativeNumber,
  isNonEmptyString,
  isValidObject,
  validateRequiredFields,

  // Performance utilities
  PerformanceTimer,
  MemoryMonitor,
  measureAsync,
  measureSync,
  debounce,
  throttle
} from './utils/index.js';
