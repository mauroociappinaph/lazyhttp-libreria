import { TreeSimilarityCalculator } from "../../../duplicate-detector/core/similarity-calculator";
import {
  AST,
  ASTNode,
  DuplicateDetectionError,
  ErrorType,
} from "../../../duplicate-detector/types/index";

describe("TreeSimilarityCalculator", () => {
  let calculator: TreeSimilarityCalculator;

  beforeEach(() => {
    calculator = new TreeSimilarityCalculator();
  });

  describe("constructor and configuration", () => {
    it("should create calculator with default threshold", () => {
      expect(calculator).toBeDefined();
    });

    it("should create calculator with custom threshold", () => {
      const customCalculator = new TreeSimilarityCalculator(0.9);
      expect(customCalculator).toBeDefined();
    });

    it("should set threshold correctly", () => {
      calculator.setThreshold(0.7);
      // Threshold is private, but we can test it indirectly through behavior
      expect(() => calculator.setThreshold(0.7)).not.toThrow();
    });

    it("should throw error for invalid threshold", () => {
      expect(() => calculator.setThreshold(-0.1)).toThrow(
        DuplicateDetectionError
      );
      expect(() => calculator.setThreshold(1.1)).toThrow(
        DuplicateDetectionError
      );
    });
  });

  describe("calculateSimilarity", () => {
    let simpleAST1: AST;
    let simpleAST2: AST;
    let identicalAST: AST;
    let differentAST: AST;

    beforeEach(() => {
      // Create simple AST structures for testing
      simpleAST1 = createSimpleAST(
        "function add(a, b) { return a + b; }",
        "test1.ts"
      );
      simpleAST2 = createSimpleAST(
        "function add(x, y) { return x + y; }",
        "test2.ts"
      );
      identicalAST = createSimpleAST(
        "function add(a, b) { return a + b; }",
        "test3.ts"
      );
      differentAST = createComplexAST(
        "class Calculator { multiply(a, b) { return a * b; } }",
        "test4.ts"
      );
    });

    it("should calculate similarity between identical ASTs", () => {
      const similarity = calculator.calculateSimilarity(
        simpleAST1,
        identicalAST
      );

      expect(similarity.score).toBeGreaterThan(0.8);
      expect(similarity.confidence).toBeGreaterThan(0.7);
      expect(similarity.type).toBe("syntactic");
      expect(similarity.details).toBeDefined();
      expect(similarity.details.editDistance).toBeDefined();
      expect(similarity.details.commonTokens).toBeGreaterThan(0);
    });

    it("should calculate similarity between similar ASTs", () => {
      const similarity = calculator.calculateSimilarity(simpleAST1, simpleAST2);

      expect(similarity.score).toBeGreaterThan(0.6);
      expect(similarity.score).toBeLessThan(1.0);
      expect(similarity.confidence).toBeGreaterThan(0.5);
      expect(["syntactic", "semantic", "structural"]).toContain(
        similarity.type
      );
    });

    it("should calculate low similarity between different ASTs", () => {
      const similarity = calculator.calculateSimilarity(
        simpleAST1,
        differentAST
      );

      expect(similarity.score).toBeLessThan(0.5);
      expect(similarity.confidence).toBeGreaterThan(0);
      expect(["semantic", "structural"]).toContain(similarity.type);
    });

    it("should handle empty ASTs", () => {
      const emptyAST1 = createEmptyAST("empty1.ts");
      const emptyAST2 = createEmptyAST("empty2.ts");

      const similarity = calculator.calculateSimilarity(emptyAST1, emptyAST2);

      expect(similarity.score).toBe(1);
      expect(similarity.confidence).toBeGreaterThan(0.8);
    });

    it("should handle ASTs of different sizes", () => {
      const smallAST = createSimpleAST("const x = 1;", "small.ts");
      const largeAST = createComplexAST(
        `
        class LargeClass {
          method1() { return 1; }
          method2() { return 2; }
          method3() { return 3; }
        }
      `,
        "large.ts"
      );

      const similarity = calculator.calculateSimilarity(smallAST, largeAST);

      expect(similarity.score).toBeLessThan(0.5);
      expect(similarity.confidence).toBeGreaterThan(0);
    });

    it("should return consistent results for same input", () => {
      const similarity1 = calculator.calculateSimilarity(
        simpleAST1,
        simpleAST2
      );
      const similarity2 = calculator.calculateSimilarity(
        simpleAST1,
        simpleAST2
      );

      expect(similarity1.score).toBe(similarity2.score);
      expect(similarity1.confidence).toBe(similarity2.confidence);
      expect(similarity1.type).toBe(similarity2.type);
    });

    it("should be symmetric", () => {
      const similarity1 = calculator.calculateSimilarity(
        simpleAST1,
        simpleAST2
      );
      const similarity2 = calculator.calculateSimilarity(
        simpleAST2,
        simpleAST1
      );

      expect(Math.abs(similarity1.score - similarity2.score)).toBeLessThan(
        0.01
      );
    });
  });

  describe("tree edit distance calculation", () => {
    it("should calculate zero distance for identical trees", () => {
      const ast1 = createSimpleAST("const x = 1;", "test1.ts");
      const ast2 = createSimpleAST("const x = 1;", "test2.ts");

      const similarity = calculator.calculateSimilarity(ast1, ast2);

      expect(similarity.details.editDistance).toBe(0);
    });

    it("should calculate positive distance for different trees", () => {
      const ast1 = createSimpleAST("const x = 1;", "test1.ts");
      const ast2 = createSimpleAST("const y = 2;", "test2.ts");

      const similarity = calculator.calculateSimilarity(ast1, ast2);

      expect(similarity.details.editDistance).toBeGreaterThan(0);
    });

    it("should handle complex nested structures", () => {
      const ast1 = createComplexAST(
        `
        function outer() {
          function inner() {
            return 42;
          }
          return inner();
        }
      `,
        "nested1.ts"
      );

      const ast2 = createComplexAST(
        `
        function outer() {
          function inner() {
            return 43;
          }
          return inner();
        }
      `,
        "nested2.ts"
      );

      const similarity = calculator.calculateSimilarity(ast1, ast2);

      expect(similarity.score).toBeGreaterThan(0.7);
      expect(similarity.details.editDistance).toBeGreaterThan(0);
      expect(similarity.details.editDistance).toBeLessThan(10);
    });
  });

  describe("similarity types", () => {
    it("should identify syntactic similarity", () => {
      const ast1 = createSimpleAST(
        "function test() { return true; }",
        "test1.ts"
      );
      const ast2 = createSimpleAST(
        "function test() { return true; }",
        "test2.ts"
      );

      const similarity = calculator.calculateSimilarity(ast1, ast2);

      expect(similarity.type).toBe("syntactic");
    });

    it("should identify structural similarity", () => {
      const ast1 = createComplexAST(
        `
        class TestClass {
          method1() { return 1; }
          method2() { return 2; }
        }
      `,
        "struct1.ts"
      );

      const ast2 = createComplexAST(
        `
        class TestClass {
          method1() { return 'one'; }
          method2() { return 'two'; }
        }
      `,
        "struct2.ts"
      );

      const similarity = calculator.calculateSimilarity(ast1, ast2);

      expect(["structural", "syntactic"]).toContain(similarity.type);
    });

    it("should identify semantic similarity", () => {
      const ast1 = createSimpleAST("const result = a + b;", "sem1.ts");
      const ast2 = createComplexAST(
        "class Math { add(x, y) { return x + y; } }",
        "sem2.ts"
      );

      const similarity = calculator.calculateSimilarity(ast1, ast2);

      expect(["semantic", "structural"]).toContain(similarity.type);
    });
  });

  describe("performance", () => {
    it("should handle large ASTs efficiently", () => {
      const largeAST1 = createLargeAST("large1.ts");
      const largeAST2 = createLargeAST("large2.ts");

      const startTime = Date.now();
      const similarity = calculator.calculateSimilarity(largeAST1, largeAST2);
      const endTime = Date.now();

      expect(similarity).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should use memoization effectively", () => {
      const ast1 = createComplexAST(
        `
        function recursive(n) {
          if (n <= 1) return 1;
          return recursive(n-1) + recursive(n-2);
        }
      `,
        "rec1.ts"
      );

      const ast2 = createComplexAST(
        `
        function recursive(n) {
          if (n <= 1) return 1;
          return recursive(n-1) + recursive(n-2);
        }
      `,
        "rec2.ts"
      );

      const startTime = Date.now();
      calculator.calculateSimilarity(ast1, ast2);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should be fast due to memoization
    });
  });

  describe("error handling", () => {
    it("should handle malformed ASTs gracefully", () => {
      const malformedAST: AST = {
        nodeCount: 1,
        root: null as any,
        sourceFile: "malformed.ts",
      };

      const validAST = createSimpleAST("const x = 1;", "valid.ts");

      expect(() =>
        calculator.calculateSimilarity(malformedAST, validAST)
      ).toThrow(DuplicateDetectionError);
    });

    it("should provide meaningful error messages", () => {
      const malformedAST: AST = {
        nodeCount: 1,
        root: null as any,
        sourceFile: "malformed.ts",
      };

      const validAST = createSimpleAST("const x = 1;", "valid.ts");

      try {
        calculator.calculateSimilarity(malformedAST, validAST);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(DuplicateDetectionError);
        expect((error as DuplicateDetectionError).type).toBe(
          ErrorType.ANALYSIS_TIMEOUT
        );
      }
    });
  });
});

