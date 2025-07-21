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
} from './types/index';

export {
  DuplicationType,
  OutputFormat,
  ErrorType,
  DuplicateDetectionError
} from './types/index';

// Export configuration
export {
  DEFAULT_CONFIG,
  ConfigValidator,
  mergeConfig,
  validateAndMergeConfig,
  loadConfigFromFile
} from './config/index';

export type {
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning
} from './config/index';

// Export core implementations
export { DuplicateDetector } from './core/duplicate-detector';
export { SimilarityCalculator } from './core/similarity-calculator';
export { PatternAnalyzer } from './core/pattern-analyzer';
export { ReportGenerator } from './core/report-generator';
export { FileDiscoveryEngine } from './core/file-discovery';
export { ASTParser } from './core/ast-parser';

// Export analyzers
export { DefaultSyntacticAnalyzer } from './analyzers/syntactic-analyzer';
export { DefaultSemanticAnalyzer } from './analyzers/semantic-analyzer';
export { DefaultStructuralAnalyzer } from './analyzers/structural-analyzer';

// Export analyzer interfaces
export type { SyntacticAnalyzer } from './analyzers/syntactic-analyzer';
export type { SemanticAnalyzer } from './analyzers/semantic-analyzer';
export type { StructuralAnalyzer } from './analyzers/structural-analyzer';

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
} from './utils/index';
