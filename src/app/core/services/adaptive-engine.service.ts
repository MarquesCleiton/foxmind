import { Injectable, inject } from '@angular/core';
import { 
  CognitiveCategory, 
  ExerciseQuestion, 
  ExerciseType,
  ExerciseLevel,
  FocusUnitId
} from '../models/cognitive.models';
import { MentalMathService } from './mental-math.service';
import { MathDomain } from '../models/mental-math.models';

@Injectable({
  providedIn: 'root'
})
export class AdaptiveEngineService {
  private mentalMath = inject(MentalMathService);

  // Ajusta a dificuldade adaptativa (1 a 100) com base no desempenho
  public calculateNextDifficulty(
    currentDifficulty: number, 
    isCorrect: boolean, 
    responseTimeMs: number, 
    targetTimeMs = 3000
  ): number {
    let delta = 0;

    if (isCorrect) {
      if (responseTimeMs < targetTimeMs * 0.6) {
        delta = 4;
      } else if (responseTimeMs < targetTimeMs * 1.2) {
        delta = 2;
      } else {
        delta = 1;
      }
    } else {
      if (responseTimeMs > targetTimeMs * 1.5) {
        delta = -5;
      } else {
        delta = -3;
      }
    }

    return Math.min(100, Math.max(1, currentDifficulty + delta));
  }

  // Gera uma questão procedural de acordo com o tipo e dificuldade (retrocompatibilidade)
  public generateQuestion(type: ExerciseType, difficulty: number): ExerciseQuestion {
    const level: ExerciseLevel = difficulty <= 20 ? 1 : difficulty <= 40 ? 2 : difficulty <= 60 ? 3 : difficulty <= 80 ? 4 : 5;
    switch (type) {
      case 'MENTAL_MATH':
        return this.generateAddition(level);
      case 'PERCENTAGE':
        return this.generatePercentageBasic(level);
      case 'WORD_PROBLEM':
        return this.generateWordProblemLevel(level);
      case 'NUMBER_SEQUENCE':
        return this.generateSequenceForward(level);
      case 'GENIUS_COLORS':
        return this.generateGeniusColorsLevel(level);
      case 'SPATIAL_GRID':
        return this.generateSpatialGridLevel(level);
      case 'ATTENTION_TARGET':
        return this.generateAttentionMatchLevel(level);
      case 'STROOP_TEST':
        return this.generateStroopInkLevel(level);
      case 'NUMBER_ORDERING':
        return this.generateNumberOrderingLevel(level);
      case 'LOGICAL_PATTERN':
        return this.generateLogicalPatternArithmeticLevel(level);
      default:
        return this.generateAddition(level);
    }
  }

  /**
   * Gera uma questão para uma Unidade de Foco granular (FocusUnitId) e Nível (1 a 5).
   * Segue rigorosamente a especificação do plano de progressão (plano_progressao_niveis_1_a_5.md).
   */
  public generateQuestionForUnit(unitId: FocusUnitId, level: ExerciseLevel): ExerciseQuestion {
    switch (unitId) {
      // ── Sessão: Cálculo ──────────────────────────────────────────────
      case 'math-addition':
        return this.generateAddition(level);
      case 'math-subtraction':
        return this.generateSubtraction(level);
      case 'math-multiplication':
        return this.generateMultiplication(level);
      case 'math-division':
        return this.generateDivision(level);
      case 'pct-basic':
        return this.generatePercentageBasic(level);
      case 'pct-applied':
        return this.generatePercentageApplied(level);

      // ── Sessão: Memória ──────────────────────────────────────────────
      case 'seq-forward':
        return this.generateSequenceForward(level);
      case 'seq-reverse':
        return this.generateSequenceReverse(level);
      case 'spatial-grid':
        return this.generateSpatialGridLevel(level);
      case 'genius-colors':
        return this.generateGeniusColorsLevel(level);

      // ── Sessão: Atenção & Reação ─────────────────────────────────────
      case 'att-match':
        return this.generateAttentionMatchLevel(level);
      case 'att-negate':
        return this.generateAttentionNegateLevel(level);
      case 'stroop-ink':
        return this.generateStroopInkLevel(level);
      case 'stroop-word':
        return this.generateStroopWordLevel(level);
      case 'number-ordering':
        return this.generateNumberOrderingLevel(level);

      // ── Sessão: Raciocínio Lógico ────────────────────────────────────
      case 'pat-arithmetic':
        return this.generateLogicalPatternArithmeticLevel(level);
      case 'pat-geometric':
        return this.generateLogicalPatternGeometricLevel(level);
      case 'pat-complex':
        return this.generateLogicalPatternComplexLevel(level);
      case 'word-problem':
        return this.generateWordProblemLevel(level);

      default:
        return this.generateAddition(level);
    }
  }

  public generateQuestionForLevel(type: ExerciseType, level: ExerciseLevel): ExerciseQuestion {
    return this.generateQuestion(type, level * 20);
  }

  public generateMathDomainQuestion(domain: MathDomain | 'MIXED', difficulty: number): ExerciseQuestion {
    return this.mentalMath.generateQuestion(domain, difficulty);
  }

  // =========================================================================
  // 1. SESSÃO CÁLCULO (Níveis 1 a 5)
  // =========================================================================

