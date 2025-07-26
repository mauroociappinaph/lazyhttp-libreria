// Tests for pattern extractor
import { PatternExtractor } from "../../../../duplicate-detector/analyzers/semantic/pattern-extractor";
import {
  FunctionNode,
  ParameterNode,
  ASTNode,
} from "../../../../duplicate-detector/types";

// Helper function to create mock function nodes for testing
function createMockFunctionNode(
  name: string,
  isAsync: boolean,
  parameters: ParameterNode[] = [],
  returnType?: string,
  bodyNodes: ASTNode[] = []
): FunctionNode {
  return {
    type: "FunctionDeclaration",
    name,
    parameters,
    returnType,
    body: bodyNodes,
    isAsync,
    isExported: false,
    children: [],
    position: {
      line: 1,
      column: 0,
    },
  };
}

// Helper function to create mock AST nodes
function createMockASTNode(
  type: string,
  children: ASTNode[] = [],
  value?: unknown
): ASTNode {
  return {
    type,
    children,
    value,
    position: {
      line: 1,
      column: 0,
    },
  };
}

// Helper function to create mock parameter nodes
function createMockParameterNode(
  name: string,
  parameterType?: string
): ParameterNode {
  return {
    name,
    parameterType,
    isOptional: false,
    type: "Parameter",
    children: [],
    position: {
      line: 1,
      column: 0,
    },
  };
}

describe("PatternExtractor", () => {
  let extractor: PatternExtractor;
  let mockFunctions: FunctionNode[];

  beforeEach(() => {
    extractor = new PatternExtractor();

    // Create mock functions with different patterns
    mockFunctions = [
      // Function 1: Simple data processing with conditional and loop
      createMockFunctionNode(
        "processData",
        false,
        [createMockParameterNode("data", "any[]")],
        "any[]",
        [
          createMockASTNode("IfStatement", [
            createMockASTNode("BinaryExpression", [], "==="),
            createMockASTNode("BlockStatement", [
              createMockASTNode("ReturnStatement", [
                createMockASTNode("ArrayExpression"),
              ]),
            ]),
          ]),
          createMockASTNode("ForStatement", [
            createMockASTNode("BlockStatement", [
              createMockASTNode("AssignmentExpression"),
              createMockASTNode("CallExpression"),
            ]),
          ]),
          createMockASTNode("ReturnStatement", [
            createMockASTNode("Identifier", [], "result"),
          ]),
        ]
      ),

      // Function 2: Async API call with error handling
      createMockFunctionNode(
        "fetchData",
        true,
        [createMockParameterNode("url", "string")],
        "Promise<any>",
        [
          createMockASTNode("TryStatement", [
            createMockASTNode("BlockStatement", [
              createMockASTNode("AwaitExpression", [
                createMockASTNode("CallExpression"),
              ]),
              createMockASTNode("ReturnStatement"),
            ]),
            createMockASTNode("CatchClause", [
              createMockASTNode("BlockStatement", [
                createMockASTNode("ThrowStatement"),
              ]),
            ]),
          ]),
        ]
      ),
    ];
  });

  describe("extractLogicPattern", () => {
    it("should extract logic pattern from function node", () => {
      const pattern = extractor.extractLogicPattern(mockFunctions[0]);

      expect(pattern).toBeDefined();
      expect(pattern.signature).toContain("fn(1):sync:return");
      expect(pattern.complexity).toBeGreaterThan(1);
      expect(pattern.operations).toContain("return");
      expect(pattern.controlFlow).toContain("conditional");
    });

    it("should extract different patterns for different function structures", () => {
      const pattern1 = extractor.extractLogicPattern(mockFunctions[0]);
      const pattern2 = extractor.extractLogicPattern(mockFunctions[1]);

      expect(pattern1.signature).not.toEqual(pattern2.signature);
      expect(pattern1.operations).not.toEqual(pattern2.operations);
      expect(pattern1.controlFlow).not.toEqual(pattern2.controlFlow);
    });

    it("should include async information in pattern signature", () => {
      const pattern = extractor.extractLogicPattern(mockFunctions[1]);

      expect(pattern.signature).toContain("async");
      expect(pattern.controlFlow).toContain("exception-handling");
    });
  });
});
