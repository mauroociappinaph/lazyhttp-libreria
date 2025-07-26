// Tests for structural analyzer
import { DefaultStructuralAnalyzer } from "../../../duplicate-detector/analyzers/structural-analyzer";
import {
    ClassNode,
    DuplicationType,
    FunctionNode,
    ParameterNode,
    PropertyNode,
} from "../../../duplicate-detector/types";

// Mock the uuid module
jest.mock("uuid", () => ({
  v4: () => "test-uuid-structural",
}));

// Mock the hash utils
jest.mock("../../../duplicate-detector/utils/hash-utils", () => ({
  generateHash: (input: string) => `hash-${input.length}`,
}));

describe("DefaultStructuralAnalyzer", () => {
  let analyzer: DefaultStructuralAnalyzer;

  beforeEach(() => {
    analyzer = new DefaultStructuralAnalyzer();
  });

  // Helper function to create mock parameter nodes
  function createMockParameter(name: string, type?: string): ParameterNode {
    return {
      type: "Parameter",
      children: [],
      position: { line: 1, column: 1 },
      name,
      parameterType: type,
      isOptional: false,
    };
  }

  // Helper function to create mock function nodes
  function createMockFunction(
    name: string,
    parameters: ParameterNode[] = [],
    returnType?: string,
    isAsync: boolean = false
  ): FunctionNode {
    return {
      type: "FunctionDeclaration",
      children: [],
      position: { line: 1, column: 1 },
      name,
      parameters,
      returnType,
      body: [],
      isAsync,
      isExported: false,
    };
  }

  // Helper function to create mock property nodes
  function createMockProperty(
    name: string,
    type?: string,
    isPrivate: boolean = false,
    isStatic: boolean = false
  ): PropertyNode {
    return {
      type: "PropertyDeclaration",
      children: [],
      position: { line: 1, column: 1 },
      name,
      propertyType: type,
      isPrivate,
      isStatic,
    };
  }

  // Helper function to create mock class nodes
  function createMockClass(
    name: string,
    methods: FunctionNode[] = [],
    properties: PropertyNode[] = [],
    extendsClass?: string,
    implementsInterfaces?: string[]
  ): ClassNode {
    return {
      type: "ClassDeclaration",
      children: [],
      position: { line: 1, column: 1 },
      name,
      methods,
      properties,
      extends: extendsClass,
      implements: implementsInterfaces,
      isExported: false,
    };
  }

  describe("detectStructuralDuplicates", () => {
    it("should return empty array for less than 2 classes", () => {
      const class1 = createMockClass("TestClass");
      const result = analyzer.detectStructuralDuplicates([class1]);
      expect(result).toEqual([]);
    });

    it("should return empty array for empty input", () => {
      const result = analyzer.detectStructuralDuplicates([]);
      expect(result).toEqual([]);
    });

    it("should detect structural duplicates between similar classes", () => {
      const method1 = createMockFunction("process", [createMockParameter("data", "string")], "void");
      const method2 = createMockFunction("validate", [], "boolean");
      const property1 = createMockProperty("name", "string");

      const class1 = createMockClass("UserService", [method1, method2], [property1]);
      const class2 = createMockClass("ProductService", [method1, method2], [property1]);

      const result = analyzer.detectStructuralDuplicates([class1, class2]);

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.STRUCTURAL);
      expect(result[0].similarity.type).toBe("structural");
      expect(result[0].similarity.score).toBeGreaterThan(0.75);
      expect(result[0].instances.length).toBe(2);
      expect(result[0].suggestion?.type).toBe("create-abstract-class");
    });

    it("should not detect duplicates for dissimilar classes", () => {
      const method1 = createMockFunction("process", [createMockParameter("data", "string")]);
      const method2 = createMockFunction("completely", [createMockParameter("different", "number")]);
      const property1 = createMockProperty("name", "string");
      const property2 = createMockProperty("count", "number");

      const class1 = createMockClass("UserService", [method1], [property1]);
      const class2 = createMockClass("ProductService", [method2], [property2]);

      const result = analyzer.detectStructuralDuplicates([class1, class2]);

      expect(result.length).toBe(0);
    });

    it("should consider inheritance in similarity calculation", () => {
      const method1 = createMockFunction("process");
      const class1 = createMockClass("UserService", [method1], [], "BaseService");
      const class2 = createMockClass("ProductService", [method1], [], "BaseService");

      const result = analyzer.detectStructuralDuplicates([class1, class2]);

      expect(result.length).toBe(1);
      expect(result[0].similarity.score).toBeGreaterThan(0.75);
    });

    it("should consider implemented interfaces in similarity calculation", () => {
      const method1 = createMockFunction("process");
      const class1 = createMockClass("UserService", [method1], [], undefined, ["IService", "IValidatable"]);
      const class2 = createMockClass("ProductService", [method1], [], undefined, ["IService", "IValidatable"]);

      const result = analyzer.detectStructuralDuplicates([class1, class2]);

      expect(result.length).toBe(1);
      expect(result[0].similarity.score).toBeGreaterThan(0.75);
    });
  });

  describe("detectArchitecturalPatterns", () => {
    it("should return empty array for less than 2 classes", () => {
      const class1 = createMockClass("TestClass");
      const result = analyzer.detectArchitecturalPatterns([class1]);
      expect(result).toEqual([]);
    });

    it("should detect Factory pattern", () => {
      const createMethod = createMockFunction("createUser", [createMockParameter("data", "UserData")], "User");
      const factoryClass = createMockClass("UserFactory", [createMethod]);

      const buildMethod = createMockFunction("buildProduct", [createMockParameter("spec", "ProductSpec")], "Product");
      const builderClass = createMockClass("ProductFactory", [buildMethod]);

      const result = analyzer.detectArchitecturalPatterns([factoryClass, builderClass]);

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.STRUCTURAL);
      expect(result[0].suggestion?.type).toBe("use-composition");
    });

    it("should detect Singleton pattern", () => {
      const getInstanceMethod1 = createMockFunction("getInstance", [], "DatabaseConnection");
      const constructorMethod1 = createMockFunction("constructor", [], "void");
      const singletonClass1 = createMockClass("DatabaseConnection", [getInstanceMethod1, constructorMethod1]);

      const getInstanceMethod2 = createMockFunction("getInstance", [], "Logger");
      const constructorMethod2 = createMockFunction("constructor", [], "void");
      const singletonClass2 = createMockClass("Logger", [getInstanceMethod2, constructorMethod2]);

      const result = analyzer.detectArchitecturalPatterns([singletonClass1, singletonClass2]);

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.STRUCTURAL);
    });

    it("should detect Strategy pattern", () => {
      const executeMethod = createMockFunction("execute", [createMockParameter("context", "Context")], "Result");

      const strategy1 = createMockClass("ConcreteStrategyA", [executeMethod], [], undefined, ["IStrategy"]);
      const strategy2 = createMockClass("ConcreteStrategyB", [executeMethod], [], undefined, ["IStrategy"]);
      const strategy3 = createMockClass("ConcreteStrategyC", [executeMethod], [], undefined, ["IStrategy"]);

      const result = analyzer.detectArchitecturalPatterns([strategy1, strategy2, strategy3]);

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.STRUCTURAL);
      expect(result[0].instances.length).toBe(3);
    });

    it("should not detect patterns with low confidence", () => {
      const regularMethod = createMockFunction("regularMethod");
      const class1 = createMockClass("RegularClass1", [regularMethod]);
      const class2 = createMockClass("RegularClass2", [regularMethod]);

      const result = analyzer.detectArchitecturalPatterns([class1, class2]);

      expect(result.length).toBe(0);
    });
  });

  describe("detectCrossClassMethodDuplication", () => {
    it("should return empty array for less than 2 classes", () => {
      const class1 = createMockClass("TestClass");
      const result = analyzer.detectCrossClassMethodDuplication([class1]);
      expect(result).toEqual([]);
    });

    it("should detect methods with identical signatures across classes", () => {
      const method1 = createMockFunction("validate", [createMockParameter("input", "string")], "boolean");
      const method2 = createMockFunction("validate", [createMockParameter("input", "string")], "boolean");

      const class1 = createMockClass("UserValidator", [method1]);
      const class2 = createMockClass("ProductValidator", [method2]);

      const result = analyzer.detectCrossClassMethodDuplication([class1, class2]);

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(DuplicationType.STRUCTURAL);
      expect(result[0].similarity.score).toBe(1.0);
      expect(result[0].instances.length).toBe(2);
      expect(result[0].suggestion?.type).toBe("extract-interface");
    });

    it("should detect async method duplications", () => {
      const asyncMethod1 = createMockFunction("fetchData", [createMockParameter("id", "string")], "Promise<Data>", true);
      const asyncMethod2 = createMockFunction("fetchData", [createMockParameter("id", "string")], "Promise<Data>", true);

      const class1 = createMockClass("UserService", [asyncMethod1]);
      const class2 = createMockClass("ProductService", [asyncMethod2]);

      const result = analyzer.detectCrossClassMethodDuplication([class1, class2]);

      expect(result.length).toBe(1);
      expect(result[0].instances.length).toBe(2);
      expect(result[0].instances[0].code).toContain("async");
    });

    it("should not detect methods from the same class as duplication", () => {
      const method1 = createMockFunction("validate", [createMockParameter("input", "string")], "boolean");
      const method2 = createMockFunction("validate", [createMockParameter("input", "string")], "boolean");

      const class1 = createMockClass("Validator", [method1, method2]);

      const result = analyzer.detectCrossClassMethodDuplication([class1]);

      expect(result.length).toBe(0);
    });

    it("should group multiple methods with same signature from different classes", () => {
      const method1 = createMockFunction("process", [createMockParameter("data", "any")], "void");
      const method2 = createMockFunction("process", [createMockParameter("data", "any")], "void");
      const method3 = createMockFunction("process", [createMockParameter("data", "any")], "void");

      const class1 = createMockClass("ProcessorA", [method1]);
      const class2 = createMockClass("ProcessorB", [method2]);
      const class3 = createMockClass("ProcessorC", [method3]);

      const result = analyzer.detectCrossClassMethodDuplication([class1, class2, class3]);

      expect(result.length).toBe(1);
      expect(result[0].instances.length).toBe(3);
    });

    it("should handle methods with different parameter types", () => {
      const method1 = createMockFunction("process", [createMockParameter("data", "string")], "void");
      const method2 = createMockFunction("process", [createMockParameter("data", "number")], "void");

      const class1 = createMockClass("StringProcessor", [method1]);
      const class2 = createMockClass("NumberProcessor", [method2]);

      const result = analyzer.detectCrossClassMethodDuplication([class1, class2]);

      expect(result.length).toBe(0);
    });

    it("should handle methods with different return types", () => {
      const method1 = createMockFunction("getValue", [], "string");
      const method2 = createMockFunction("getValue", [], "number");

      const class1 = createMockClass("StringProvider", [method1]);
      const class2 = createMockClass("NumberProvider", [method2]);

      const result = analyzer.detectCrossClassMethodDuplication([class1, class2]);

      expect(result.length).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle classes with no methods or properties", () => {
      const class1 = createMockClass("EmptyClass1");
      const class2 = createMockClass("EmptyClass2");

      const structuralResult = analyzer.detectStructuralDuplicates([class1, class2]);
      const crossClassResult = analyzer.detectCrossClassMethodDuplication([class1, class2]);
      const architecturalResult = analyzer.detectArchitecturalPatterns([class1, class2]);

      expect(structuralResult.length).toBe(1); // Empty classes are structurally similar
      expect(crossClassResult.length).toBe(0);
      expect(architecturalResult.length).toBe(0);
    });

    it("should handle null or undefined inputs gracefully", () => {
      expect(() => analyzer.detectStructuralDuplicates(null as any)).not.toThrow();
      expect(() => analyzer.detectCrossClassMethodDuplication(undefined as any)).not.toThrow();
      expect(() => analyzer.detectArchitecturalPatterns(null as any)).not.toThrow();
    });

    it("should handle classes with complex inheritance chains", () => {
      const method1 = createMockFunction("process");
      const class1 = createMockClass("DerivedA", [method1], [], "BaseA", ["IProcessable", "IValidatable"]);
      const class2 = createMockClass("DerivedB", [method1], [], "BaseB", ["IProcessable", "IValidatable"]);

      const result = analyzer.detectStructuralDuplicates([class1, class2]);

      expect(result.length).toBe(1);
      expect(result[0].similarity.score).toBeGreaterThan(0.5);
    });
  });
});
