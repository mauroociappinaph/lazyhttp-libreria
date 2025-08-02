// Structural duplication analysis

import { v4 as uuidv4 } from 'uuid';
import {
  ClassNode,
  CodeInstance,
  Duplication,
  DuplicationType,
  FunctionNode,
  PropertyNode,
  RefactoringSuggestion,
  SimilarityScore
} from '../types/index.js';
import { generateHash } from '../utils/hash-utils.js';

export interface StructuralAnalyzer {
  detectStructuralDuplicates(classes: ClassNode[]): Duplication[];
  detectArchitecturalPatterns(classes: ClassNode[]): Duplication[];
  detectCrossClassMethodDuplication(classes: ClassNode[]): Duplication[];
}

/**
 * Represents the structural signature of a class
 */
interface ClassStructure {
  className: string;
  methodSignatures: string[];
  propertySignatures: string[];
  inheritanceChain: string[];
  implementedInterfaces: string[];
  structuralHash: string;
  classNode: ClassNode;
}

/**
 * Represents a method signature for comparison
 */
interface MethodSignature {
  name: string;
  parameterTypes: string[];
  returnType: string;
  isAsync: boolean;
  isStatic: boolean;
  visibility: 'public' | 'private' | 'protected';
  methodNode: FunctionNode;
  className: string;
}

/**
 * Represents an architectural pattern
 */
interface ArchitecturalPattern {
  patternType: 'factory' | 'singleton' | 'observer' | 'strategy' | 'decorator' | 'adapter' | 'generic';
  classes: ClassNode[];
  confidence: number;
  description: string;
}

export class DefaultStructuralAnalyzer implements StructuralAnalyzer {
  private readonly STRUCTURAL_SIMILARITY_THRESHOLD = 0.75;
  private readonly ARCHITECTURAL_PATTERN_THRESHOLD = 0.8;

  /**
   * Detects structural duplicates between classes
   * @param classes - Array of class nodes to analyze
   * @returns Array of structural duplications found
   */
  detectStructuralDuplicates(classes: ClassNode[]): Duplication[] {
    if (!classes || classes.length < 2) {
      return [];
    }

    const duplications: Duplication[] = [];
    const classStructures = this.extractClassStructures(classes);

    // Compare each pair of classes for structural similarity
    for (let i = 0; i < classStructures.length; i++) {
      for (let j = i + 1; j < classStructures.length; j++) {
        const similarity = this.calculateStructuralSimilarity(
          classStructures[i],
          classStructures[j]
        );

        if (similarity.score >= this.STRUCTURAL_SIMILARITY_THRESHOLD) {
          const duplication = this.createStructuralDuplication(
            classStructures[i],
            classStructures[j],
            similarity
          );
          duplications.push(duplication);
        }
      }
    }

    return duplications;
  }

  /**
   * Detects architectural patterns that might indicate duplication
   * @param classes - Array of class nodes to analyze
   * @returns Array of architectural pattern duplications
   */
  detectArchitecturalPatterns(classes: ClassNode[]): Duplication[] {
    if (!classes || classes.length < 2) {
      return [];
    }

    const duplications: Duplication[] = [];
    const patterns = this.identifyArchitecturalPatterns(classes);

    // Group patterns by type and detect duplicates
    const patternGroups = new Map<string, ArchitecturalPattern[]>();

    for (const pattern of patterns) {
      const key = pattern.patternType;
      if (!patternGroups.has(key)) {
        patternGroups.set(key, []);
      }
      patternGroups.get(key)!.push(pattern);
    }

    // Find duplicate implementations of the same pattern
    for (const [patternType, patternList] of patternGroups) {
      // Multiple patterns of the same type OR a single pattern with multiple classes
      const shouldCreateDuplication = patternList.length > 1 ||
        (patternList.length === 1 && patternList[0].classes.length > 1);

      if (shouldCreateDuplication) {
        const duplication = this.createArchitecturalPatternDuplication(
          patternType,
          patternList
        );
        duplications.push(duplication);
      }
    }

    return duplications;
  }