// Helper functions to create test ASTs
function createSimpleAST(code: string, filename: string): AST {
  const tokens = tokenize(code);
  const root = createASTNodeFromTokens(tokens);

  return {
    nodeCount: countNodes(root),
    root,
    sourceFile: filename,
  };
}

function createComplexAST(code: string, filename: string): AST {
  const tokens = tokenize(code);
  const root = createComplexASTNodeFromTokens(tokens);

  return {
    nodeCount: countNodes(root),
    root,
    sourceFile: filename,
  };
}

function createEmptyAST(filename: string): AST {
  const root: ASTNode = {
    type: "SourceFile",
    children: [],
    value: undefined,
    position: { line: 1, column: 1 },
  };

  return {
    nodeCount: 1,
    root,
    sourceFile: filename,
  };
}

function createLargeAST(filename: string): AST {
  const children: ASTNode[] = [];

  // Create a large AST with many nodes
  for (let i = 0; i < 100; i++) {
    children.push({
      type: "FunctionDeclaration",
      children: [
        {
          type: "Identifier",
          children: [],
          value: `func${i}`,
          position: { line: i + 1, column: 1 },
        },
        {
          type: "Block",
          children: [
            {
              type: "ReturnStatement",
              children: [
                {
                  type: "NumericLiteral",
                  children: [],
                  value: i.toString(),
                  position: { line: i + 1, column: 10 },
                },
              ],
              value: undefined,
              position: { line: i + 1, column: 5 },
            },
          ],
          value: undefined,
          position: { line: i + 1, column: 15 },
        },
      ],
      value: undefined,
      position: { line: i + 1, column: 1 },
    });
  }

  const root: ASTNode = {
    type: "SourceFile",
    children,
    value: undefined,
    position: { line: 1, column: 1 },
  };

  return {
    nodeCount: countNodes(root),
    root,
    sourceFile: filename,
  };
}

