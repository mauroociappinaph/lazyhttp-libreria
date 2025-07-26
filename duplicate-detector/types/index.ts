// Core type definitions for duplicate code detection

// Configuration interface
export interface DetectionConfig {
  thresholds: {
    syntactic: number;
    semantic: number;
    structural: number;
  };
  filters: {
    minLines: number;
    minTokens: number;
    excludePatterns: string[];
    includePatterns: string[];
  };
  analysis: {
    enableSemanticAnalysis: boolean;
    enablePatternDetection: boolean;
    maxFileSize: number;
    concurrency: number;
  };
  output: {
    format: 'json' | 'html' | 'markdown';
    includeCode: boolean;
    groupSimilar: boolean;
  };
}

// Utility type for partial configuration with deep partial support
export type PartialDetectionConfig = {
  thresholds?: Partial<DetectionConfig['thresholds']>;
  filters?: Partial<DetectionConfig['filters']>;
  analysis?: Partial<DetectionConfig['analysis']>;
  output?: Partial<DetectionConfig['output']>;
};

export interface DuplicateDetector {
  analyze(files: string[]): Promise<DuplicationReport>;
  configure(config: DetectionConfig): void;
}

export interface SimilarityCalculator {
  calculateSimilarity(ast1: AST, ast2: AST): SimilarityScore;
  setThreshold(threshold: number): void;
}

export interface PatternAnalyzer {
  detectPatterns(functions: FunctionNode[]): PatternGroup[];
  suggestRefactoring(patterns: PatternGroup[]): RefactoringSuggestion[];
}

export interface ReportGenerator {
  generateReport(duplications: Duplication[]): DuplicationReport;
  exportToFormat(report: DuplicationReport, format: OutputFormat): string;
}

export interface FileDiscoveryEngine {
  discoverFiles(rootPath: string, config: DetectionConfig): Promise<string[]>;
  filterFiles(files: string[], patterns: string[]): string[];
  filterByFileSize(files: string[], maxFileSize: number): Promise<string[]>;
  createFileStream(filePath: string, chunkSize?: number): AsyncGenerator<string>;
  readFileContent(filePath: string, maxFileSize?: number): Promise<string>;
  getFileStats(filePath: string): Promise<FileStats>;
}

export interface FileStats {
  path: string;
  size: number;
  extension: string;
  isSupported: boolean;
  lastModified: Date;
  created: Date;
}

export interface ASTParser {
  parseFile(filePath: string): Promise<AST>;
  normalizeAST(ast: AST): NormalizedAST;
  extractMetadata(ast: AST): FileMetadata;
}

// Data structures
export interface DuplicationReport {
  summary: {
    totalFiles: number;
    duplicatedFiles: number;
    duplicatedLines: number;
    duplicatedPercentage: number;
    criticalDuplications: number;
  };
  duplications: Duplication[];
  patterns: PatternGroup[];
  metrics: QualityMetrics;
  timestamp: Date;
}

export interface Duplication {
  id: string;
  type: DuplicationType;
  similarity: SimilarityScore;
  instances: CodeInstance[];
  suggestion?: RefactoringSuggestion;
}

export interface CodeInstance {
  file: string;
  startLine: number;
  endLine: number;
  functionName?: string;
  className?: string;
  code: string;
  hash: string;
}

export interface SimilarityScore {
  score: number; // 0-1
  confidence: number; // 0-1
  type: 'syntactic' | 'semantic' | 'structural';
  details: {
    editDistance?: number;
    commonTokens?: number;
    structuralSimilarity?: number;
  };
}

export interface PatternGroup {
  id: string;
  pattern: LogicPattern;
  instances: FunctionNode[];
  similarity: number;
  refactoringSuggestion?: RefactoringSuggestion;
}

export interface LogicPattern {
  signature: string;
  complexity: number;
  operations: string[];
  controlFlow: string[];
}

export interface RefactoringSuggestion {
  type: 'extract-function' | 'create-abstract-class' | 'use-composition' | 'extract-interface';
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  benefits: string[];
  codeExample?: string;
}

export interface QualityMetrics {
  duplicationRatio: number;
  maintainabilityIndex: number;
  technicalDebt: {
    hours: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface FileMetadata {
  filePath: string;
  functions: FunctionNode[];
  classes: ClassNode[];
  modules: ModuleNode[];
  imports: ImportNode[];
  exports: ExportNode[];
  lineCount: number;
  tokenCount: number;
}

// AST-related types
export interface AST {
  nodeCount: number;
  root: ASTNode;
  sourceFile: string;
}

export interface NormalizedAST extends AST {
  normalized: true;
  hash: string;
}

export interface ASTNode {
  type: string;
  children: ASTNode[];
  value?: unknown;
  position: {
    line: number;
    column: number;
  };
}

export interface FunctionNode extends ASTNode {
  name: string;
  parameters: ParameterNode[];
  returnType?: string;
  body: ASTNode[];
  isAsync: boolean;
  isExported: boolean;
}

export interface ClassNode extends ASTNode {
  name: string;
  methods: FunctionNode[];
  properties: PropertyNode[];
  extends?: string;
  implements?: string[];
  isExported: boolean;
}

export interface ModuleNode extends ASTNode {
  name: string;
  exports: ExportNode[];
  imports: ImportNode[];
}

export interface ParameterNode extends ASTNode {
  name: string;
  parameterType?: string;
  defaultValue?: unknown;
  isOptional: boolean;
}

export interface PropertyNode extends ASTNode {
  name: string;
  propertyType?: string;
  isPrivate: boolean;
  isStatic: boolean;
  defaultValue?: unknown;
}

export interface ImportNode extends ASTNode {
  source: string;
  imports: string[];
  isDefault: boolean;
}

export interface ExportNode extends ASTNode {
  name: string;
  isDefault: boolean;
  type: 'function' | 'class' | 'variable' | 'type';
}

// Enums
export enum DuplicationType {
  IDENTICAL = 'identical',
  SIMILAR = 'similar',
  STRUCTURAL = 'structural',
  SEMANTIC = 'semantic'
}

export enum OutputFormat {
  JSON = 'json',
  HTML = 'html',
  MARKDOWN = 'markdown'
}

export enum ErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  FILE_ACCESS_ERROR = 'FILE_ACCESS_ERROR',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  ANALYSIS_TIMEOUT = 'ANALYSIS_TIMEOUT'
}

// Error handling
export class DuplicateDetectionError extends Error {
  constructor(
    public readonly type: ErrorType,
    message?: string,
    public readonly file?: string,
    public readonly details?: unknown
  ) {
    const errorMessage = message || DuplicateDetectionError.getDefaultMessage(type);
    super(`${type}: ${errorMessage}`);

    // Maintain proper stack trace
    this.name = 'DuplicateDetectionError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateDetectionError);
    }
  }

  private static getDefaultMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.PARSE_ERROR:
        return 'Failed to parse file';
      case ErrorType.FILE_ACCESS_ERROR:
        return 'Unable to access file';
      case ErrorType.MEMORY_LIMIT_EXCEEDED:
        return 'Memory limit exceeded during analysis';
      case ErrorType.CONFIGURATION_ERROR:
        return 'Invalid configuration provided';
      case ErrorType.ANALYSIS_TIMEOUT:
        return 'Analysis operation timed out';
      default:
        return 'Unknown error occurred';
    }
  }

  /**
   * Creates a DuplicateDetectionError from an unknown error
   */
  static fromError(error: unknown, type: ErrorType, file?: string): DuplicateDetectionError {
    if (error instanceof DuplicateDetectionError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    return new DuplicateDetectionError(type, message, file, error);
  }
}