  /**
   * Detects method duplication across different classes
   * @param classes - Array of class nodes to analyze
   * @returns Array of cross-class method duplications
   */
  detectCrossClassMethodDuplication(classes: ClassNode[]): Duplication[] {
    if (!classes || classes.length < 2) {
      return [];
    }

    const duplications: Duplication[] = [];
    const methodSignatures = this.extractMethodSignatures(classes);

    // Group methods by signature similarity
    const methodGroups = new Map<string, MethodSignature[]>();

    for (const method of methodSignatures) {
      const signatureKey = this.generateMethodSignatureKey(method);
      if (!methodGroups.has(signatureKey)) {
        methodGroups.set(signatureKey, []);
      }
      methodGroups.get(signatureKey)!.push(method);
    }

    // Find groups with multiple methods from different classes
    for (const [, methods] of methodGroups) {
      if (methods.length > 1) {
        const classNames = new Set(methods.map(m => m.className));

        // Only consider it duplication if methods are from different classes
        if (classNames.size > 1) {
          const duplication = this.createCrossClassMethodDuplication(methods);
          duplications.push(duplication);
        }
      }
    }

    return duplications;
  }

  /**
   * Extracts structural information from classes
   */
  private extractClassStructures(classes: ClassNode[]): ClassStructure[] {
    return classes.map(classNode => {
      const methodSignatures = classNode.methods.map(method =>
        this.generateMethodSignature(method)
      );

      const propertySignatures = classNode.properties.map(prop =>
        this.generatePropertySignature(prop)
      );

      const inheritanceChain = classNode.extends ? [classNode.extends] : [];
      const implementedInterfaces = classNode.implements || [];

      const structuralData = {
        methods: methodSignatures.sort(),
        properties: propertySignatures.sort(),
        inheritance: inheritanceChain,
        interfaces: implementedInterfaces.sort()
      };

      const structuralHash = generateHash(JSON.stringify(structuralData));

      return {
        className: classNode.name,
        methodSignatures,
        propertySignatures,
        inheritanceChain,
        implementedInterfaces,
        structuralHash,
        classNode
      };
    });
  }

  /**
   * Calculates structural similarity between two classes
   */
  private calculateStructuralSimilarity(
    class1: ClassStructure,
    class2: ClassStructure
  ): SimilarityScore {
    // Calculate method similarity
    const methodSimilarity = this.calculateArraySimilarity(
      class1.methodSignatures,
      class2.methodSignatures
    );

    // Calculate property similarity
    const propertySimilarity = this.calculateArraySimilarity(
      class1.propertySignatures,
      class2.propertySignatures
    );

    // Calculate inheritance similarity
    const inheritanceSimilarity = this.calculateArraySimilarity(
      class1.inheritanceChain,
      class2.inheritanceChain
    );

    // Calculate interface similarity
    const interfaceSimilarity = this.calculateArraySimilarity(
      class1.implementedInterfaces,
      class2.implementedInterfaces
    );

    // Weighted average of similarities
    const overallScore = (
      methodSimilarity * 0.4 +
      propertySimilarity * 0.3 +
      inheritanceSimilarity * 0.15 +
      interfaceSimilarity * 0.15
    );

    return {
      score: overallScore,
      confidence: Math.min(overallScore + 0.1, 1.0),
      type: 'structural',
      details: {
        structuralSimilarity: overallScore,
        commonTokens: Math.floor(overallScore * 100)
      }
    };
  }

