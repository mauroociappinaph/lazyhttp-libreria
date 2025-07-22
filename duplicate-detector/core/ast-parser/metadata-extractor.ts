import { ASTNode, FileMetadata } from '../../types/index';
import { FunctionExtractor } from './node-extractors/function-extractor';
import { ClassExtractor } from './node-extractors/class-extractor';
import { ImportExportExtractor } from './node-extractors/import-export-extractor';

/**
 * Extracts metadata from AST nodes
 */
export class MetadataExtractor {
  private functionExtractor: FunctionExtractor;
  private classExtractor: ClassExtractor;
  private importExportExtractor: ImportExportExtractor;

  constructor() {
    this.functionExtractor = new FunctionExtractor();
    this.classExtractor = new ClassExtractor();
    this.importExportExtractor = new ImportExportExtractor();
  }
  /**
   * Extract metadata from AST node recursively
   */
  extractMetadataFromNode(node: ASTNode, metadata: FileMetadata): void {
    switch (node.type) {
      case 'FunctionDeclaration':
      case 'MethodDeclaration':
      case 'ArrowFunction':
      case 'FunctionExpression': {
        const functionNode = this.functionExtractor.extractFunctionNode(node);
        if (functionNode) {
          metadata.functions.push(functionNode);
        }
        break;
      }

      case 'ClassDeclaration': {
        const classNode = this.classExtractor.extractClassNode(node);
        if (classNode) {
          metadata.classes.push(classNode);
        }
        break;
      }

      case 'ModuleDeclaration': {
        const moduleNode = this.importExportExtractor.extractModuleNode(node);
        if (moduleNode) {
          metadata.modules.push(moduleNode);
        }
        break;
      }

      case 'ImportDeclaration': {
        const importNode = this.importExportExtractor.extractImportNode(node);
        if (importNode) {
          metadata.imports.push(importNode);
        }
        break;
      }

      case 'ExportDeclaration':
      case 'ExportAssignment': {
        const exportNode = this.importExportExtractor.extractExportNode(node);
        if (exportNode) {
          metadata.exports.push(exportNode);
        }
        break;
      }
    }

    // Recursively process children
    for (const child of node.children) {
      this.extractMetadataFromNode(child, metadata);
    }
  }


}
