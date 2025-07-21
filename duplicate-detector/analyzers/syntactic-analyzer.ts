// Syntactic duplication analysis

import { AST, Duplication, DuplicationType } from '../types';

export interface SyntacticAnalyzer {
  detectExactDuplicates(asts: AST[]): Duplication[];
  detectSimilarCode(asts: AST[], threshold: number): Duplication[];
}

export class DefaultSyntacticAnalyzer implements SyntacticAnalyzer {
  detectExactDuplicates(asts: AST[]): Duplication[] {
    // This will be implemented in later tasks
    return [];
  }

  detectSimilarCode(asts: AST[], threshold: number): Duplication[] {
    // This will be implemented in later tasks
    return [];
  }
}