function tokenize(code: string): string[] {
  // Simple tokenizer for testing
  return code.split(/\s+/).filter((token) => token.length > 0);
}

function createASTNodeFromTokens(tokens: string[]): ASTNode {
  if (tokens.length === 0) {
    return {
      type: "SourceFile",
      children: [],
      value: undefined,
      position: { line: 1, column: 1 },
    };
  }

  const children: ASTNode[] = tokens.map((token, index) => ({
    type: getTokenType(token),
    children: [],
    value: token,
    position: { line: 1, column: index + 1 },
  }));

  return {
    type: "SourceFile",
    children,
    value: undefined,
    position: { line: 1, column: 1 },
  };
}

function createComplexASTNodeFromTokens(tokens: string[]): ASTNode {
  const children: ASTNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "function" || token === "class") {
      const name = tokens[i + 1] || "anonymous";
      const functionNode: ASTNode = {
        type: token === "function" ? "FunctionDeclaration" : "ClassDeclaration",
        children: [
          {
            type: "Identifier",
            children: [],
            value: name,
            position: { line: 1, column: i + 2 },
          },
        ],
        value: undefined,
        position: { line: 1, column: i + 1 },
      };
      children.push(functionNode);
      i += 2;
    } else {
      children.push({
        type: getTokenType(token),
        children: [],
        value: token,
        position: { line: 1, column: i + 1 },
      });
      i++;
    }
  }

  return {
    type: "SourceFile",
    children,
    value: undefined,
    position: { line: 1, column: 1 },
  };
}

function getTokenType(token: string): string {
  if (/^\d+$/.test(token)) return "NumericLiteral";
  if (/^".*"$/.test(token) || /^'.*'$/.test(token)) return "StringLiteral";
  if (
    [
      "function",
      "class",
      "const",
      "let",
      "var",
      "return",
      "if",
      "else",
    ].includes(token)
  )
    return "Keyword";
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) return "Identifier";
  return "Operator";
}

function countNodes(node: ASTNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}
