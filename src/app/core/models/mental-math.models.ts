export type MathDomain = 
  | 'ADDITION' 
  | 'SUBTRACTION' 
  | 'MULTIPLICATION' 
  | 'DIVISION' 
  | 'PERCENTAGE';

export type MathMasteryLevel = 
  | 'UNMASTERED'  // 🔴 Não dominado
  | 'LEARNING'    // 🟠 Em aprendizado
  | 'KNOWN'       // 🟡 Conhecido
  | 'MASTERED'    // 🟢 Dominado
  | 'AUTOMATED';  // 🔵 Automatizado

export type MathQuestionFormat =
  // Adição
  | 'ADD_DIRECT'             // 7 + 8
  | 'ADD_INVERTED'           // 8 + 7
  | 'ADD_TRANSFER'           // 17 + 8, 27 + 9
  | 'ADD_TWO_DIGIT'          // 47 + 38
  | 'ADD_DECOMPOSITION'      // 48 + 37 (48+30 + 7)
  // Subtração
  | 'SUB_DIRECT'             // 8 - 3
  | 'SUB_NEGATIVE'           // 3 - 8 = -5
  | 'SUB_COMPLEMENT_10'      // 10 - 7 = 3
  | 'SUB_TWO_DIGIT'          // 83 - 47
  | 'SUB_DECOMPOSITION'      // 83 - 40 - 7
  // Multiplicação
  | 'MULT_DIRECT'            // 7 × 8
  | 'MULT_INVERTED'          // 8 × 7
  | 'MULT_MISSING_OPERAND'   // ? × 8 = 56 ou 7 × ? = 56
  | 'MULT_TWO_DIGIT'         // 37 × 24 (37×20 + 37×4)
  | 'MULT_TRANSFER_TENS'     // 70 × 8, 7 × 80
  // Divisão
  | 'DIV_DIRECT'             // 56 ÷ 7
  | 'DIV_MISSING_OPERAND'    // 56 ÷ ? = 7 ou ? ÷ 7 = 8
  | 'DIV_HOW_MANY_FIT'       // 168 ÷ 12 ("quantos cabem")
  | 'DIV_DECOMPOSITION'      // 156 ÷ 12 = 120÷12 + 36÷12
  | 'DIV_CONVENIENT'         // 850 ÷ 25 = 850 ÷ 100 × 4
  | 'DIV_ESTIMATION'         // 387 ÷ 19 ≈ 387 ÷ 20 ≈ 19
  | 'DIV_REMAINDER'          // 137 ÷ 12 = 11 resto 5
  | 'DIV_CONTEXT'            // 180 km em 3 horas = 60 km/h
  // Porcentagem
  | 'PCT_BENCHMARK'          // 10% de 240, 50% de 240, 25% de 240
  | 'PCT_DECOMPOSITION'      // 15% de 240 (10% + 5%), 35% de 200
  | 'PCT_FRACTION'           // 25% de 360 = 360 ÷ 4
  | 'PCT_REVERSE'            // 60 é 20% de quanto?
  | 'PCT_DISCOVER'           // 30 de 120 = ? %
  | 'PCT_MARKUP'             // R$ 200 + 15%
  | 'PCT_DISCOUNT'           // R$ 250 com 20% OFF
  | 'PCT_SUCCESSIVE'         // R$ 100 + 20% e depois -20%
  | 'PCT_COMPARISON'         // A (80) vs B (100): quanto % mais barato/caro?
  | 'PCT_ESTIMATION'         // 17% de 598 ≈ 20% de 600
  | 'PCT_APPLIED';           // Gorjeta de 10% em R$ 180

export interface MathKnowledgeItem {
  knowledgeId: string;       // ex: add_7_8, sub_8_3, mult_7_8, div_56_7, pct_15_240
  domain: MathDomain;
  familyId: string;          // ex: family_mult_7_8_56, family_add_7_8_15
  operandA: number;
  operandB: number;
  result: number;
  difficulty: number;        // 1 a 100
  attempts: number;
  correctCount: number;
  avgResponseTimeMs: number;
  recentErrors: number;
  masteryLevel: MathMasteryLevel;
  lastReviewedAt: number;
}

export interface MathFamily {
  id: string;
  domain: MathDomain;
  numbers: number[]; // ex: [7, 8, 56]
  knowledgeIds: string[];
}

export interface DomainMasterySummary {
  domain: MathDomain;
  domainName: string;
  icon: string;
  totalFacts: number;
  automatedCount: number;
  masteredCount: number;
  knownCount: number;
  learningCount: number;
  unmasteredCount: number;
  averageTimeMs: number;
  accuracyPercentage: number;
}
