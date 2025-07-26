import { TypeScriptASTParser } from "../../../duplicate-detector/core/ast-parser";
import {
  DuplicateDetectionError,
  ErrorType,
} from "../../../duplicate-detector/types/index";
import * as fs from "fs/promises";
import * as path from "path";

describe("TypeScriptASTParser", () => {
  let parser: TypeScriptASTParser;
  const testFilesDir = path.join(__dirname, "../../fixtures/ast-test-files");

  beforeAll(async () => {
    parser = new TypeScriptASTParser();

    // Create test files directory
    await fs.mkdir(testFilesDir, { recursive: true });

    // Create test TypeScript files
    await createTestFiles();
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(testFilesDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("parseFile", () => {
    it("should parse a simple TypeScript file", async () => {
      const filePath = path.join(testFilesDir, "simple.ts");
      const ast = await parser.parseFile(filePath);

      expect(ast).toBeDefined();
      expect(ast.sourceFile).toBe(filePath);
      expect(ast.root).toBeDefined();
      expect(ast.nodeCount).toBeGreaterThan(0);
      expect(ast.root.type).toBe("SourceFile");
    });

    it("should parse a file with functions", async () => {
      const filePath = path.join(testFilesDir, "functions.ts");
      const ast = await parser.parseFile(filePath);

      expect(ast).toBeDefined();
      expect(ast.nodeCount).toBeGreaterThan(10);

      // Should contain function declarations
      const hasFunctionDeclaration = containsNodeType(
        ast.root,
        "FunctionDeclaration"
      );
      expect(hasFunctionDeclaration).toBe(true);
    });

    it("should parse a file with classes", async () => {
      const filePath = path.join(testFilesDir, "classes.ts");
      const ast = await parser.parseFile(filePath);

      expect(ast).toBeDefined();

      // Should contain class declarations
      const hasClassDeclaration = containsNodeType(
        ast.root,
        "ClassDeclaration"
      );
      expect(hasClassDeclaration).toBe(true);
    });

    it("should handle JavaScript files", async () => {
      const filePath = path.join(testFilesDir, "simple.js");
      const ast = await parser.parseFile(filePath);

      expect(ast).toBeDefined();
      expect(ast.sourceFile).toBe(filePath);
      expect(ast.root.type).toBe("SourceFile");
    });

    it("should throw error for non-existent file", async () => {
      const filePath = path.join(testFilesDir, "non-existent.ts");

      await expect(parser.parseFile(filePath)).rejects.toThrow(
        DuplicateDetectionError
      );
      await expect(parser.parseFile(filePath)).rejects.toThrow(
        ErrorType.PARSE_ERROR
      );
    });

    it("should handle files with syntax errors gracefully", async () => {
      const filePath = path.join(testFilesDir, "syntax-error.ts");

      // TypeScript compiler is quite forgiving, so this might not throw
      // but if it does, it should be a proper error
      try {
        const ast = await parser.parseFile(filePath);
        expect(ast).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(DuplicateDetectionError);
      }
    });
  });

  describe("normalizeAST", () => {
    it("should normalize AST by removing position information", async () => {
      const filePath = path.join(testFilesDir, "simple.ts");
      const ast = await parser.parseFile(filePath);
      const normalizedAST = parser.normalizeAST(ast);

      expect(normalizedAST.normalized).toBe(true);
      expect(normalizedAST.hash).toBeDefined();
      expect(typeof normalizedAST.hash).toBe("string");

      // All positions should be normalized to (0, 0)
      const allPositionsNormalized = checkAllPositionsNormalized(
        normalizedAST.root
      );
      expect(allPositionsNormalized).toBe(true);
    });

    it("should generate consistent hashes for identical normalized ASTs", async () => {
      const filePath1 = path.join(testFilesDir, "identical1.ts");
      const filePath2 = path.join(testFilesDir, "identical2.ts");

      const ast1 = await parser.parseFile(filePath1);
      const ast2 = await parser.parseFile(filePath2);

      const normalized1 = parser.normalizeAST(ast1);
      const normalized2 = parser.normalizeAST(ast2);

      expect(normalized1.hash).toBe(normalized2.hash);
    });

    it("should generate different hashes for different ASTs", async () => {
      const filePath1 = path.join(testFilesDir, "simple.ts");
      const filePath2 = path.join(testFilesDir, "functions.ts");

      const ast1 = await parser.parseFile(filePath1);
      const ast2 = await parser.parseFile(filePath2);

      const normalized1 = parser.normalizeAST(ast1);
      const normalized2 = parser.normalizeAST(ast2);

      expect(normalized1.hash).not.toBe(normalized2.hash);
    });
  });

  describe("extractMetadata", () => {
    it("should extract function metadata", async () => {
      const filePath = path.join(testFilesDir, "functions.ts");
      const ast = await parser.parseFile(filePath);
      const metadata = parser.extractMetadata(ast);

      expect(metadata.filePath).toBe(filePath);
      expect(metadata.functions).toBeDefined();
      expect(metadata.functions.length).toBeGreaterThan(0);

      const func = metadata.functions[0];
      expect(func.name).toBeDefined();
      expect(func.parameters).toBeDefined();
      expect(func.body).toBeDefined();
      expect(typeof func.isAsync).toBe("boolean");
      expect(typeof func.isExported).toBe("boolean");
    });

    it("should extract class metadata", async () => {
      const filePath = path.join(testFilesDir, "classes.ts");
      const ast = await parser.parseFile(filePath);
      const metadata = parser.extractMetadata(ast);

      expect(metadata.classes).toBeDefined();
      expect(metadata.classes.length).toBeGreaterThan(0);

      const cls = metadata.classes[0];
      expect(cls.name).toBeDefined();
      expect(cls.methods).toBeDefined();
      expect(cls.properties).toBeDefined();
      expect(typeof cls.isExported).toBe("boolean");
    });

    it("should extract import/export metadata", async () => {
      const filePath = path.join(testFilesDir, "imports-exports.ts");
      const ast = await parser.parseFile(filePath);
      const metadata = parser.extractMetadata(ast);

      expect(metadata.imports).toBeDefined();
      expect(metadata.exports).toBeDefined();

      if (metadata.imports.length > 0) {
        const imp = metadata.imports[0];
        expect(imp.source).toBeDefined();
        expect(imp.imports).toBeDefined();
        expect(typeof imp.isDefault).toBe("boolean");
      }

      if (metadata.exports.length > 0) {
        const exp = metadata.exports[0];
        expect(exp.name).toBeDefined();
        expect(typeof exp.isDefault).toBe("boolean");
        expect(["function", "class", "variable", "type"]).toContain(exp.type);
      }
    });

    it("should calculate line and token counts", async () => {
      const filePath = path.join(testFilesDir, "functions.ts");
      const ast = await parser.parseFile(filePath);
      const metadata = parser.extractMetadata(ast);

      expect(metadata.lineCount).toBeGreaterThan(0);
      expect(metadata.tokenCount).toBeGreaterThan(0);
      expect(metadata.tokenCount).toBe(ast.nodeCount);
    });
  });

  describe("error handling", () => {
    it("should handle parsing errors gracefully", async () => {
      const filePath = path.join(testFilesDir, "non-existent.ts");

      await expect(parser.parseFile(filePath)).rejects.toThrow(
        DuplicateDetectionError
      );
    });

    it("should handle normalization errors gracefully", () => {
      const invalidAST = {
        nodeCount: 1,
        root: null as any,
        sourceFile: "test.ts",
      };

      expect(() => parser.normalizeAST(invalidAST)).toThrow(
        DuplicateDetectionError
      );
    });

    it("should handle metadata extraction errors gracefully", () => {
      const invalidAST = {
        nodeCount: 1,
        root: null as any,
        sourceFile: "test.ts",
      };

      expect(() => parser.extractMetadata(invalidAST)).toThrow(
        DuplicateDetectionError
      );
    });
  });

  describe("complex scenarios", () => {
    it("should handle large files efficiently", async () => {
      const filePath = path.join(testFilesDir, "large-file.ts");

      const startTime = Date.now();
      const ast = await parser.parseFile(filePath);
      const parseTime = Date.now() - startTime;

      expect(ast).toBeDefined();
      expect(parseTime).toBeLessThan(5000); // Should parse within 5 seconds
    });

    it("should handle files with complex nested structures", async () => {
      const filePath = path.join(testFilesDir, "complex-nested.ts");
      const ast = await parser.parseFile(filePath);
      const metadata = parser.extractMetadata(ast);

      expect(ast.nodeCount).toBeGreaterThan(50);
      expect(
        metadata.functions.length + metadata.classes.length
      ).toBeGreaterThan(0);
    });
  });
});

// Helper functions
function containsNodeType(node: any, nodeType: string): boolean {
  if (node.type === nodeType) {
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (containsNodeType(child, nodeType)) {
        return true;
      }
    }
  }

  return false;
}

function checkAllPositionsNormalized(node: any): boolean {
  if (node.position.line !== 0 || node.position.column !== 0) {
    return false;
  }

  if (node.children) {
    for (const child of node.children) {
      if (!checkAllPositionsNormalized(child)) {
        return false;
      }
    }
  }

  return true;
}

// Create test files
async function createTestFiles() {
  const testFiles = {
    "simple.ts": `
const message = "Hello, World!";
console.log(message);
`,
    "simple.js": `
const message = "Hello, World!";
console.log(message);
`,
    "functions.ts": `
function add(a: number, b: number): number {
  return a + b;
}

const multiply = (x: number, y: number): number => {
  return x * y;
}

async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}
`,
    "classes.ts": `
export class Calculator {
  private history: number[] = [];

  constructor(private precision: number = 2) {}

  add(a: number, b: number): number {
    const result = a + b;
    this.history.push(result);
    return Number(result.toFixed(this.precision));
  }

  static create(precision?: number): Calculator {
    return new Calculator(precision);
  }

  get lastResult(): number | undefined {
    return this.history[this.history.length - 1];
  }
}

class AdvancedCalculator extends Calculator implements Serializable {
  constructor(precision: number = 4) {
    super(precision);
  }

  serialize(): string {
    return JSON.stringify(this.history);
  }
}

interface Serializable {
  serialize(): string;
}
`,
    "imports-exports.ts": `
import { Calculator } from './classes';
import * as utils from './utils';
import defaultExport from './default';

export const PI = 3.14159;
export function square(x: number): number {
  return x * x;
}

export default class MathUtils {
  static readonly E = 2.71828;
}

export { Calculator as Calc };
`,
    "syntax-error.ts": `
function broken(
  // Missing closing parenthesis and body
`,
    "identical1.ts": `
function test() {
  return 42;
}
`,
    "identical2.ts": `
function test() {
  return 42;
}
`,
    "large-file.ts": generateLargeFile(),
    "complex-nested.ts": `
namespace MyNamespace {
  export class OuterClass {
    private innerInstance = new InnerClass();

    class InnerClass {
      private data: Map<string, () => Promise<void>> = new Map();

      async processData<T extends Record<string, any>>(
        input: T,
        processor: (item: T[keyof T]) => Promise<boolean>
      ): Promise<T[]> {
        const results: T[] = [];

        for (const [key, value] of Object.entries(input)) {
          try {
            const shouldInclude = await processor(value);
            if (shouldInclude) {
              results.push({ [key]: value } as T);
            }
          } catch (error) {
            console.error(\`Error processing \${key}:\`, error);
          }
        }

        return results;
      }
    }

    public async execute(): Promise<void> {
      const data = { a: 1, b: 2, c: 3 };
      await this.innerInstance.processData(data, async (item) => item > 1);
    }
  }
}
`,
  };

  const testFilesDir = path.join(__dirname, "../../fixtures/ast-test-files");

  for (const [filename, content] of Object.entries(testFiles)) {
    const filePath = path.join(testFilesDir, filename);
    await fs.writeFile(filePath, content.trim());
  }
}

function generateLargeFile(): string {
  let content = "";

  // Generate many functions
  for (let i = 0; i < 100; i++) {
    content += `
function func${i}(param1: number, param2: string = "default"): boolean {
  const localVar = param1 * ${i};
  if (localVar > 50) {
    return param2.length > localVar;
  }
  return false;
}
`;
  }

  // Generate a large class
  content += `
export class LargeClass {
  private data: Record<string, any> = {};
`;

  for (let i = 0; i < 50; i++) {
    content += `
  method${i}(input: any): any {
    this.data['key${i}'] = input;
    return this.data;
  }
`;
  }

  content += "}";

  return content;
}
