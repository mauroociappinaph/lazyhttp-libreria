// File discovery implementation with glob pattern support and streaming

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { minimatch } from 'minimatch';
import {
  FileDiscoveryEngine as IFileDiscoveryEngine,
  DetectionConfig,
  DuplicateDetectionError,
  ErrorType,
  FileStats
} from '../types/index.js';

export class FileDiscoveryEngine implements IFileDiscoveryEngine {
  private readonly supportedExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  private readonly defaultExcludePatterns = [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.git/**',
    '**/*.d.ts',
    '**/*.min.js',
    '**/*.bundle.js'
  ];

  /**
   * Discovers files in the given root path based on configuration
   * @param rootPath - Root directory to scan
   * @param config - Detection configuration with include/exclude patterns
   * @returns Promise<string[]> - Array of discovered file paths
   */
  async discoverFiles(rootPath: string, config: DetectionConfig): Promise<string[]> {
    try {
      // Validate root path exists
      await this.validateRootPath(rootPath);

      // Get all files matching include patterns
      const includePatterns = config.filters.includePatterns.length > 0
        ? config.filters.includePatterns
        : this.getDefaultIncludePatterns();

      let discoveredFiles: string[] = [];

      // Discover files using glob patterns
      for (const pattern of includePatterns) {
        const globPattern = path.isAbsolute(pattern)
          ? pattern
          : path.join(rootPath, pattern);

        const files = await glob(globPattern, {
          absolute: true,
          nodir: true,
          dot: false,
          ignore: this.getCombinedExcludePatterns(config.filters.excludePatterns)
        });

        discoveredFiles.push(...files);
      }

      // Remove duplicates
      discoveredFiles = [...new Set(discoveredFiles)];

      // Filter by supported extensions
      discoveredFiles = discoveredFiles.filter(file =>
        this.supportedExtensions.includes(path.extname(file).toLowerCase())
      );

      // Apply additional filtering
      discoveredFiles = this.filterFiles(discoveredFiles, config.filters.excludePatterns);

      // Filter by file size if configured
      if (config.analysis.maxFileSize > 0) {
        discoveredFiles = await this.filterByFileSize(discoveredFiles, config.analysis.maxFileSize);
      }

      // Sort files for consistent ordering
      discoveredFiles.sort();

      return discoveredFiles;
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.FILE_ACCESS_ERROR,
        rootPath
      );
    }
  }

  /**
   * Filters files based on exclude patterns
   * @param files - Array of file paths to filter
   * @param excludePatterns - Array of glob patterns to exclude
   * @returns string[] - Filtered array of file paths
   */
  filterFiles(files: string[], excludePatterns: string[]): string[] {
    if (excludePatterns.length === 0) {
      return files;
    }

    const combinedPatterns = this.getCombinedExcludePatterns(excludePatterns);

    return files.filter(file => {
      return !combinedPatterns.some(pattern => {
        // Handle both absolute and relative patterns
        const relativePath = path.relative(process.cwd(), file);
        return minimatch(file, pattern) || minimatch(relativePath, pattern);
      });
    });
  }

  /**
   * Filters files by maximum file size
   * @param files - Array of file paths
   * @param maxFileSize - Maximum file size in bytes
   * @returns Promise<string[]> - Filtered files within size limit
   */
  async filterByFileSize(files: string[], maxFileSize: number): Promise<string[]> {
    const filteredFiles: string[] = [];

    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        if (stats.size <= maxFileSize) {
          filteredFiles.push(file);
        }
      } catch (error) {
        // Skip files that can't be accessed
        console.warn(`Warning: Could not access file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return filteredFiles;
  }

  /**
   * Creates a streaming file reader for large files
   * @param filePath - Path to the file to read
   * @param chunkSize - Size of each chunk in bytes (default: 64KB)
   * @returns AsyncGenerator<string> - Async generator yielding file chunks
   */
  async* createFileStream(filePath: string, chunkSize: number = 64 * 1024): AsyncGenerator<string> {
    try {
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(chunkSize);
      let position = 0;

      try {
        while (true) {
          const { bytesRead } = await fileHandle.read(buffer, 0, chunkSize, position);

          if (bytesRead === 0) {
            break; // End of file
          }

          const chunk = buffer.subarray(0, bytesRead).toString('utf-8');
          yield chunk;
          position += bytesRead;
        }
      } finally {
        await fileHandle.close();
      }
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.FILE_ACCESS_ERROR,
        filePath
      );
    }
  }

  /**
   * Reads entire file content with size validation
   * @param filePath - Path to the file to read
   * @param maxFileSize - Maximum allowed file size
   * @returns Promise<string> - File content
   */
  async readFileContent(filePath: string, maxFileSize?: number): Promise<string> {
    try {
      // Check file size if limit is specified
      if (maxFileSize) {
        const stats = await fs.stat(filePath);
        if (stats.size > maxFileSize) {
          throw new Error(`File size (${stats.size} bytes) exceeds maximum allowed size (${maxFileSize} bytes)`);
        }
      }

      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.FILE_ACCESS_ERROR,
        filePath
      );
    }
  }

  /**
   * Gets file statistics
   * @param filePath - Path to the file
   * @returns Promise<FileStats> - File statistics
   */
  async getFileStats(filePath: string): Promise<FileStats> {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).toLowerCase();

      return {
        path: filePath,
        size: stats.size,
        extension,
        isSupported: this.supportedExtensions.includes(extension),
        lastModified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      throw DuplicateDetectionError.fromError(
        error,
        ErrorType.FILE_ACCESS_ERROR,
        filePath
      );
    }
  }

  /**
   * Validates that the root path exists and is accessible
   * @param rootPath - Path to validate
   */
  private async validateRootPath(rootPath: string): Promise<void> {
    try {
      const stats = await fs.stat(rootPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${rootPath}`);
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`Directory does not exist: ${rootPath}`);
      }
      throw error;
    }
  }

  /**
   * Gets default include patterns for supported file types
   * @returns string[] - Default include patterns
   */
  private getDefaultIncludePatterns(): string[] {
    return [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx'
    ];
  }

  /**
   * Combines user exclude patterns with default exclude patterns
   * @param userExcludePatterns - User-defined exclude patterns
   * @returns string[] - Combined exclude patterns
   */
  private getCombinedExcludePatterns(userExcludePatterns: string[]): string[] {
    return [...this.defaultExcludePatterns, ...userExcludePatterns];
  }
}


