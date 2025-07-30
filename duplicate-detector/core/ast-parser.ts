import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  ASTParser as IASTParser,
  AST,
  NormalizedAST,
  FileMetadata,
  ASTNode,
  DuplicateDetectionError,
  ErrorType
} from '../types/index.js';
import { ASTNodeConverter } from './ast-parser/ast-node-converter.js';
import { ASTNormalizer } from './ast-parser/ast-normalizer.js';
import { MetadataExtractor } from './ast-parser/metadata-extractor.js';

/**
 * TypeScript AST Parser and Normalizer
 * Implements parsing of TypeScript files using the TypeScript Compiler API
 */
export class TypeScriptASTParser implements IASTParser {
  private nodeConverter: ASTNodeConverter;
  private normalizer: ASTNormalizer;
  private metadataExtractor: MetadataExtractor;

  constructor(_compilerOptions?: ts.CompilerOptions) {
    this.nodeConverter = new ASTNodeConverter();
    this.normalizer = new ASTNormalizer();
    this.metadataExtractor = new MetadataExtractor();
  }

  /**
   * Parse a TypeScript/JavaScript file and return its AST
   */
  async parseFile(filePath: string): Promise<AST> {
    try {
      // Read file content
      const sourceCode = await fs.readFile(filePath, 'utf-8');

      // Create source file
      const sourceFile = ts.createSourceFile(
        path.basename(filePath),
        sourceCode,
        ts.ScriptTarget.ES2020,
        true
      );

      // Convert TypeScript AST to our AST format
      const root = this.nodeConverter.convertTSNodeToASTNode(sourceFile);

      return {
        nodeCount: this.countNodes(root),
        root,
        sourceFile: filePath
      };
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.PARSE_ERROR,
        filePath
      );
    }
  }

  /**
   * Normalize AST for comparison by removing position information and standardizing structure
   */
  normalizeAST(ast: AST): NormalizedAST {
    try {
      return this.normalizer.createNormalizedAST(ast);
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.PARSE_ERROR,
        ast.sourceFile
      );
    }
  }

  /**
   * Extract metadata from AST including functions, classes, modules, imports, and exports
   */
  extractMetadata(ast: AST): FileMetadata {
    try {
      const metadata: FileMetadata = {
        filePath: ast.sourceFile,
        functions: [],
        classes: [],
        modules: [],
        imports: [],
        exports: [],
        lineCount: 0,
        tokenCount: 0
      };

      this.metadataExtractor.extractMetadataFromNode(ast.root, metadata);

      // Calculate line count and token count
      metadata.lineCount = this.calculateLineCount(ast.root);
      metadata.tokenCount = ast.nodeCount;

      return metadata;
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.PARSE_ERROR,
        ast.sourceFile
      );
    }
  }



  /**
   * Count total nodes in AST
   */
  private countNodes(node: ASTNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Calculate line count from AST
   */
  private calculateLineCount(node: ASTNode): number {
    let maxLine = node.position.line;

    const traverse = (n: ASTNode) => {
      if (n.position.line > maxLine) {
        maxLine = n.position.line;
      }
      for (const child of n.children) {
        traverse(child);
      }
    };

    traverse(node);
    return maxLine;
  }


}

// Export the TypeScript parser as the default ASTParser implementation
export const ASTParser = TypeScriptASTParser;