  /** ➕ ADIÇÃO (math-addition) */
  private generateAddition(level: ExerciseLevel): ExerciseQuestion {
    const id = 'add-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 18;

    if (level === 1) {
      // N1: Apenas 1 dígito (1 a 9). Soma <= 10. Tempo: 18 s.
      const a = Math.floor(Math.random() * 5) + 1;
      const maxB = 10 - a;
      const b = Math.floor(Math.random() * maxB) + 1;
      prompt = `${a} + ${b}`;
      expected = a + b;
      timeLimitSeconds = 18;
      hint = `Conte a partir do número maior (${Math.max(a, b)}).`;
      strategy = `Recuperação direta de fatos básicos: ${a} + ${b} = ${expected}.`;
    } else if (level === 2) {
      // N2: 2 dígitos simples com 1 dígito (sem vai-um complexo). Tempo: 14 s.
      const tens = (Math.floor(Math.random() * 4) + 1) * 10;
      const unitA = Math.floor(Math.random() * 5) + 1;
      const a = tens + unitA;
      const b = Math.floor(Math.random() * (9 - unitA)) + 1;
      prompt = `${a} + ${b}`;
      expected = a + b;
      timeLimitSeconds = 14;
      hint = `Some as unidades primeiro: ${unitA} + ${b} = ${unitA + b}.`;
      strategy = `Mantenha a dezena (${tens}) e some as unidades: ${tens} + ${unitA + b} = ${expected}.`;
    } else if (level === 3) {
      // N3: 2 dígitos com dezenas e "vai um". Tempo: 11 s.
      const a = Math.floor(Math.random() * 40) + 25;
      const b = Math.floor(Math.random() * 35) + 16;
      prompt = `${a} + ${b}`;
      expected = a + b;
      timeLimitSeconds = 11;
      const tensA = Math.floor(a / 10) * 10;
      const tensB = Math.floor(b / 10) * 10;
      hint = `Some as dezenas (${tensA} + ${tensB}) e adicione as unidades (${a % 10} + ${b % 10}).`;
      strategy = `Decomposição: (${tensA} + ${tensB} = ${tensA + tensB}) + (${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}) = ${expected}.`;
    } else if (level === 4) {
      // N4: 3 dígitos simples ou 3 operandos encadeados. Tempo: 8 s.
      const is3Operands = Math.random() > 0.5;
      if (is3Operands) {
        const a = Math.floor(Math.random() * 25) + 15;
        const b = Math.floor(Math.random() * 25) + 15;
        const c = Math.floor(Math.random() * 20) + 10;
        prompt = `${a} + ${b} + ${c}`;
        expected = a + b + c;
      } else {
        const a = Math.floor(Math.random() * 180) + 110;
        const b = Math.floor(Math.random() * 70) + 25;
        prompt = `${a} + ${b}`;
        expected = a + b;
      }
      timeLimitSeconds = 8;
      hint = 'Some as centenas e dezenas primeiro da esquerda para a direita.';
      strategy = `Cálculo rápido agrupando números para formar dezenas redondas: ${expected}.`;
    } else {
      // N5: Operações encadeadas ou 3 dígitos com 3 dígitos. Tempo: 6 s.
      const a = Math.floor(Math.random() * 300) + 250;
      const b = Math.floor(Math.random() * 250) + 180;
      prompt = `${a} + ${b}`;
      expected = a + b;
      timeLimitSeconds = 6;
      hint = 'Arredonde para a centena inteira e faça a compensação.';
      strategy = `Compensação mental rápida: ${a} + ${b} = ${expected}.`;
    }

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, domain: 'ADDITION', level },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'math-addition',
      subtype: 'ADDITION',
      level
    };
  }

  /** ➖ SUBTRAÇÃO (math-subtraction) */
  private generateSubtraction(level: ExerciseLevel): ExerciseQuestion {
    const id = 'sub-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 18;

    if (level === 1) {
      // N1: Apenas 1 dígito (1 a 9). Subtrações diretas sem "pegar emprestado". Tempo: 18 s.
      const b = Math.floor(Math.random() * 4) + 1;
      const a = b + Math.floor(Math.random() * (9 - b)) + 1;
      prompt = `${a} - ${b}`;
      expected = a - b;
      timeLimitSeconds = 18;
      hint = `Quanto falta de ${b} para chegar em ${a}?`;
      strategy = `Subtração direta básica: ${a} - ${b} = ${expected}.`;
    } else if (level === 2) {
      // N2: 2 dígitos simples com 1 dígito (sem empréstimo complexo). Tempo: 14 s.
      const tens = (Math.floor(Math.random() * 4) + 1) * 10;
      const unitA = Math.floor(Math.random() * 5) + 4; // 4 a 8
      const a = tens + unitA;
      const b = Math.floor(Math.random() * (unitA - 1)) + 1;
      prompt = `${a} - ${b}`;
      expected = a - b;
      timeLimitSeconds = 14;
      hint = `Subtraia apenas as unidades: ${unitA} - ${b} = ${unitA - b}.`;
      strategy = `Mantenha a dezena (${tens}): ${tens} + (${unitA} - ${b}) = ${expected}.`;
    } else if (level === 3) {
      // N3: 2 dígitos com empréstimo / decomposição. Tempo: 11 s.
      const a = Math.floor(Math.random() * 50) + 42;
      const b = Math.floor(Math.random() * 30) + 18;
      prompt = `${a} - ${b}`;
      expected = a - b;
      timeLimitSeconds = 11;
      hint = `Subtraia primeiro até a dezena inteira (${a} - ${b % 10}) e depois o resto.`;
      strategy = `Subtração por partes: ${a} - ${b} = ${expected}.`;
    } else if (level === 4) {
      // N4: 3 dígitos simples ou 3 operandos encadeados. Tempo: 8 s.
      const a = (Math.floor(Math.random() * 15) + 12) * 10;
      const b = Math.floor(Math.random() * 40) + 25;
      const c = Math.floor(Math.random() * 20) + 10;
      prompt = `${a} - ${b} - ${c}`;
      expected = a - b - c;
      timeLimitSeconds = 8;
      hint = `Subtraia o primeiro bloco (${a} - ${b}) e depois retire ${c}.`;
      strategy = `Subtração sequencial: (${a} - ${b} = ${a - b}) - ${c} = ${expected}.`;
    } else {
      // N5: 3 dígitos complexos com empréstimos múltiplos. Tempo: 6 s.
      const a = Math.floor(Math.random() * 300) + 340;
      const b = Math.floor(Math.random() * 200) + 165;
      prompt = `${a} - ${b}`;
      expected = a - b;
      timeLimitSeconds = 6;
      hint = 'Calcule por aproximação ou diferença relativa.';
      strategy = `Diferença rápida: ${a} - ${b} = ${expected}.`;
    }

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, domain: 'SUBTRACTION', level },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'math-subtraction',
      subtype: 'SUBTRACTION',
      level
    };
  }

  /** ✖️ MULTIPLICAÇÃO (math-multiplication) */
  private generateMultiplication(level: ExerciseLevel): ExerciseQuestion {
    const id = 'mult-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 18;

    if (level === 1) {
      // N1: Tabuadas ultra-básicas de 1 e 2. Tempo: 18 s.
      const a = Math.random() > 0.2 ? 2 : 1;
      const b = Math.floor(Math.random() * 5) + 1;
      prompt = `${a} × ${b}`;
      expected = a * b;
      timeLimitSeconds = 18;
      hint = `Multiplicar por 2 é dobrar o número: ${b} + ${b}.`;
      strategy = `Fato básico: ${a} × ${b} = ${expected}.`;
    } else if (level === 2) {
      // N2: Tabuadas fáceis (x2, x5, x10). Tempo: 14 s.
      const bases = [2, 5, 10];
      const a = bases[Math.floor(Math.random() * bases.length)];
      const b = Math.floor(Math.random() * 8) + 2;
      prompt = `${b} × ${a}`;
      expected = b * a;
      timeLimitSeconds = 14;
      hint = a === 5 ? 'Números multiplicados por 5 sempre terminam em 0 ou 5.' : 'Dobre o valor ou acrescente um zero.';
      strategy = `Tabuada fundamental: ${b} × ${a} = ${expected}.`;
    } else if (level === 3) {
      // N3: Tabuada completa (x3, x4, x6, x7, x8, x9). Tempo: 11 s.
      const factors = [3, 4, 6, 7, 8, 9];
      const a = factors[Math.floor(Math.random() * factors.length)];
      const b = Math.floor(Math.random() * 7) + 3;
      prompt = `${a} × ${b}`;
      expected = a * b;
      timeLimitSeconds = 11;
      hint = `Se você sabe ${a} × ${b - 1}, basta somar mais ${a}.`;
      strategy = `Recuperação direta da tabuada de ${a}: ${a} × ${b} = ${expected}.`;
    } else if (level === 4) {
      // N4: 2 dígitos por 1 dígito (x12, x14, x15...). Tempo: 8 s.
      const a = Math.floor(Math.random() * 8) + 11; // 11 a 18
      const b = Math.floor(Math.random() * 6) + 3;  // 3 a 8
      prompt = `${a} × ${b}`;
      expected = a * b;
      timeLimitSeconds = 8;
      hint = `Multiplique 10 × ${b} (${10 * b}) e adicione ${a % 10} × ${b} (${(a % 10) * b}).`;
      strategy = `Distributiva: (10 × ${b} = ${10 * b}) + (${a % 10} × ${b} = ${(a % 10) * b}) = ${expected}.`;
    } else {
      // N5: 2 dígitos por 2 dígitos. Tempo: 6 s.
      const a = Math.floor(Math.random() * 15) + 16; // 16 a 30
      const b = Math.floor(Math.random() * 12) + 12; // 12 a 23
      prompt = `${a} × ${b}`;
      expected = a * b;
      timeLimitSeconds = 6;
      hint = `Multiplique por ${Math.floor(b / 10) * 10} primeiro.`;
      strategy = `Multiplicação rápida: ${a} × ${b} = ${expected}.`;
    }

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, domain: 'MULTIPLICATION', level },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'math-multiplication',
      subtype: 'MULTIPLICATION',
      level
    };
  }

  /** ➗ DIVISÃO (math-division) */
  private generateDivision(level: ExerciseLevel): ExerciseQuestion {
    const id = 'div-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 18;

    if (level === 1) {
      // N1: Divisões exatas simples por 2 com dividendo <= 10. Tempo: 18 s.
      const quotient = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
      const divisor = 2;
      const dividend = quotient * divisor;
      prompt = `${dividend} ÷ ${divisor}`;
      expected = quotient;
      timeLimitSeconds = 18;
      hint = `Dividir por 2 é calcular a metade de ${dividend}.`;
      strategy = `Metade exata: ${dividend} ÷ 2 = ${expected}.`;
    } else if (level === 2) {
      // N2: Divisões exatas por 2, 5 e 10. Tempo: 14 s.
      const divisors = [2, 5, 10];
      const divisor = divisors[Math.floor(Math.random() * divisors.length)];
      const quotient = Math.floor(Math.random() * 7) + 2;
      const dividend = quotient * divisor;
      prompt = `${dividend} ÷ ${divisor}`;
      expected = quotient;
      timeLimitSeconds = 14;
      hint = `Quantas vezes o ${divisor} cabe em ${dividend}?`;
      strategy = `Pense na tabuada de ${divisor}: ${expected} × ${divisor} = ${dividend}.`;
    } else if (level === 3) {
      // N3: Divisões exatas da tabuada completa. Tempo: 11 s.
      const divisor = Math.floor(Math.random() * 6) + 4; // 4 a 9
      const quotient = Math.floor(Math.random() * 7) + 3; // 3 a 9
      const dividend = divisor * quotient;
      prompt = `${dividend} ÷ ${divisor}`;
      expected = quotient;
      timeLimitSeconds = 11;
      hint = `Qual número multiplicado por ${divisor} resulta em ${dividend}?`;
      strategy = `Relação inversa: ${expected} × ${divisor} = ${dividend} → ${dividend} ÷ ${divisor} = ${expected}.`;
    } else if (level === 4) {
      // N4: Divisões com números maiores. Tempo: 8 s.
      const divisor = Math.floor(Math.random() * 6) + 4; // 4 a 9
      const quotient = Math.floor(Math.random() * 15) + 12; // 12 a 26
      const dividend = divisor * quotient;
      prompt = `${dividend} ÷ ${divisor}`;
      expected = quotient;
      timeLimitSeconds = 8;
      hint = `Decomponha ${dividend} em partes divisíveis por ${divisor}.`;
      strategy = `Decomposição: ${dividend} ÷ ${divisor} = ${expected}.`;
    } else {
      // N5: Divisões encadeadas ou dividendos grandes. Tempo: 6 s.
      const divisor = Math.floor(Math.random() * 6) + 12; // 12 a 17
      const quotient = Math.floor(Math.random() * 8) + 12; // 12 a 19
      const dividend = divisor * quotient;
      prompt = `${dividend} ÷ ${divisor}`;
      expected = quotient;
      timeLimitSeconds = 6;
      hint = `Estime o valor aproximado e ajuste pelo dígito final.`;
      strategy = `Divisão de 2 algarismos: ${dividend} ÷ ${divisor} = ${expected}.`;
    }

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, domain: 'DIVISION', level },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'math-division',
      subtype: 'DIVISION',
      level
    };
  }

  /** 💯 PORCENTAGEM BÁSICA (pct-basic) */
  private generatePercentageBasic(level: ExerciseLevel): ExerciseQuestion {
    const id = 'pct-b-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 20;

    if (level === 1) {
      // N1: Apenas 10%, 50% e 100% de inteiros redondos terminados em 0. Tempo: 20 s.
      const base = (Math.floor(Math.random() * 8) + 2) * 10; // 20, 30, 40... 90
      const pct = [10, 50, 100][Math.floor(Math.random() * 3)];
      prompt = `${pct}% de ${base}`;
      expected = Math.round((pct / 100) * base);
      timeLimitSeconds = 20;
      hint = pct === 10 ? `10% é simplesmente dividir por 10 (${base} ÷ 10).` : pct === 50 ? `50% é a metade (${base} ÷ 2).` : '100% é o valor total.';
      strategy = `Fórmula rápida: ${pct}% de ${base} = ${expected}.`;
    } else if (level === 2) {
      // N2: 10%, 20%, 25%, 50% aplicados a dezenas/centenas inteiras. Tempo: 16 s.
      const base = (Math.floor(Math.random() * 8) + 3) * 20; // 60 a 200
      const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
      prompt = `${pct}% de ${base}`;
      expected = Math.round((pct / 100) * base);
      timeLimitSeconds = 16;
      hint = pct === 25 ? `25% é dividir por 4 (metade da metade).` : `Calcule 10% (${base / 10}) e multiplique.`;
      strategy = `Cálculo de base redonda: ${pct}% de ${base} = ${expected}.`;
    } else if (level === 3) {
      // N3: 5%, 15%, 75% de valores redondos. Tempo: 12 s.
      const base = (Math.floor(Math.random() * 8) + 2) * 40;
      const pct = [5, 15, 75][Math.floor(Math.random() * 3)];
      prompt = `${pct}% de ${base}`;
      expected = Math.round((pct / 100) * base);
      timeLimitSeconds = 12;
      hint = pct === 15 ? `15% = 10% (${base * 0.1}) + 5% (${base * 0.05}).` : pct === 75 ? `75% = 3/4 de ${base}.` : `5% é a metade de 10%.`;
      strategy = `Decomposição percentual: ${pct}% de ${base} = ${expected}.`;
    } else if (level === 4) {
      // N4: 30%, 35%, 40%, 60% com valores variados. Tempo: 9 s.
      const base = (Math.floor(Math.random() * 12) + 4) * 20;
      const pct = [30, 35, 40, 60][Math.floor(Math.random() * 4)];
      prompt = `${pct}% de ${base}`;
      expected = Math.round((pct / 100) * base);
      timeLimitSeconds = 9;
      hint = `Quebre em dezenas inteiras de 10%.`;
      strategy = `Agrupamento de 10%: ${base * 0.1} × ${pct / 10} = ${expected}.`;
    } else {
      // N5: Porcentagens fracionadas / assimétricas (18%, 24%, 12%). Tempo: 7 s.
      const base = (Math.floor(Math.random() * 6) + 3) * 50;
      const pct = [12, 18, 24, 32][Math.floor(Math.random() * 4)];
      prompt = `${pct}% de ${base}`;
      expected = Math.round((pct / 100) * base);
      timeLimitSeconds = 7;
      hint = 'Multiplique por 1% e escale proporcionalmente.';
      strategy = `Multiplicação rápida: ${pct} × ${base / 100} = ${expected}.`;
    }

    return {
      id,
      category: 'CALCULATION',
      type: 'PERCENTAGE',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, domain: 'PERCENTAGE', level },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'pct-basic',
      subtype: 'BASIC',
      level
    };
  }

  /** % PORCENTAGEM APLICADA (pct-applied) */
  private generatePercentageApplied(level: ExerciseLevel): ExerciseQuestion {
    const id = 'pct-a-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 20;

    if (level === 1) {
      // N1: Desconto de 50% ou Aumento de 10% sobre números redondos. Tempo: 20 s.
      const base = (Math.floor(Math.random() * 6) + 2) * 20; // 40, 60, 80...
      const isDiscount = Math.random() > 0.5;
      if (isDiscount) {
        prompt = `Desconto de 50% em R$ ${base}. Qual o valor final?`;
        expected = base / 2;
        hint = `Metade do valor: ${base} ÷ 2 = ${expected}.`;
      } else {
        const roundBase = (Math.floor(Math.random() * 5) + 2) * 50; // 100, 150...
        prompt = `Aumento de 10% sobre R$ ${roundBase}. Qual o novo valor?`;
        expected = roundBase + (roundBase * 0.1);
        hint = `10% é ${roundBase * 0.1}. Some ao valor original.`;
      }
      timeLimitSeconds = 20;
      strategy = `Aplicação direta elementar: R$ ${expected}.`;
    } else if (level === 2) {
      // N2: Descontos de 10%, 20%, 25%. Tempo: 16 s.
      const base = (Math.floor(Math.random() * 6) + 2) * 40; // 80, 120, 160...
      const pct = [10, 20, 25][Math.floor(Math.random() * 3)];
      const discount = (pct / 100) * base;
      expected = base - discount;
      prompt = `Desconto de ${pct}% em R$ ${base}. Qual o preço a pagar?`;
      timeLimitSeconds = 16;
      hint = `Calcule o desconto (${pct}% de ${base} = ${discount}) e subtraia.`;
      strategy = `R$ ${base} - R$ ${discount} = R$ ${expected}.`;
    } else if (level === 3) {
      // N3: Aumento de 10% ou desconto de 15% / 75%. Tempo: 12 s.
      const base = (Math.floor(Math.random() * 6) + 2) * 50;
      const isIncrease = Math.random() > 0.5;
      if (isIncrease) {
        prompt = `Aumento de 15% sobre R$ ${base}. Qual o valor reajustado?`;
        expected = Math.round(base * 1.15);
      } else {
        prompt = `Desconto de 15% em R$ ${base}. Qual o valor final?`;
        expected = Math.round(base * 0.85);
      }
      timeLimitSeconds = 12;
      hint = `15% de ${base} é ${base * 0.15}.`;
      strategy = `Ajuste percentual direto: R$ ${expected}.`;
    } else if (level === 4) {
      // N4: Descontos comerciais com valores não redondos. Tempo: 9 s.
      const base = (Math.floor(Math.random() * 8) + 5) * 20; // 100 a 240
      const pct = [20, 30, 40][Math.floor(Math.random() * 3)];
      expected = Math.round(base * (1 - (pct / 100)));
      prompt = `Produto de R$ ${base} com ${pct}% de desconto comercial. Quanto custa?`;
      timeLimitSeconds = 9;
      hint = `Pagar com ${pct}% de desconto é pagar ${100 - pct}% do valor.`;
      strategy = `Multiplique direto pelo fator complementar (${100 - pct}%): R$ ${expected}.`;
    } else {
      // N5: Cálculos reversos e aumentos sucessivos. Tempo: 7 s.
      const whole = (Math.floor(Math.random() * 5) + 3) * 50; // 150 a 350
      const part = whole * 0.3;
      prompt = `Se 30% de um valor é R$ ${part}, quanto é o total (100%)?`;
      expected = whole;
      timeLimitSeconds = 7;
      hint = `Divida R$ ${part} por 3 para achar 10%, depois multiplique por 10.`;
      strategy = `Cálculo reverso: (R$ ${part} ÷ 3 = ${part / 3}) × 10 = R$ ${expected}.`;
    }

    return {
      id,
      category: 'CALCULATION',
      type: 'PERCENTAGE',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, domain: 'APPLIED', level },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'pct-applied',
      subtype: 'APPLIED',
      level
    };
  }

  // =========================================================================
  // 2. SESSÃO MEMÓRIA (Níveis 1 a 5)
  // =========================================================================

  /** 🔢 SEQUÊNCIA DIRETA (seq-forward) */
  private generateSequenceForward(level: ExerciseLevel): ExerciseQuestion {
    const id = 'seq-f-' + Math.random().toString(36).substring(2, 9);
    // Comprimento conforme o plano: L1=3, L2=4, L3=5, L4=7, L5=9
    const lengthMap: Record<ExerciseLevel, number> = { 1: 3, 2: 4, 3: 5, 4: 7, 5: 9 };
    // Exposição: L1=1000ms, L2=800ms, L3=650ms, L4=500ms, L5=350ms por dígito
    const msMap: Record<ExerciseLevel, number> = { 1: 1000, 2: 800, 3: 650, 4: 500, 5: 350 };
    // Tempo limite digitação: L1=20s, L2=16s, L3=13s, L4=11s, L5=9s
    const timeLimitMap: Record<ExerciseLevel, number> = { 1: 20, 2: 16, 3: 13, 4: 11, 5: 9 };

    const length = lengthMap[level];
    const msPerDigit = msMap[level];
    const timeLimitSeconds = timeLimitMap[level];

    const digits: number[] = [];
    for (let i = 0; i < length; i++) digits.push(Math.floor(Math.random() * 9) + 1);

    const expected = digits.join('');
    const displayTimeMs = (msPerDigit * length) + 400;

    return {
      id,
      category: 'MEMORY',
      type: 'NUMBER_SEQUENCE',
      difficulty: level * 20,
      prompt: `Memorize os ${length} dígitos e repita na ORDEM ORIGINAL:`,
      data: { sequence: digits, isReverse: false, displayTimeMs },
      expectedAnswer: expected,
      hintStrategy: 'Crie uma melodia ou ritmo mental com os números.',
      explanationStrategy: 'Chunking: agrupe os números em blocos de 2 a 3 dígitos.',
      timeLimitSeconds,
      hasTimerBar: false,
      unitId: 'seq-forward',
      subtype: 'FORWARD',
      level
    };
  }

  /** 🔄 SEQUÊNCIA INVERSA (seq-reverse) */
  private generateSequenceReverse(level: ExerciseLevel): ExerciseQuestion {
    const id = 'seq-r-' + Math.random().toString(36).substring(2, 9);
    // Comprimento conforme o plano: L1=3, L2=4, L3=5, L4=6, L5=8
    const lengthMap: Record<ExerciseLevel, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 };
    const msMap: Record<ExerciseLevel, number> = { 1: 1000, 2: 800, 3: 650, 4: 500, 5: 350 };
    const timeLimitMap: Record<ExerciseLevel, number> = { 1: 20, 2: 16, 3: 13, 4: 11, 5: 9 };

    const length = lengthMap[level];
    const msPerDigit = msMap[level];
    const timeLimitSeconds = timeLimitMap[level];

    const digits: number[] = [];
    for (let i = 0; i < length; i++) digits.push(Math.floor(Math.random() * 9) + 1);

    const expected = [...digits].reverse().join('');
    const displayTimeMs = (msPerDigit * length) + 400;

    return {
      id,
      category: 'MEMORY',
      type: 'NUMBER_SEQUENCE',
      difficulty: level * 20,
      prompt: `Memorize e repita ao CONTRÁRIO (de trás para frente):`,
      data: { sequence: digits, isReverse: true, displayTimeMs },
      expectedAnswer: expected,
      hintStrategy: 'Foque no último número memorizado: ele será o primeiro a ser digitado!',
      explanationStrategy: 'Inversão mental: visualize a sequência sendo lida da direita para a esquerda.',
      timeLimitSeconds,
      hasTimerBar: false,
      unitId: 'seq-reverse',
      subtype: 'REVERSE',
      level
    };
  }

  /** 📐 MEMÓRIA ESPACIAL EM GRADE (spatial-grid) */
  private generateSpatialGridLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'spa-' + Math.random().toString(36).substring(2, 9);
    // Plano: L1=3x3 (3 alvos, 3200ms, 16s), L2=3x3 (4 alvos, 2400ms, 13s), L3=4x4 (5 alvos, 1800ms, 10s), L4=4x4 (6 alvos, 1200ms, 8s), L5=4x4 (8 alvos, 850ms, 6s)
    const gridSize = level <= 2 ? 3 : 4;
    const targetsCountMap: Record<ExerciseLevel, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 };
    const flashMap: Record<ExerciseLevel, number> = { 1: 3200, 2: 2400, 3: 1800, 4: 1200, 5: 850 };
    const timeMap: Record<ExerciseLevel, number> = { 1: 16, 2: 13, 3: 10, 4: 8, 5: 6 };

    const totalCells = gridSize * gridSize;
    const targetsCount = targetsCountMap[level];
    const targets: number[] = [];

    while (targets.length < targetsCount) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!targets.includes(idx)) targets.push(idx);
    }

    return {
      id,
      category: 'SPATIAL',
      type: 'SPATIAL_GRID',
      difficulty: level * 20,
      prompt: `Memorize as ${targetsCount} posições marcadas na grade:`,
      data: { gridSize, targets, flashTimeMs: flashMap[level] },
      expectedAnswer: targets.sort((a, b) => a - b),
      hintStrategy: 'Conecte os pontos marcados visualmente como uma figura geométrica.',
      explanationStrategy: 'Agrupamento espacial: memorize blocos por linha ou quadrante.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: false,
      unitId: 'spatial-grid',
      level
    };
  }

  /** 🎨 GENIUS / CORES SEQUENCIAIS (genius-colors) */
  private generateGeniusColorsLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'gen-' + Math.random().toString(36).substring(2, 9);
    const colors = ['CYAN', 'VIOLET', 'EMERALD', 'AMBER'];
    // Plano: L1=3 passos (750ms, 25s), L2=4 passos (600ms, 22s), L3=5 passos (450ms, 19s), L4=7 passos (350ms, 16s), L5=9 passos (240ms, 14s)
    const stepsMap: Record<ExerciseLevel, number> = { 1: 3, 2: 4, 3: 5, 4: 7, 5: 9 };
    const speedMap: Record<ExerciseLevel, number> = { 1: 750, 2: 600, 3: 450, 4: 350, 5: 240 };
    const timeMap: Record<ExerciseLevel, number> = { 1: 25, 2: 22, 3: 19, 4: 16, 5: 14 };

    const steps = stepsMap[level];
    const sequence: string[] = [];
    for (let i = 0; i < steps; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    return {
      id,
      category: 'MEMORY',
      type: 'GENIUS_COLORS',
      difficulty: level * 20,
      prompt: `Observe a sequência (${steps} passos) e repita:`,
      data: { colors, sequence, speedMs: speedMap[level] },
      expectedAnswer: sequence,
      hintStrategy: 'Repita as cores em voz alta mentalmente enquanto elas piscam.',
      explanationStrategy: 'Codificação multimodal: associe cada cor à sua posição espacial no botão.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: false,
      unitId: 'genius-colors',
      level
    };
  }

  // =========================================================================
  // 3. SESSÃO ATENÇÃO & REAÇÃO (Níveis 1 a 5)
  // =========================================================================

  /** ✅ ATENÇÃO: POSITIVA (att-match) */
  private generateAttentionMatchLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'att-m-' + Math.random().toString(36).substring(2, 9);
    const allColors = [
      { name: 'AZUL',    color: '#06b6d4', id: 'blue'   },
      { name: 'ROXO',    color: '#8b5cf6', id: 'violet' },
      { name: 'VERDE',   color: '#10b981', id: 'green'  },
      { name: 'LARANJA', color: '#f97316', id: 'orange' }
    ];

    // Quantidade de opções: L1=2, L2=3, L3+=4
    const count = level === 1 ? 2 : level === 2 ? 3 : 4;
    const shuffled = [...allColors].sort(() => Math.random() - 0.5).slice(0, count);
    const target = shuffled[Math.floor(Math.random() * shuffled.length)];
    // Tempos: L1=6.0s, L2=4.5s, L3=3.5s, L4=2.6s, L5=1.8s
    const timeMap: Record<ExerciseLevel, number> = { 1: 6.0, 2: 4.5, 3: 3.5, 4: 2.6, 5: 1.8 };

    return {
      id,
      category: 'ATTENTION',
      type: 'ATTENTION_TARGET',
      difficulty: level * 20,
      prompt: `Toque no botão com a cor: ${target.name}`,
      data: { isMatchColor: true, target, items: shuffled },
      options: shuffled,
      expectedAnswer: target.id,
      hintStrategy: 'Foque direto na cor do texto antes de mover o dedo.',
      explanationStrategy: 'Discriminação perceptual: toque firme e sem hesitação.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: true,
      unitId: 'att-match',
      subtype: 'MATCH',
      level
    };
  }

  /** 🚫 ATENÇÃO: NEGATIVA (att-negate) */
  private generateAttentionNegateLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'att-n-' + Math.random().toString(36).substring(2, 9);
    const allColors = [
      { name: 'AZUL',    color: '#06b6d4', id: 'blue'   },
      { name: 'ROXO',    color: '#8b5cf6', id: 'violet' },
      { name: 'VERDE',   color: '#10b981', id: 'green'  },
      { name: 'LARANJA', color: '#f97316', id: 'orange' }
    ];

    const count = level === 1 ? 2 : level === 2 ? 3 : 4;
    const shuffled = [...allColors].sort(() => Math.random() - 0.5).slice(0, count);
    const target = shuffled[Math.floor(Math.random() * shuffled.length)];
    const wrongOnes = shuffled.filter(c => c.id !== target.id);
    const expected = wrongOnes[0].id;
    const timeMap: Record<ExerciseLevel, number> = { 1: 6.0, 2: 4.5, 3: 3.5, 4: 2.6, 5: 1.8 };

    return {
      id,
      category: 'ATTENTION',
      type: 'ATTENTION_TARGET',
      difficulty: level * 20,
      prompt: `Toque no botão que NÃO é: ${target.name}`,
      data: { isMatchColor: false, target, items: shuffled },
      options: shuffled,
      expectedAnswer: expected,
      hintStrategy: 'Iniba o impulso automático de tocar na cor indicada!',
      explanationStrategy: 'Controle inibitório: desvie o olhar da cor citada.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: true,
      unitId: 'att-negate',
      subtype: 'NEGATE',
      level
    };
  }

  /** 🖊️ STROOP: COR DA TINTA (stroop-ink) */
  private generateStroopInkLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'str-i-' + Math.random().toString(36).substring(2, 9);
    const colors = [
      { name: 'AZUL',    color: '#06b6d4', id: 'blue'   },
      { name: 'ROXO',    color: '#8b5cf6', id: 'violet' },
      { name: 'VERDE',   color: '#10b981', id: 'green'  },
      { name: 'LARANJA', color: '#f97316', id: 'orange' }
    ];

    const wordItem = colors[Math.floor(Math.random() * colors.length)];
    const otherColors = colors.filter(c => c.name !== wordItem.name);
    // Nível 1: 75% congruente (palavra AZUL em azul)
    const isCongruent = level === 1 && Math.random() < 0.75;
    const inkItem = isCongruent ? wordItem : otherColors[Math.floor(Math.random() * otherColors.length)];

    const timeMap: Record<ExerciseLevel, number> = { 1: 8.0, 2: 6.0, 3: 4.5, 4: 3.2, 5: 2.2 };

    return {
      id,
      category: 'ATTENTION',
      type: 'STROOP_TEST',
      difficulty: level * 20,
      prompt: 'Toque na COR DA TINTA (ignore o que está escrito):',
      data: {
        wordText: wordItem.name,
        inkColor: inkItem.color,
        askForInk: true,
        mode: 'INK'
      },
      options: colors,
      expectedAnswer: inkItem.id,
      hintStrategy: 'Desfoque os olhos levemente para não ler o texto.',
      explanationStrategy: 'Seu cérebro lê o texto automaticamente. Force o foco visual apenas na cor.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: true,
      unitId: 'stroop-ink',
      subtype: 'INK',
      level
    };
  }

  /** 🔤 STROOP: PALAVRA ESCRITA (stroop-word) */
  private generateStroopWordLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'str-w-' + Math.random().toString(36).substring(2, 9);
    const colors = [
      { name: 'AZUL',    color: '#06b6d4', id: 'blue'   },
      { name: 'ROXO',    color: '#8b5cf6', id: 'violet' },
      { name: 'VERDE',   color: '#10b981', id: 'green'  },
      { name: 'LARANJA', color: '#f97316', id: 'orange' }
    ];

    const wordItem = colors[Math.floor(Math.random() * colors.length)];
    const otherColors = colors.filter(c => c.name !== wordItem.name);
    const isCongruent = level === 1 && Math.random() < 0.75;
    const inkItem = isCongruent ? wordItem : otherColors[Math.floor(Math.random() * otherColors.length)];

    const timeMap: Record<ExerciseLevel, number> = { 1: 8.0, 2: 6.0, 3: 4.5, 4: 3.2, 5: 2.2 };

    return {
      id,
      category: 'ATTENTION',
      type: 'STROOP_TEST',
      difficulty: level * 20,
      prompt: 'Toque na PALAVRA ESCRITA (ignore a cor da tinta):',
      data: {
        wordText: wordItem.name,
        inkColor: inkItem.color,
        askForInk: false,
        mode: 'WORD'
      },
      options: colors,
      expectedAnswer: wordItem.id,
      hintStrategy: 'Leia a palavra em voz alta mentalmente.',
      explanationStrategy: 'Foque na leitura do texto e descarte a cor visual.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: true,
      unitId: 'stroop-word',
      subtype: 'WORD',
      level
    };
  }

  /** 🔢 ORDENAÇÃO NUMÉRICA (number-ordering) */
  private generateNumberOrderingLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'ord-' + Math.random().toString(36).substring(2, 9);
    // Plano: L1=3 num (1 a 20), L2=4 num (1 a 50), L3=5 num (1 a 100), L4=6 num (1 a 150), L5=7 num (1 a 300)
    const countMap: Record<ExerciseLevel, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
    const maxValMap: Record<ExerciseLevel, number> = { 1: 20, 2: 50, 3: 100, 4: 150, 5: 300 };
    const timeMap: Record<ExerciseLevel, number> = { 1: 20, 2: 16, 3: 12, 4: 9, 5: 7 };

    const count = countMap[level];
    const maxVal = maxValMap[level];
    const numbers: number[] = [];

    while (numbers.length < count) {
      const num = Math.floor(Math.random() * maxVal) + 1;
      if (!numbers.includes(num)) numbers.push(num);
    }

    const sorted = [...numbers].sort((a, b) => a - b);

    return {
      id,
      category: 'ORDERING',
      type: 'NUMBER_ORDERING',
      difficulty: level * 20,
      prompt: `Toque nos ${count} números em ordem CRESCENTE:`,
      data: { numbers: [...numbers] },
      expectedAnswer: sorted,
      hintStrategy: 'Localize rapidamente o menor de todos primeiro.',
      explanationStrategy: 'Varredura visual rápida: busque a sequência do menor ao maior.',
      timeLimitSeconds: timeMap[level],
      hasTimerBar: true,
      unitId: 'number-ordering',
      level
    };
  }

  // =========================================================================
  // 4. SESSÃO RACIOCÍNIO LÓGICO (Níveis 1 a 5)
  // =========================================================================

  /** 📈 PADRÃO ARITMÉTICO (pat-arithmetic) */
  private generateLogicalPatternArithmeticLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'pat-a-' + Math.random().toString(36).substring(2, 9);
    let step = 1;
    let start = 1;
    let isDecreasing = false;
    let timeLimitSeconds = 20;

    if (level === 1) {
      // N1: Passos óbvios (+1, +2 ou -1). Tempo: 20 s.
      const choices = [1, 2, -1];
      step = choices[Math.floor(Math.random() * choices.length)];
      start = step < 0 ? 10 : (Math.floor(Math.random() * 4) + 1);
      timeLimitSeconds = 20;
    } else if (level === 2) {
      // N2: Passos médios (+3, +5, +10 ou -3, -5). Tempo: 16 s.
      const choices = [3, 5, 10, -3, -5];
      step = choices[Math.floor(Math.random() * choices.length)];
      start = step < 0 ? 30 : (Math.floor(Math.random() * 5) + 3);
      timeLimitSeconds = 16;
    } else if (level === 3) {
      // N3: Passos maiores (+6, +7, +8, +9). Tempo: 12 s.
      const choices = [6, 7, 8, 9, -7, -8];
      step = choices[Math.floor(Math.random() * choices.length)];
      start = step < 0 ? 50 : (Math.floor(Math.random() * 6) + 4);
      timeLimitSeconds = 12;
    } else if (level === 4) {
      // N4: Saltos incrementais (+1, +2, +3, +4). Tempo: 9 s.
      const baseStart = Math.floor(Math.random() * 5) + 2;
      const sequence = [baseStart, baseStart + 1, baseStart + 3, baseStart + 6, baseStart + 10];
      const nextNum = baseStart + 15;
      const options = this.generateNumericOptions(nextNum);
      return {
        id,
        category: 'LOGIC',
        type: 'LOGICAL_PATTERN',
        difficulty: 80,
        prompt: 'Qual é o próximo número da sequência?',
        data: { sequenceText: sequence.join(' → ') + ' → ?' },
        options,
        expectedAnswer: nextNum,
        hintStrategy: 'A diferença entre cada número aumenta em +1 (+1, +2, +3, +4, +5).',
        explanationStrategy: `Passos crescentes: último número (${sequence[4]}) + 5 = ${nextNum}.`,
        timeLimitSeconds: 9,
        hasTimerBar: true,
        unitId: 'pat-arithmetic',
        subtype: 'ARITHMETIC',
        level
      };
    } else {
      // N5: Passos compostos com dezenas (ex: +13, +17, -14). Tempo: 7 s.
      const choices = [13, 14, 16, 17, -13, -15];
      step = choices[Math.floor(Math.random() * choices.length)];
      start = step < 0 ? 90 : (Math.floor(Math.random() * 15) + 12);
      timeLimitSeconds = 7;
    }

    const sequence: number[] = [start, start + step, start + (step * 2), start + (step * 3)];
    const nextNum = start + (step * 4);
    const options = this.generateNumericOptions(nextNum);

    return {
      id,
      category: 'LOGIC',
      type: 'LOGICAL_PATTERN',
      difficulty: level * 20,
      prompt: 'Qual é o próximo número da sequência?',
      data: { sequenceText: sequence.join(' → ') + ' → ?' },
      options,
      expectedAnswer: nextNum,
      hintStrategy: `Calcule a diferença entre os dois primeiros números (${sequence[1]} - ${sequence[0]} = ${step}).`,
      explanationStrategy: `Progressão aritmética constante (${step >= 0 ? '+' : ''}${step}): ${sequence[3]} + (${step}) = ${nextNum}.`,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'pat-arithmetic',
      subtype: 'ARITHMETIC',
      level
    };
  }

  /** 🌀 PADRÃO GEOMÉTRICO (pat-geometric) */
  private generateLogicalPatternGeometricLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'pat-g-' + Math.random().toString(36).substring(2, 9);
    let sequence: number[] = [];
    let nextNum = 0;
    let ratio = 2;
    let timeLimitSeconds = 20;

    if (level === 1) {
      // N1: Multiplicação fixa simples por 2. Tempo: 20 s.
      const start = Math.floor(Math.random() * 2) + 1; // 1 ou 2
      ratio = 2;
      sequence = [start, start * 2, start * 4, start * 8];
      nextNum = start * 16;
      timeLimitSeconds = 20;
    } else if (level === 2) {
      // N2: x2 ou x10. Tempo: 16 s.
      const isX10 = Math.random() > 0.5;
      if (isX10) {
        const start = Math.floor(Math.random() * 3) + 2;
        sequence = [start, start * 10, start * 100, start * 1000];
        nextNum = start * 10000;
        ratio = 10;
      } else {
        const start = Math.floor(Math.random() * 4) + 3;
        sequence = [start, start * 2, start * 4, start * 8];
        nextNum = start * 16;
        ratio = 2;
      }
      timeLimitSeconds = 16;
    } else if (level === 3) {
      // N3: x3 ou /2. Tempo: 12 s.
      const isDiv = Math.random() > 0.5;
      if (isDiv) {
        sequence = [64, 32, 16, 8];
        nextNum = 4;
        ratio = 0.5;
      } else {
        sequence = [3, 9, 27, 81];
        nextNum = 243;
        ratio = 3;
      }
      timeLimitSeconds = 12;
    } else if (level === 4) {
      // N4: /3 ou x4. Tempo: 9 s.
      const isDiv = Math.random() > 0.5;
      if (isDiv) {
        sequence = [81, 27, 9, 3];
        nextNum = 1;
      } else {
        sequence = [2, 8, 32, 128];
        nextNum = 512;
      }
      timeLimitSeconds = 9;
    } else {
      // N5: Progressões decrescentes ou mistas (192, 96, 48, 24 -> 12). Tempo: 7 s.
      sequence = [192, 96, 48, 24];
      nextNum = 12;
      timeLimitSeconds = 7;
    }

    const options = this.generateNumericOptions(nextNum);

    return {
      id,
      category: 'LOGIC',
      type: 'LOGICAL_PATTERN',
      difficulty: level * 20,
      prompt: 'Progressão Geométrica — qual é o próximo número?',
      data: { sequenceText: sequence.join(' → ') + ' → ?' },
      options,
      expectedAnswer: nextNum,
      hintStrategy: 'Veja a razão de multiplicação ou divisão entre termos consecutivos.',
      explanationStrategy: `Progressão geométrica: o termo seguinte é obtido aplicando a mesma razão. Próximo = ${nextNum}.`,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'pat-geometric',
      subtype: 'GEOMETRIC',
      level
    };
  }

  /** 🧩 PADRÃO COMPLEXO (pat-complex) */
  private generateLogicalPatternComplexLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'pat-c-' + Math.random().toString(36).substring(2, 9);
    let sequence: number[] = [];
    let nextNum = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 20;

    if (level === 1) {
      // N1: Fibonacci elementar partindo de 1 (1 -> 1 -> 2 -> 3 -> 5 -> ? = 8). Tempo: 20 s.
      sequence = [1, 1, 2, 3, 5];
      nextNum = 8;
      timeLimitSeconds = 20;
      hint = 'Cada número é a soma dos dois números anteriores (1+1=2, 1+2=3, 2+3=5).';
      strategy = `Soma consecutiva: 3 + 5 = ${nextNum}.`;
    } else if (level === 2) {
      // N2: Fibonacci clássico (1 -> 2 -> 3 -> 5 -> 8 -> ? = 13). Tempo: 16 s.
      sequence = [1, 2, 3, 5, 8];
      nextNum = 13;
      timeLimitSeconds = 16;
      hint = 'Some os dois termos anteriores: 5 + 8.';
      strategy = `Fibonacci: 5 + 8 = ${nextNum}.`;
    } else if (level === 3) {
      // N3: Quadrados perfeitos (1, 4, 9, 16, 25 -> 36). Tempo: 12 s.
      sequence = [1, 4, 9, 16, 25];
      nextNum = 36;
      timeLimitSeconds = 12;
      hint = 'Cada termo é o quadrado de sua posição (1², 2², 3², 4², 5²).';
      strategy = `Quadrado perfeito de 6: 6 × 6 = ${nextNum}.`;
    } else if (level === 4) {
      // N4: Regras intercaladas (ex: 2, 10, 4, 20, 6, 30, ? -> 8). Tempo: 9 s.
      sequence = [2, 10, 4, 20, 6, 30];
      nextNum = 8;
      timeLimitSeconds = 9;
      hint = 'Observe os números pulando um termo: 2, 4, 6...';
      strategy = `Sequência intercalada: termos ímpares somam +2 (2, 4, 6, 8).`;
    } else {
      // N5: Padrões híbridos (x2 + 1: 2 -> 5 -> 11 -> 23 -> ? = 47). Tempo: 7 s.
      sequence = [2, 5, 11, 23];
      nextNum = 47;
      timeLimitSeconds = 7;
      hint = 'Dobre o número e adicione 1 (×2 + 1).';
      strategy = `Regra combinada: 23 × 2 + 1 = ${nextNum}.`;
    }

    const options = this.generateNumericOptions(nextNum);

    return {
      id,
      category: 'LOGIC',
      type: 'LOGICAL_PATTERN',
      difficulty: level * 20,
      prompt: 'Padrão Complexo — qual é o próximo número?',
      data: { sequenceText: sequence.join(' → ') + ' → ?' },
      options,
      expectedAnswer: nextNum,
      hintStrategy: hint,
      explanationStrategy: strategy,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'pat-complex',
      subtype: 'COMPLEX',
      level
    };
  }

  /** 📝 PROBLEMAS CONTEXTUAIS (word-problem) */
  private generateWordProblemLevel(level: ExerciseLevel): ExerciseQuestion {
    const id = 'wp-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let hint = '';
    let strategy = '';
    let timeLimitSeconds = 25;

    if (level === 1) {
      // N1: 1 único passo evidente, números baixos inteiros. Tempo: 25 s.
      const isFruit = Math.random() > 0.5;
      if (isFruit) {
        const price = Math.floor(Math.random() * 3) + 2; // 2 a 4
        const qty = Math.floor(Math.random() * 3) + 2;   // 2 a 4
        expected = price * qty;
        prompt = `Se 1 maçã custa R$ ${price}, quanto custam ${qty} maçãs?`;
        hint = `Multiplique o preço unitário (${price}) pela quantidade (${qty}).`;
        strategy = `${qty} × R$ ${price} = R$ ${expected}.`;
      } else {
        const speed = (Math.floor(Math.random() * 3) + 2) * 10; // 20, 30, 40 km/h
        const hours = 2;
        expected = speed * hours;
        prompt = `Um ciclista a ${speed} km/h durante ${hours} horas percorre quantos km?`;
        hint = `Distância = Velocidade × Tempo (${speed} × ${hours}).`;
        strategy = `${speed} km/h × ${hours} h = ${expected} km.`;
      }
      timeLimitSeconds = 25;
    } else if (level === 2) {
      // N2: Regra de 3 simples direta ou D = V x T com números redondos. Tempo: 20 s.
      const price = Math.floor(Math.random() * 4) + 3; // 3 a 6
      const q1 = 2;
      const cost1 = price * q1;
      const q2 = Math.floor(Math.random() * 3) + 4; // 4 a 6
      expected = price * q2;
      prompt = `Se ${q1} cadernos custam R$ ${cost1}, quanto custarão ${q2} cadernos?`;
      timeLimitSeconds = 20;
      hint = `Descubra quanto custa 1 caderno: R$ ${cost1} ÷ ${q1} = R$ ${price}.`;
      strategy = `Cada caderno custa R$ ${price}. Multiplique por ${q2} = R$ ${expected}.`;
    } else if (level === 3) {
      // N3: Velocidade média ou estimativa com arredondamento. Tempo: 16 s.
      const hours = [2, 3, 4][Math.floor(Math.random() * 3)];
      const speed = (Math.floor(Math.random() * 5) + 6) * 10; // 60, 70, 80...
      const dist = speed * hours;
      prompt = `Um trem percorre ${dist} km em ${hours} horas. Qual é a velocidade média?`;
      expected = speed;
      timeLimitSeconds = 16;
      hint = `Velocidade = Distância ÷ Tempo (${dist} ÷ ${hours}).`;
      strategy = `${dist} km ÷ ${hours} h = ${expected} km/h.`;
    } else if (level === 4) {
      // N4: Problemas de 2 etapas (custo total + troco). Tempo: 12 s.
      const itemPrice = Math.floor(Math.random() * 6) + 12; // 12 a 17
      const qty = 3;
      const totalCost = itemPrice * qty;
      const paid = 100;
      expected = paid - totalCost;
      prompt = `Comprei 3 itens de R$ ${itemPrice} cada e paguei com uma nota de R$ 100. Qual o troco?`;
      timeLimitSeconds = 12;
      hint = `Calcule o total gasto (3 × R$ ${itemPrice} = R$ ${totalCost}) e subtraia de 100.`;
      strategy = `Custo: R$ ${totalCost}. Troco: R$ 100 - R$ ${totalCost} = R$ ${expected}.`;
    } else {
      // N5: Problemas compostos ou proporções inversas. Tempo: 9 s.
      const taps = 4;
      const hours = 6;
      const newTaps = 8;
      expected = Math.round((taps * hours) / newTaps);
      prompt = `Se ${taps} torneiras enchem um tanque em ${hours} horas, ${newTaps} torneiras levarão quantas horas?`;
      timeLimitSeconds = 9;
      hint = 'Mais torneiras levam MENOS tempo (proporção inversa).';
      strategy = `Mais torneiras duplicadas → tempo dividido pela metade: ${hours} ÷ 2 = ${expected} horas.`;
    }

    const options = this.generateNumericOptions(expected);

    return {
      id,
      category: 'CALCULATION',
      type: 'WORD_PROBLEM',
      difficulty: level * 20,
      prompt,
      data: { equation: prompt, level },
      options,
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true,
      unitId: 'word-problem',
      level
    };
  }

  // Gera opções numéricas realistas para questões de múltipla escolha
  private generateNumericOptions(correct: number): number[] {
    const options = new Set<number>([correct]);
    const offsets = [-10, 10, -2, 2, -1, 1, -5, 5, -3, 3, -20, 20];
    
    let attempts = 0;
    while (options.size < 4 && attempts < 30) {
      attempts++;
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = correct + offset;
      if (candidate > 0 && candidate !== correct) {
        options.add(candidate);
      }
    }

    while (options.size < 4) {
      const candidate = Math.max(1, correct + (options.size * 2) - 1);
      options.add(candidate);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }
}
