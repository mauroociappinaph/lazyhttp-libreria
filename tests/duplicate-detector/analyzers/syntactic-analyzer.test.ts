// Tests for syntactic analyzer
import { DefaultSyntacticAnalyzer } from '../../../duplicate-detector/analyzers/syntactic-analyzer';
import { DuplicationType, AST, SimilarityScore } from '../../../duplicate-detector/types';

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

// Mock the hash utils
jest.mock('../../../duplicate-detector/utils/hash-utils', () => ({
  generateNormalizedCodeHash: (code: string) => {
    // Return different hashes for different files, but same hash for file1 and file2
    if (code.includes('file1') || code.includes('file2')) {
      return 'same-hash';
    }
    return 'different-hash';
  },
  generateHash: (code: string) => `hash-${code}`
}));

// Create mock ASTs for testing
function createMockAST(sourceFile: string, nodeCount: number, line: number): AST {
  return {
    nodeCount,
    root: {
      type: 'Program',
      children: [],
      position: {
        line,
        column: 0
      }
    },
    sourceFile
  };
}

// Define a type for our mocked similarity calculator
interface MockSimilarityCalculator {
  setThreshold: jest.Mock;
  calculateSimilarity: jest.Mock;
}

describe('DefaultSyntacticAnalyzer', () => {
  let analyzer: DefaultSyntacticAnalyzer;
  let mockASTs: AST[];
  let mockCalculator: MockSimilarityCalculator;

  beforeEach(() => {
    // Create a new analyzer instance for each test
    analyzer = new DefaultSyntacticAnalyzer(0.8);

    // Create mock ASTs
    mockASTs = [
      createMockAST('file1.ts', 10, 1),
      createMockAST('file2.ts', 10, 5),
      createMockAST('file3.ts', 15, 10)
    ];

    // Create mock calculator
    mockCalculator = {
      setThreshold: jest.fn(),
      calculateSimilarity: jest.fn().mockImplementation((ast1: AST, ast2: AST) => {
        if ((ast1.sourceFile === 'file1.ts' && ast2.sourceFile === 'file3.ts') ||
            (ast1.sourceFile === 'file3.ts' && ast2.sourceFile === 'file1.ts')) {
          return {
            score: 0.85,
            confidence: 0.9,
            type: 'syntactic',
            details: {
              commonTokens: 8
            }
          };
        }
        // All other combinations are not similar enough
        return {
          score: 0.5,
          confidence: 0.7,
          type: 'syntactic',
          details: {
            commonTokens: 5
          }
        };
      })
    };

    // Assign the mock calculator to the analyzer using property descriptor
    // This es una técnica para acceder a propiedades privadas en pruebas
    Object.defineProperty(analyzer, 'similarityCalculator', {
      value: mockCalculator,
      writable: true
    });
  });

  describe('detectExactDuplicates', () => {
    it('should return empty array for less than 2 ASTs', () => {
      const result = analyzer.detectExactDuplicates([mockASTs[0]]);
      expect(result).toEqual([]);
    });

    it('should detect exact duplicates based on hash', () => {
      const result = analyzer.detectExactDuplicates(mockASTs);

      // Should find one duplication group with 2 instances (file1 and file2)
      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.IDENTICAL);
      expect(result[0].similarity.score).toBe(1.0);
      expect(result[0].instances.length).toBe(2);
      expect(result[0].instances.map(i => i.file)).toContain('file1.ts');
      expect(result[0].instances.map(i => i.file)).toContain('file2.ts');
    });
  });

  describe('detectSimilarCode', () => {
    it('should return empty array for less than 2 ASTs', () => {
      const result = analyzer.detectSimilarCode([mockASTs[0]], 0.8);
      expect(result).toEqual([]);
    });

    it('should detect similar code based on threshold', () => {
      const result = analyzer.detectSimilarCode(mockASTs, 0.8);

      // Should find one similar code duplication between file1 and file3
      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.SIMILAR);
      expect(result[0].similarity.score).toBe(0.85);
      expect(result[0].instances.length).toBe(2);

      const fileNames = result[0].instances.map(i => i.file);
      expect(fileNames).toContain('file1.ts');
      expect(fileNames).toContain('file3.ts');
    });

    it('should not include exact duplicates in similar code results', () => {
      // Make all files have similarity of 1.0 (exact duplicates)
      mockCalculator.calculateSimilarity.mockReturnValue({
        score: 1.0,
        confidence: 1.0,
        type: 'syntactic',
        details: {
          commonTokens: 10
        }
      } as SimilarityScore);

      const result = analyzer.detectSimilarCode(mockASTs, 0.8);

      // Should not find any similar code (because they're exact duplicates)
      expect(result.length).toBe(0);
    });
  });
});
