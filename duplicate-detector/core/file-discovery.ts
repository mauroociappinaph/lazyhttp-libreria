// File discovery implementation

import {
  FileDiscoveryEngine as IFileDiscoveryEngine,
  DetectionConfig
} from '../types';

export class FileDiscoveryEngine implements IFileDiscoveryEngine {
  async discoverFiles(rootPath: string, config: DetectionConfig): Promise<string[]> {
    // This will be implemented in later tasks
    // For now, return empty array to satisfy the interface
    return [];
  }

  filterFiles(files: string[], patterns: string[]): string[] {
    // This will be implemented in later tasks
    // For now, return the input files to satisfy the interface
    return files;
  }
}