  /**
   * Calculates similarity between two arrays of strings
   */
  private calculateArraySimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) {
      return 1.0;
    }

    if (arr1.length === 0 || arr2.length === 0) {
      return 0.0;
    }

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Generates a method signature string
   */
  private generateMethodSignature(method: FunctionNode): string {
    const params = method.parameters.map(p =>
      `${p.name}:${p.parameterType || 'any'}`
    ).join(',');

    const asyncPrefix = method.isAsync ? 'async ' : '';
    const returnType = method.returnType || 'void';

    return `${asyncPrefix}${method.name}(${params}):${returnType}`;
  }

  /**
   * Generates a property signature string
   */
  private generatePropertySignature(property: PropertyNode): string {
    const visibility = property.isPrivate ? 'private' : 'public';
    const staticPrefix = property.isStatic ? 'static ' : '';
    const type = property.propertyType || 'any';

    return `${visibility} ${staticPrefix}${property.name}:${type}`;
  }

  /**
   * Creates a structural duplication object
   */
  private createStructuralDuplication(
    class1: ClassStructure,
    class2: ClassStructure,
    similarity: SimilarityScore
  ): Duplication {
    const instances: CodeInstance[] = [
      this.createClassCodeInstance(class1.classNode),
      this.createClassCodeInstance(class2.classNode)
    ];

    const suggestion: RefactoringSuggestion = {
      type: 'create-abstract-class',
      description: `Classes ${class1.className} and ${class2.className} have similar structure. Consider creating a common base class or interface.`,
      estimatedEffort: 'medium',
      benefits: [
        'Reduces structural duplication',
        'Improves code maintainability',
        'Enforces consistent interface',
        'Enables polymorphic behavior'
      ],
      codeExample: `abstract class Base${class1.className.replace(/^./, c => c.toUpperCase())} {\n  // Common methods and properties\n}\n\nclass ${class1.className} extends Base${class1.className.replace(/^./, c => c.toUpperCase())} {\n  // Specific implementation\n}`
    };

    return {
      id: uuidv4(),
      type: DuplicationType.STRUCTURAL,
      similarity,
      instances,
      suggestion
    };
  }

  /**
   * Extracts method signatures from all classes
   */
  private extractMethodSignatures(classes: ClassNode[]): MethodSignature[] {
    const signatures: MethodSignature[] = [];

    for (const classNode of classes) {
      for (const method of classNode.methods) {
        signatures.push({
          name: method.name,
          parameterTypes: method.parameters.map(p => p.parameterType || 'any'),
          returnType: method.returnType || 'void',
          isAsync: method.isAsync,
          isStatic: false, // Assuming non-static for now
          visibility: 'public', // Assuming public for now
          methodNode: method,
          className: classNode.name
        });
      }
    }

    return signatures;
  }

  /**
   * Generates a key for method signature grouping
   */
  private generateMethodSignatureKey(method: MethodSignature): string {
    const params = method.parameterTypes.join(',');
    const asyncPrefix = method.isAsync ? 'async:' : '';
    return `${asyncPrefix}${method.name}(${params}):${method.returnType}`;
  }

  /**
   * Creates cross-class method duplication
   */
  private createCrossClassMethodDuplication(methods: MethodSignature[]): Duplication {
    const instances: CodeInstance[] = methods.map(method =>
      this.createMethodCodeInstance(method)
    );

    const classNames = [...new Set(methods.map(m => m.className))];

    const suggestion: RefactoringSuggestion = {
      type: 'extract-interface',
      description: `Method ${methods[0].name} is duplicated across classes: ${classNames.join(', ')}. Consider extracting to a common interface or utility function.`,
      estimatedEffort: 'low',
      benefits: [
        'Eliminates method duplication',
        'Centralizes common functionality',
        'Improves maintainability',
        'Reduces testing overhead'
      ],
      codeExample: `interface I${methods[0].name.replace(/^./, c => c.toUpperCase())}able {\n  ${methods[0].name}(${methods[0].parameterTypes.map((t, i) => `param${i}: ${t}`).join(', ')}): ${methods[0].returnType};\n}`
    };

    const similarity: SimilarityScore = {
      score: 1.0, // Methods with same signature are identical
      confidence: 0.95,
      type: 'structural',
      details: {
        structuralSimilarity: 1.0,
        commonTokens: 100
      }
    };

    return {
      id: uuidv4(),
      type: DuplicationType.STRUCTURAL,
      similarity,
      instances,
      suggestion
    };
  }

  /**
   * Identifies architectural patterns in classes
   */
  private identifyArchitecturalPatterns(classes: ClassNode[]): ArchitecturalPattern[] {
    const patterns: ArchitecturalPattern[] = [];

    // Detect Factory pattern
    patterns.push(...this.detectFactoryPattern(classes));

    // Detect Singleton pattern
    patterns.push(...this.detectSingletonPattern(classes));

    // Detect Strategy pattern
    patterns.push(...this.detectStrategyPattern(classes));

    return patterns.filter(p => p.confidence >= this.ARCHITECTURAL_PATTERN_THRESHOLD);
  }

  /**
   * Detects Factory pattern implementations
   */
  private detectFactoryPattern(classes: ClassNode[]): ArchitecturalPattern[] {
    const patterns: ArchitecturalPattern[] = [];

    for (const classNode of classes) {
      const hasCreateMethod = classNode.methods.some(m =>
        m.name.toLowerCase().includes('create') ||
        m.name.toLowerCase().includes('make') ||
        m.name.toLowerCase().includes('build')
      );

      const hasFactoryInName = classNode.name.toLowerCase().includes('factory');

      if (hasCreateMethod || hasFactoryInName) {
        patterns.push({
          patternType: 'factory',
          classes: [classNode],
          confidence: hasCreateMethod && hasFactoryInName ? 0.9 : 0.7,
          description: `Class ${classNode.name} appears to implement Factory pattern`
        });
      }
    }

    return patterns;
  }

  /**
   * Detects Singleton pattern implementations
   */
  private detectSingletonPattern(classes: ClassNode[]): ArchitecturalPattern[] {
    const patterns: ArchitecturalPattern[] = [];

    for (const classNode of classes) {
      const hasGetInstanceMethod = classNode.methods.some(m =>
        m.name.toLowerCase() === 'getinstance' ||
        m.name.toLowerCase() === 'instance'
      );

      const hasPrivateConstructor = classNode.methods.some(m =>
        m.name === 'constructor'
      );

      if (hasGetInstanceMethod) {
        patterns.push({
          patternType: 'singleton',
          classes: [classNode],
          confidence: hasPrivateConstructor ? 0.9 : 0.7,
          description: `Class ${classNode.name} appears to implement Singleton pattern`
        });
      }
    }

    return patterns;
  }

  /**
   * Detects Strategy pattern implementations
   */
  private detectStrategyPattern(classes: ClassNode[]): ArchitecturalPattern[] {
    const patterns: ArchitecturalPattern[] = [];

    // Look for classes that implement similar interfaces
    const interfaceGroups = new Map<string, ClassNode[]>();

    for (const classNode of classes) {
      if (classNode.implements && classNode.implements.length > 0) {
        for (const interfaceName of classNode.implements) {
          if (!interfaceGroups.has(interfaceName)) {
            interfaceGroups.set(interfaceName, []);
          }
          interfaceGroups.get(interfaceName)!.push(classNode);
        }
      }
    }

    // If multiple classes implement the same interface, it might be Strategy pattern
    for (const [interfaceName, implementingClasses] of interfaceGroups) {
      if (implementingClasses.length > 1) {
        patterns.push({
          patternType: 'strategy',
          classes: implementingClasses,
          confidence: 0.85,
          description: `Classes implementing ${interfaceName} appear to follow Strategy pattern`
        });
      }
    }

    return patterns;
  }

  /**
   * Creates architectural pattern duplication
   */
  private createArchitecturalPatternDuplication(
    patternType: string,
    patterns: ArchitecturalPattern[]
  ): Duplication {
    const allClasses = patterns.flatMap(p => p.classes);
    const instances: CodeInstance[] = allClasses.map(classNode =>
      this.createClassCodeInstance(classNode)
    );

    const suggestion: RefactoringSuggestion = {
      type: 'use-composition',
      description: `Multiple implementations of ${patternType} pattern detected. Consider consolidating or using composition to reduce duplication.`,
      estimatedEffort: 'high',
      benefits: [
        'Reduces pattern duplication',
        'Improves architectural consistency',
        'Simplifies maintenance',
        'Reduces cognitive complexity'
      ],
      codeExample: `// Consider consolidating ${patternType} implementations\n// or using a common base class`
    };

    const similarity: SimilarityScore = {
      score: 0.8,
      confidence: 0.85,
      type: 'structural',
      details: {
        structuralSimilarity: 0.8,
        commonTokens: 80
      }
    };

    return {
      id: uuidv4(),
      type: DuplicationType.STRUCTURAL,
      similarity,
      instances,
      suggestion
    };
  }

  /**
   * Creates a code instance for a class
   */
  private createClassCodeInstance(classNode: ClassNode): CodeInstance {
    return {
      file: 'unknown', // This would be populated by the caller
      startLine: classNode.position.line,
      endLine: classNode.position.line + 10, // Estimate
      className: classNode.name,
      code: `class ${classNode.name} { /* ... */ }`,
      hash: generateHash(classNode.name + JSON.stringify(classNode.methods.map(m => m.name)))
    };
  }

  /**
   * Creates a code instance for a method
   */
  private createMethodCodeInstance(method: MethodSignature): CodeInstance {
    const params = method.parameterTypes.map((type, i) => `param${i}: ${type}`).join(', ');
    const asyncPrefix = method.isAsync ? 'async ' : '';

    return {
      file: 'unknown', // This would be populated by the caller
      startLine: method.methodNode.position.line,
      endLine: method.methodNode.position.line + 5, // Estimate
      functionName: method.name,
      className: method.className,
      code: `${asyncPrefix}${method.name}(${params}): ${method.returnType} { /* ... */ }`,
      hash: generateHash(`${method.className}.${method.name}`)
    };
  }
}
