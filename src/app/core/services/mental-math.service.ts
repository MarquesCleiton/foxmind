import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { 
  MathDomain, 
  MathKnowledgeItem, 
  MathMasteryLevel,
  DomainMasterySummary
} from '../models/mental-math.models';
import { ExerciseQuestion } from '../models/cognitive.models';

@Injectable({
  providedIn: 'root'
})
export class MentalMathService {
  private storage = inject(StorageService);

  // Cache em memória do banco de conhecimento
  private knowledgeBank = new Map<string, MathKnowledgeItem>();
  private isLoaded = false;
  private recentQuestionsQueue: string[] = []; // Evita repetição imediata (Sec. 31)

  constructor() {
    this.initKnowledgeBank();
  }

  // Inicializa o banco de conhecimento (45 adições, 36 tabuadas, subtrações, divisões e porcentagens)
  public async initKnowledgeBank(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const persisted = await this.storage.getAllMathMastery();
      if (persisted && persisted.length > 0) {
        persisted.forEach(item => this.knowledgeBank.set(item.knowledgeId, item));
      } else {
        // Gera o banco inicial padrão conforme especificação
        const initialItems = this.generateInitialFactBank();
        await this.storage.saveMathMasteryBulk(initialItems);
        initialItems.forEach(item => this.knowledgeBank.set(item.knowledgeId, item));
      }
      this.isLoaded = true;
    } catch (e) {
      console.warn('Erro ao inicializar banco de matemática mental:', e);
      // Fallback em memória
      const initialItems = this.generateInitialFactBank();
      initialItems.forEach(item => this.knowledgeBank.set(item.knowledgeId, item));
      this.isLoaded = true;
    }
  }

  // 45 Adições (1+1 a 9+9 com equivalência comutativa)
  // 36 Multiplicações (2×2 a 9×9 com equivalência comutativa)
  // 36 Subtrações positivas + negativas + complementos de 10
  // Famílias de divisão e porcentagens fundamentais
  private generateInitialFactBank(): MathKnowledgeItem[] {
    const items: MathKnowledgeItem[] = [];

    // 1. ADIÇÃO: 45 combinações únicas (1+1 ... 9+9)
    for (let a = 1; a <= 9; a++) {
      for (let b = a; b <= 9; b++) {
        items.push({
          knowledgeId: `add_${a}_${b}`,
          domain: 'ADDITION',
          familyId: `fam_add_${a}_${b}_${a + b}`,
          operandA: a,
          operandB: b,
          result: a + b,
          difficulty: Math.round(10 + ((a + b) / 18) * 40),
          attempts: 0,
          correctCount: 0,
          avgResponseTimeMs: 0,
          recentErrors: 0,
          masteryLevel: 'UNMASTERED',
          lastReviewedAt: 0
        });
      }
    }

    // 2. SUBTRAÇÃO: 36 combinações positivas simples de 1 algarismo (2-1 ... 9-8)
    for (let a = 2; a <= 9; a++) {
      for (let b = 1; b < a; b++) {
        items.push({
          knowledgeId: `sub_${a}_${b}`,
          domain: 'SUBTRACTION',
          familyId: `fam_sub_${a}_${b}_${a - b}`,
          operandA: a,
          operandB: b,
          result: a - b,
          difficulty: Math.round(15 + (a / 9) * 35),
          attempts: 0,
          correctCount: 0,
          avgResponseTimeMs: 0,
          recentErrors: 0,
          masteryLevel: 'UNMASTERED',
          lastReviewedAt: 0
        });
      }
    }

    // 3. MULTIPLICAÇÃO: 36 combinações fundamentais (2×2 ... 9×9)
    for (let a = 2; a <= 9; a++) {
      for (let b = a; b <= 9; b++) {
        items.push({
          knowledgeId: `mult_${a}_${b}`,
          domain: 'MULTIPLICATION',
          familyId: `fam_mult_div_${a}_${b}_${a * b}`,
          operandA: a,
          operandB: b,
          result: a * b,
          difficulty: Math.round(20 + ((a * b) / 81) * 60),
          attempts: 0,
          correctCount: 0,
          avgResponseTimeMs: 0,
          recentErrors: 0,
          masteryLevel: 'UNMASTERED',
          lastReviewedAt: 0
        });
      }
    }

    // 4. DIVISÃO: Fatos derivados das famílias da tabuada + divisores convenientes
    for (let b = 2; b <= 9; b++) {
      for (let quotient = 2; quotient <= 9; quotient++) {
        const dividend = b * quotient;
        items.push({
          knowledgeId: `div_${dividend}_${b}`,
          domain: 'DIVISION',
          familyId: `fam_mult_div_${Math.min(b, quotient)}_${Math.max(b, quotient)}_${dividend}`,
          operandA: dividend,
          operandB: b,
          result: quotient,
          difficulty: Math.round(25 + (dividend / 81) * 55),
          attempts: 0,
          correctCount: 0,
          avgResponseTimeMs: 0,
          recentErrors: 0,
          masteryLevel: 'UNMASTERED',
          lastReviewedAt: 0
        });
      }
    }

    // 5. PORCENTAGEM: Benchmarks fundamentais e decomposições (Sec. 14, 15, 16)
    const baseNumbers = [60, 120, 180, 200, 240, 300, 360, 400, 500, 800];
    const benchmarkPercents = [1, 5, 10, 15, 20, 25, 50, 75];

    baseNumbers.forEach(base => {
      benchmarkPercents.forEach(pct => {
        const val = Math.round((pct / 100) * base);
        items.push({
          knowledgeId: `pct_${pct}_${base}`,
          domain: 'PERCENTAGE',
          familyId: `fam_pct_${pct}_${base}_${val}`,
          operandA: pct,
          operandB: base,
          result: val,
          difficulty: Math.round(20 + (pct / 75) * 50),
          attempts: 0,
          correctCount: 0,
          avgResponseTimeMs: 0,
          recentErrors: 0,
          masteryLevel: 'UNMASTERED',
          lastReviewedAt: 0
        });
      });
    });

    return items;
  }

  // Gera uma questão de Matemática Mental respeitando Domínio, Afunilamento e Variações
  public generateQuestion(
    domain: MathDomain | 'MIXED', 
    userDifficulty: number
  ): ExerciseQuestion {
    // Se for treino misto, sorteia uma das 5 operações
    let activeDomain: MathDomain;
    if (domain === 'MIXED') {
      const domains: MathDomain[] = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PERCENTAGE'];
      activeDomain = domains[Math.floor(Math.random() * domains.length)];
    } else {
      activeDomain = domain;
    }

    switch (activeDomain) {
      case 'ADDITION':
        return this.generateAdditionQuestion(userDifficulty);
      case 'SUBTRACTION':
        return this.generateSubtractionQuestion(userDifficulty);
      case 'MULTIPLICATION':
        return this.generateMultiplicationQuestion(userDifficulty);
      case 'DIVISION':
        return this.generateDivisionQuestion(userDifficulty);
      case 'PERCENTAGE':
        return this.generatePercentageQuestion(userDifficulty);
    }
  }

  // ==================== 1. ADIÇÃO (Sec. 9) ====================
  // Progressão: Fase 1 (Direta) ➔ Fase 2 (Invertida) ➔ Fase 3 (Transferência) ➔ Fase 4 (2 Algarismos) ➔ Fase 5 (Decomposição)
  private generateAdditionQuestion(difficulty: number): ExerciseQuestion {
    const id = 'add-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let strategy = '';
    let hint = '';
    let timeLimit = Math.max(5, Math.round(15 - (difficulty * 0.1)));
    let format = 'ADD_DIRECT';
    let knowledgeId = '';

    if (difficulty <= 25) {
      // Fase 1 ou 2: Fundamental 1 a 9 (direta ou invertida)
      const fact = this.selectFactItem('ADDITION', difficulty);
      knowledgeId = fact.knowledgeId;
      const isReversed = Math.random() > 0.5;
      const a = isReversed ? fact.operandB : fact.operandA;
      const b = isReversed ? fact.operandA : fact.operandB;
      format = isReversed ? 'ADD_INVERTED' : 'ADD_DIRECT';

      prompt = `${a} + ${b}`;
      expected = a + b;
      hint = `Relação comutativa: ${a} + ${b} é o mesmo que ${b} + ${a}.`;
      strategy = `Recuperação direta: ${a} + ${b} = ${expected}.`;
      timeLimit = 8;
    } else if (difficulty <= 50) {
      // Fase 3: Transferência (ex: 17 + 8, 27 + 9, 38 + 7)
      format = 'ADD_TRANSFER';
      const fact = this.selectFactItem('ADDITION', difficulty);
      knowledgeId = fact.knowledgeId;
      const tens = (Math.floor(Math.random() * 4) + 1) * 10;
      const a = tens + fact.operandA;
      const b = fact.operandB;
      prompt = `${a} + ${b}`;
      expected = a + b;
      hint = `Some as unidades primeiro: ${fact.operandA} + ${b} = ${fact.operandA + b}.`;
      strategy = `Transferência: ${a} + ${b} = ${tens} + (${fact.operandA} + ${b}) = ${expected}.`;
      timeLimit = 10;
    } else if (difficulty <= 75) {
      // Fase 4: Dois algarismos (ex: 47 + 38, 63 + 29)
      format = 'ADD_TWO_DIGIT';
      const a = Math.floor(Math.random() * 45) + 24;
      const b = Math.floor(Math.random() * 35) + 16;
      knowledgeId = `add_${Math.min(a, b)}_${Math.max(a, b)}`;
      prompt = `${a} + ${b}`;
      expected = a + b;
      const tensA = Math.floor(a / 10) * 10;
      const tensB = Math.floor(b / 10) * 10;
      const unitSum = (a % 10) + (b % 10);
      hint = `Some as dezenas (${tensA} + ${tensB} = ${tensA + tensB}) e depois as unidades.`;
      strategy = `Decomposição: (${tensA} + ${tensB} = ${tensA + tensB}) + (${a % 10} + ${b % 10} = ${unitSum}) = ${expected}.`;
      timeLimit = 12;
    } else {
      // Fase 5: Estratégias mentais rápidas (ex: 48 + 37 -> 48 + 30 = 78, 78 + 7 = 85)
      format = 'ADD_DECOMPOSITION';
      const a = Math.floor(Math.random() * 50) + 38;
      const b = Math.floor(Math.random() * 40) + 27;
      knowledgeId = `add_${Math.min(a, b)}_${Math.max(a, b)}`;
      prompt = `${a} + ${b}`;
      expected = a + b;
      const roundB = Math.floor(b / 10) * 10;
      const unitB = b % 10;
      hint = `Adicione primeiro a dezena inteira (${a} + ${roundB}).`;
      strategy = `Estratégia: ${a} + ${roundB} = ${a + roundB}, depois ${a + roundB} + ${unitB} = ${expected}.`;
      timeLimit = 12;
    }

    this.trackRecent(prompt);

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty,
      prompt,
      data: { equation: prompt, domain: 'ADDITION', format },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds: timeLimit,
      hasTimerBar: true,
      knowledgeId,
      mathDomain: 'ADDITION',
      mathFormat: format
    };
  }

  // ==================== 2. SUBTRAÇÃO (Sec. 10) ====================
  // Progressão: Simples ➔ Resultados Negativos ➔ Complemento para 10 ➔ 2 Algarismos ➔ Decomposição (83 - 47)
  private generateSubtractionQuestion(difficulty: number): ExerciseQuestion {
    const id = 'sub-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let strategy = '';
    let hint = '';
    let timeLimit = Math.max(5, Math.round(15 - (difficulty * 0.1)));
    let format = 'SUB_DIRECT';
    let knowledgeId = '';

    if (difficulty <= 25) {
      // Subtração simples de 1 dígito
      const fact = this.selectFactItem('SUBTRACTION', difficulty);
      knowledgeId = fact.knowledgeId;
      format = 'SUB_DIRECT';
      prompt = `${fact.operandA} - ${fact.operandB}`;
      expected = fact.operandA - fact.operandB;
      hint = `Pense: qual número somado a ${fact.operandB} resulta em ${fact.operandA}?`;
      strategy = `Recuperação direta: ${fact.operandA} - ${fact.operandB} = ${expected}.`;
      timeLimit = 7;
    } else if (difficulty <= 45) {
      // Alternância entre Complemento para 10 OU Resultado Negativo
      if (Math.random() > 0.45) {
        format = 'SUB_COMPLEMENT_10';
        const u = Math.floor(Math.random() * 8) + 2;
        knowledgeId = `sub_10_${u}`;
        prompt = `10 - ${u}`;
        expected = 10 - u;
        hint = `Complemento para 10: quanto falta para ${u} chegar em 10?`;
        strategy = `Complemento para 10: 10 - ${u} = ${expected}.`;
        timeLimit = 6;
      } else {
        format = 'SUB_NEGATIVE';
        // Conjunto negativo (ex: 3 - 8 = -5)
        const a = Math.floor(Math.random() * 5) + 2;
        const b = a + Math.floor(Math.random() * 5) + 2;
        knowledgeId = `sub_${a}_${b}`;
        prompt = `${a} - ${b}`;
        expected = a - b;
        hint = `Como ${a} é menor que ${b}, o resultado será negativo. Faça -(${b} - ${a}).`;
        strategy = `Resultado negativo: ${a} - ${b} = -(${b} - ${a}) = ${expected}.`;
        timeLimit = 8;
      }
    } else {
      // Subtração de 2 algarismos e decomposição (ex: 83 - 47)
      format = 'SUB_DECOMPOSITION';
      const bTens = Math.floor(Math.random() * 4) + 2; // 2 a 5
      const bUnits = Math.floor(Math.random() * 7) + 3; // 3 a 9
      const b = (bTens * 10) + bUnits;
      const a = b + Math.floor(Math.random() * 35) + 12;
      knowledgeId = `sub_${a}_${b}`;
      prompt = `${a} - ${b}`;
      expected = a - b;

      const step1 = a - (bTens * 10);
      hint = `Subtraia a dezena primeiro: ${a} - ${bTens * 10} = ${step1}. Depois tire as unidades (${bUnits}).`;
      strategy = `Decomposição: ${a} - ${bTens * 10} = ${step1}, depois ${step1} - ${bUnits} = ${expected}.`;
      timeLimit = 12;
    }

    this.trackRecent(prompt);

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty,
      prompt,
      data: { equation: prompt, domain: 'SUBTRACTION', format },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds: timeLimit,
      hasTimerBar: true,
      knowledgeId,
      mathDomain: 'SUBTRACTION',
      mathFormat: format
    };
  }

  // ==================== 3. MULTIPLICAÇÃO (Sec. 11) ====================
  // Progressão: Fase 1 (Direta) ➔ Fase 2 (Invertida) ➔ Fase 3 (Fator Ausente: ? × 8 = 56) ➔ Fase 4 (2 Dígitos: 37 × 24) ➔ Fase 5 (Transferência de Dezenas: 70 × 8)
  private generateMultiplicationQuestion(difficulty: number): ExerciseQuestion {
    const id = 'mult-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let strategy = '';
    let hint = '';
    let timeLimit = Math.max(5, Math.round(15 - (difficulty * 0.1)));
    let format = 'MULT_DIRECT';
    let knowledgeId = '';

    if (difficulty <= 30) {
      // Fase 1 & 2: Tabuada Fundamental de 2 a 9 (direta ou invertida)
      const fact = this.selectFactItem('MULTIPLICATION', difficulty);
      knowledgeId = fact.knowledgeId;
      const isReversed = Math.random() > 0.5;
      const a = isReversed ? fact.operandB : fact.operandA;
      const b = isReversed ? fact.operandA : fact.operandB;
      format = isReversed ? 'MULT_INVERTED' : 'MULT_DIRECT';

      prompt = `${a} × ${b}`;
      expected = a * b;
      hint = `Equivalência comutativa: ${a} × ${b} = ${b} × ${a}.`;
      strategy = `Tabuada fundamental: ${a} × ${b} = ${expected}.`;
      timeLimit = 8;
    } else if (difficulty <= 55) {
      // Fase 3: Fator Ausente (? × 8 = 56 ou 7 × ? = 56)
      format = 'MULT_MISSING_OPERAND';
      const fact = this.selectFactItem('MULTIPLICATION', difficulty);
      knowledgeId = fact.knowledgeId;
      const prod = fact.operandA * fact.operandB;
      const hideFirst = Math.random() > 0.5;

      if (hideFirst) {
        prompt = `? × ${fact.operandB} = ${prod}`;
        expected = fact.operandA;
        hint = `Pense na relação inversa: ${prod} ÷ ${fact.operandB} = ?`;
        strategy = `Fator ausente: ${prod} ÷ ${fact.operandB} = ${expected}, logo ${expected} × ${fact.operandB} = ${prod}.`;
      } else {
        prompt = `${fact.operandA} × ? = ${prod}`;
        expected = fact.operandB;
        hint = `Pense na relação inversa: ${prod} ÷ ${fact.operandA} = ?`;
        strategy = `Fator ausente: ${prod} ÷ ${fact.operandA} = ${expected}, logo ${fact.operandA} × ${expected} = ${prod}.`;
      }
      timeLimit = 9;
    } else if (difficulty <= 75) {
      // Fase 5: Transferência com dezenas (ex: 70 × 8, 7 × 80, 70 × 80)
      format = 'MULT_TRANSFER_TENS';
      const fact = this.selectFactItem('MULTIPLICATION', difficulty);
      knowledgeId = fact.knowledgeId;
      const mode = Math.random();

      if (mode < 0.4) {
        prompt = `${fact.operandA * 10} × ${fact.operandB}`;
        expected = (fact.operandA * 10) * fact.operandB;
        hint = `Multiplique os dígitos fundamentais (${fact.operandA} × ${fact.operandB}) e acrescente 1 zero.`;
        strategy = `Transferência: ${fact.operandA} × ${fact.operandB} = ${fact.operandA * fact.operandB} ➔ ${fact.operandA * 10} × ${fact.operandB} = ${expected}.`;
      } else if (mode < 0.8) {
        prompt = `${fact.operandA} × ${fact.operandB * 10}`;
        expected = fact.operandA * (fact.operandB * 10);
        hint = `Multiplique os dígitos fundamentais (${fact.operandA} × ${fact.operandB}) e acrescente 1 zero.`;
        strategy = `Transferência: ${fact.operandA} × ${fact.operandB} = ${fact.operandA * fact.operandB} ➔ ${expected}.`;
      } else {
        prompt = `${fact.operandA * 10} × ${fact.operandB * 10}`;
        expected = (fact.operandA * 10) * (fact.operandB * 10);
        hint = `Multiplique ${fact.operandA} × ${fact.operandB} e adicione 2 zeros ao final.`;
        strategy = `Transferência de ordens: (${fact.operandA} × ${fact.operandB} = ${fact.operandA * fact.operandB}) × 100 = ${expected}.`;
      }
      timeLimit = 10;
    } else {
      // Fase 4: Dois algarismos com decomposição (ex: 37 × 24 = 37×20 + 37×4)
      format = 'MULT_TWO_DIGIT';
      const a = Math.floor(Math.random() * 20) + 21; // 21 a 40
      const bTens = Math.floor(Math.random() * 2) + 1; // 1 ou 2
      const bUnits = Math.floor(Math.random() * 6) + 3; // 3 a 8
      const b = (bTens * 10) + bUnits;
      knowledgeId = `mult_${a}_${b}`;
      prompt = `${a} × ${b}`;
      expected = a * b;

      const p1 = a * (bTens * 10);
      const p2 = a * bUnits;
      hint = `Distribua: (${a} × ${bTens * 10}) + (${a} × ${bUnits}).`;
      strategy = `Distribuição mental: (${a} × ${bTens * 10} = ${p1}) + (${a} × ${bUnits} = ${p2}) = ${expected}.`;
      timeLimit = 15;
    }

    this.trackRecent(prompt);

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty,
      prompt,
      data: { equation: prompt, domain: 'MULTIPLICATION', format },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds: timeLimit,
      hasTimerBar: true,
      knowledgeId,
      mathDomain: 'MULTIPLICATION',
      mathFormat: format
    };
  }

  // ==================== 4. DIVISÃO (Sec. 12) ====================
  // Tipos: Direta ➔ Relação multiplicativa ➔ Quantos cabem? ➔ Decomposição ➔ Divisores convenientes ➔ Estimativa ➔ Resto ➔ Contexto
  private generateDivisionQuestion(difficulty: number): ExerciseQuestion {
    const id = 'div-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected: any = 0;
    let strategy = '';
    let hint = '';
    let timeLimit = Math.max(6, Math.round(16 - (difficulty * 0.1)));
    let format = 'DIV_DIRECT';
    let knowledgeId = '';

    if (difficulty <= 25) {
      // 12.1 Direta exata da tabuada (ex: 56 ÷ 7)
      const fact = this.selectFactItem('DIVISION', difficulty);
      knowledgeId = fact.knowledgeId;
      format = 'DIV_DIRECT';
      prompt = `${fact.operandA} ÷ ${fact.operandB}`;
      expected = fact.result;
      hint = `Pense na tabuada: qual número vezes ${fact.operandB} resulta em ${fact.operandA}?`;
      strategy = `Divisão direta: ${fact.operandA} ÷ ${fact.operandB} = ${expected}, pois ${expected} × ${fact.operandB} = ${fact.operandA}.`;
      timeLimit = 8;
    } else if (difficulty <= 40) {
      // 12.2 Relação multiplicativa / Fator ausente (ex: ? ÷ 7 = 8 ou 56 ÷ ? = 8)
      format = 'DIV_MISSING_OPERAND';
      const fact = this.selectFactItem('DIVISION', difficulty);
      knowledgeId = fact.knowledgeId;
      const hideDividend = Math.random() > 0.5;

      if (hideDividend) {
        prompt = `? ÷ ${fact.operandB} = ${fact.result}`;
        expected = fact.operandA;
        hint = `Multiplique o quociente pelo divisor: ${fact.result} × ${fact.operandB}.`;
        strategy = `Operação inversa: ? = ${fact.result} × ${fact.operandB} = ${expected}.`;
      } else {
        prompt = `${fact.operandA} ÷ ? = ${fact.result}`;
        expected = fact.operandB;
        hint = `Divida ${fact.operandA} pelo resultado (${fact.result}).`;
        strategy = `Divisor ausente: ${fact.operandA} ÷ ${fact.result} = ${expected}.`;
      }
      timeLimit = 9;
    } else if (difficulty <= 60) {
      // 12.4 Decomposição OU 12.3 Quantos cabem? (ex: 156 ÷ 12 ou 168 ÷ 12)
      format = 'DIV_DECOMPOSITION';
      const divisor = [12, 14, 15, 16][Math.floor(Math.random() * 4)];
      const quotientUnits = Math.floor(Math.random() * 5) + 2; // 2 a 6
      const quotient = 10 + quotientUnits; // 12 a 16
      const dividend = divisor * quotient;
      knowledgeId = `div_${dividend}_${divisor}`;
      prompt = `${dividend} ÷ ${divisor}`;
      expected = quotient;

      const part1 = divisor * 10;
      const remainder = dividend - part1;
      hint = `Quebre em partes conhecidas: ${divisor} × 10 = ${part1}. Sobram ${remainder}.`;
      strategy = `Decomposição: (${part1} ÷ ${divisor} = 10) + (${remainder} ÷ ${divisor} = ${quotientUnits}) = ${expected}.`;
      timeLimit = 12;
    } else if (difficulty <= 80) {
      // 12.5 Divisores convenientes (ex: 850 ÷ 25 = 850 ÷ 100 × 4)
      format = 'DIV_CONVENIENT';
      const base = (Math.floor(Math.random() * 12) + 11) * 50; // 550, 600, 650, 700, 850...
      const divisor = 25;
      knowledgeId = `div_${base}_${divisor}`;
      prompt = `${base} ÷ 25`;
      expected = base / 25;
      const step100 = base / 100;
      hint = `Dica de divisor conveniente: dividir por 25 é o mesmo que dividir por 100 e multiplicar por 4!`;
      strategy = `Divisor conveniente: ${base} ÷ 100 = ${step100}. Agora faça ${step100} × 4 = ${expected}.`;
      timeLimit = 12;
    } else {
      // 12.7 Divisão com Resto (ex: 137 ÷ 12 = 11 resto 5) OU 12.6 Estimativa (387 ÷ 19 ≈ 20)
      if (Math.random() > 0.5) {
        format = 'DIV_REMAINDER';
        const divisor = [7, 8, 9, 12][Math.floor(Math.random() * 4)];
        const quotient = Math.floor(Math.random() * 7) + 8; // 8 a 14
        const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
        const dividend = (divisor * quotient) + remainder;
        knowledgeId = `div_rem_${dividend}_${divisor}`;
        prompt = `Qual o RESTO de ${dividend} ÷ ${divisor}?`;
        expected = remainder;
        hint = `O maior múltiplo de ${divisor} menor que ${dividend} é ${divisor * quotient}.`;
        strategy = `${dividend} = (${divisor} × ${quotient} = ${divisor * quotient}) + ${remainder}. Resto = ${expected}.`;
        timeLimit = 12;
      } else {
        format = 'DIV_ESTIMATION';
        // 387 ÷ 19 ≈ 387 ÷ 20 ≈ 19 ou 20
        const divisorReal = 19;
        const approxDivisor = 20;
        const base = (Math.floor(Math.random() * 10) + 15) * approxDivisor; // 300, 320, 340...
        const jitter = Math.floor(Math.random() * 7) - 3;
        const dividend = base + jitter;
        const approxResult = Math.round(dividend / approxDivisor);
        knowledgeId = `div_est_${dividend}_${divisorReal}`;
        prompt = `Estime: ${dividend} ÷ ${divisorReal} ≈ ?`;
        expected = approxResult;
        hint = `Arredonde ${divisorReal} para ${approxDivisor}. Calcule ${dividend} ÷ ${approxDivisor}.`;
        strategy = `Estimativa: ${divisorReal} ≈ ${approxDivisor}. Fazendo ${dividend} ÷ ${approxDivisor} temos aproximadamente ${expected}.`;
        timeLimit = 10;
      }
    }

    this.trackRecent(prompt);

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty,
      prompt,
      data: { equation: prompt, domain: 'DIVISION', format },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds: timeLimit,
      hasTimerBar: true,
      knowledgeId,
      mathDomain: 'DIVISION',
      mathFormat: format
    };
  }

  // ==================== 5. PORCENTAGEM (Módulo Dedicado - Sec. 13-26) ====================
  // Tipos: Benchmarks ➔ Decomposição ➔ Frações ➔ Porcentagem Reversa ➔ Descobrir % ➔ Aumento/Desconto ➔ Sucessivas ➔ Comparação ➔ Estimativa
  private generatePercentageQuestion(difficulty: number): ExerciseQuestion {
    const id = 'pct-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expected = 0;
    let strategy = '';
    let hint = '';
    let timeLimit = Math.max(6, Math.round(18 - (difficulty * 0.1)));
    let format = 'PCT_BENCHMARK';
    let knowledgeId = '';

    if (difficulty <= 25) {
      // Sec. 14: Porcentagens fundamentais de referência (10%, 50%, 25%, 5%)
      format = 'PCT_BENCHMARK';
      const base = (Math.floor(Math.random() * 8) + 2) * 40; // 80, 120, 160, 200, 240...
      const pct = [10, 25, 50, 5][Math.floor(Math.random() * 4)];
      knowledgeId = `pct_${pct}_${base}`;
      prompt = `${pct}% de ${base}`;
      expected = Math.round((pct / 100) * base);

      if (pct === 10) {
        hint = `10% de um número é simplesmente dividir por 10.`;
        strategy = `${base} ÷ 10 = ${expected}.`;
      } else if (pct === 50) {
        hint = `50% é a metade (dividir por 2).`;
        strategy = `${base} ÷ 2 = ${expected}.`;
      } else if (pct === 25) {
        hint = `25% é metade da metade (dividir por 4).`;
        strategy = `${base} ÷ 4 = ${expected}.`;
      } else {
        hint = `5% é a metade de 10% (${base / 10} ÷ 2).`;
        strategy = `10% de ${base} = ${base / 10}. Metade = ${expected}.`;
      }
      timeLimit = 8;
    } else if (difficulty <= 45) {
      // Sec. 15: Decomposição (15%, 35%, 20%) OU Sec. 16: Frações (25% = 1/4)
      if (Math.random() > 0.4) {
        format = 'PCT_DECOMPOSITION';
        const base = (Math.floor(Math.random() * 8) + 3) * 60; // 180, 240, 300, 360...
        const pct = [15, 20, 35][Math.floor(Math.random() * 3)];
        knowledgeId = `pct_dec_${pct}_${base}`;
        prompt = `${pct}% de ${base}`;
        expected = Math.round((pct / 100) * base);

        const tenVal = base * 0.1;
        const fiveVal = base * 0.05;
        if (pct === 15) {
          hint = `Decomponha: 15% = 10% (${tenVal}) + 5% (${fiveVal}).`;
          strategy = `10% de ${base} = ${tenVal}. 5% = ${fiveVal}. Somando: ${tenVal} + ${fiveVal} = ${expected}.`;
        } else if (pct === 35) {
          hint = `Decomponha: 30% (${tenVal * 3}) + 5% (${fiveVal}).`;
          strategy = `30% de ${base} = ${tenVal * 3}. 5% = ${fiveVal}. Total: ${tenVal * 3 + fiveVal} = ${expected}.`;
        } else {
          hint = `20% é o dobro de 10% (${tenVal} × 2).`;
          strategy = `10% = ${tenVal}. Multiplique por 2 = ${expected}.`;
        }
      } else {
        format = 'PCT_FRACTION';
        const base = (Math.floor(Math.random() * 8) + 4) * 40;
        knowledgeId = `pct_frac_25_${base}`;
        prompt = `25% de ${base}`;
        expected = base / 4;
        hint = `25% corresponde à fração 1/4. Divida por 4.`;
        strategy = `Fração equivalente: 25% = 1/4. ${base} ÷ 4 = ${expected}.`;
      }
      timeLimit = 10;
    } else if (difficulty <= 65) {
      // Sec. 17: Porcentagem Reversa (ex: 60 é 20% de quanto?) OU Sec. 18: Descobrir a porcentagem
      if (Math.random() > 0.5) {
        format = 'PCT_REVERSE';
        // 60 é 20% de quanto? (60 × 5 = 300)
        const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        const multiplier = 100 / pct;
        const part = Math.floor(Math.random() * 15) + 6; // ex: 12
        const total = part * multiplier;
        knowledgeId = `pct_rev_${pct}_${part}`;
        prompt = `${part} é ${pct}% de qual número?`;
        expected = total;
        hint = `${pct}% equivale a 1/${multiplier}. Multiplique ${part} por ${multiplier}.`;
        strategy = `Porcentagem reversa: ${pct}% = 1/${multiplier}. Logo, ${part} × ${multiplier} = ${expected}.`;
      } else {
        format = 'PCT_DISCOVER';
        // 30 de 120 corresponde a quantos %? (25%)
        const base = (Math.floor(Math.random() * 6) + 3) * 40; // 120, 160, 200...
        const fractions = [
          { num: base / 2, pct: 50, fracStr: '1/2' },
          { num: base / 4, pct: 25, fracStr: '1/4' },
          { num: base / 5, pct: 20, fracStr: '1/5' },
          { num: base / 10, pct: 10, fracStr: '1/10' }
        ];
        const chosen = fractions[Math.floor(Math.random() * fractions.length)];
        knowledgeId = `pct_disc_${chosen.num}_${base}`;
        prompt = `${chosen.num} de ${base} corresponde a quantos %?`;
        expected = chosen.pct;
        hint = `Qual a fração entre ${chosen.num} e ${base}? (${chosen.fracStr}).`;
        strategy = `Proporção: ${chosen.num} ÷ ${base} = ${chosen.fracStr} = ${expected}%.`;
      }
      timeLimit = 12;
    } else if (difficulty <= 85) {
      // Sec. 19/20: Aumento percentual / Desconto comercial (ex: R$ 250 com 20% de desconto)
      const isDiscount = Math.random() > 0.5;
      const base = (Math.floor(Math.random() * 8) + 4) * 50; // 200, 250, 300...
      const pct = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
      const diffVal = Math.round((pct / 100) * base);

      if (isDiscount) {
        format = 'PCT_DISCOUNT';
        knowledgeId = `pct_desc_${pct}_${base}`;
        prompt = `R$ ${base} com ${pct}% de desconto:`;
        expected = base - diffVal;
        hint = `Calcule ${pct}% de ${base} (${diffVal}) e subtraia do valor original.`;
        strategy = `Desconto: ${pct}% de ${base} = ${diffVal}. Preço final = ${base} - ${diffVal} = ${expected}.`;
      } else {
        format = 'PCT_MARKUP';
        knowledgeId = `pct_mark_${pct}_${base}`;
        prompt = `R$ ${base} com ${pct}% de aumento:`;
        expected = base + diffVal;
        hint = `Calcule ${pct}% de ${base} (${diffVal}) e adicione ao valor original.`;
        strategy = `Aumento: ${pct}% de ${base} = ${diffVal}. Preço final = ${base} + ${diffVal} = ${expected}.`;
      }
      timeLimit = 12;
    } else {
      // Sec. 21: Porcentagens sucessivas (R$ 100 + 20% e depois -20% = 96) OU Sec. 22: Comparação percentual
      if (Math.random() > 0.5) {
        format = 'PCT_SUCCESSIVE';
        const base = 100;
        const pct = [10, 20, 25][Math.floor(Math.random() * 3)];
        const step1 = base + (base * (pct / 100)); // 120
        const step2 = Math.round(step1 - (step1 * (pct / 100))); // 120 - 24 = 96
        knowledgeId = `pct_succ_${pct}_${base}`;
        prompt = `R$ 100 com +${pct}% e em seguida -${pct}%:`;
        expected = step2;
        hint = `A base muda após a primeira operação! Primeiro calcule 100 + ${pct}% = ${step1}.`;
        strategy = `Porcentagens sucessivas: 100 + ${pct}% = ${step1}. Agora ${pct}% de ${step1} é ${(step1 * (pct / 100))}. Resultado = ${step1} - ${(step1 * (pct / 100))} = ${expected}.`;
      } else {
        format = 'PCT_COMPARISON';
        // Produto A = R$ 80, Produto B = R$ 100. A é quantos % mais barato que B? (20%)
        const b = 100;
        const discountPct = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
        const a = b - discountPct;
        knowledgeId = `pct_comp_${a}_${b}`;
        prompt = `A = R$ ${a}, B = R$ 100. A é quantos % mais barato que B?`;
        expected = discountPct;
        hint = `A diferença é de ${b - a} reais sobre a base de B (100).`;
        strategy = `Base de comparação: diferença = ${b - a}. Em relação a 100, corresponde a ${expected}%.`;
      }
      timeLimit = 14;
    }

    this.trackRecent(prompt);

    return {
      id,
      category: 'CALCULATION',
      type: 'PERCENTAGE',
      difficulty,
      prompt,
      data: { equation: prompt, domain: 'PERCENTAGE', format },
      options: this.generateNumericOptions(expected),
      expectedAnswer: expected,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds: timeLimit,
      hasTimerBar: true,
      knowledgeId,
      mathDomain: 'PERCENTAGE',
      mathFormat: format
    };
  }

  // Registra o resultado da tentativa e atualiza o nível de domínio do conhecimento
  public async recordAttempt(
    knowledgeId: string, 
    domain: MathDomain, 
    isCorrect: boolean, 
    responseTimeMs: number
  ): Promise<void> {
    if (!knowledgeId) return;

    let item = this.knowledgeBank.get(knowledgeId);
    if (!item) {
      item = await this.storage.getMathMastery(knowledgeId);
    }

    if (!item) {
      // Conhecimento novo não catalogado
      item = {
        knowledgeId,
        domain,
        familyId: `fam_${knowledgeId}`,
        operandA: 0,
        operandB: 0,
        result: 0,
        difficulty: 50,
        attempts: 0,
        correctCount: 0,
        avgResponseTimeMs: 0,
        recentErrors: 0,
        masteryLevel: 'UNMASTERED',
        lastReviewedAt: 0
      };
    }

    item.attempts += 1;
    item.lastReviewedAt = Date.now();

    if (isCorrect) {
      item.correctCount += 1;
      item.recentErrors = 0;
    } else {
      item.recentErrors += 1;
    }

    // Média móvel do tempo de resposta
    if (item.attempts === 1) {
      item.avgResponseTimeMs = responseTimeMs;
    } else {
      item.avgResponseTimeMs = Math.round((item.avgResponseTimeMs * 0.7) + (responseTimeMs * 0.3));
    }

    // Avaliação de Domínio (Sec. 40: Precisão + Tempo + Consistência)
    const accuracy = Math.round((item.correctCount / item.attempts) * 100);
    const avgSec = item.avgResponseTimeMs / 1000;

    // Limites de tempo para automação:
    // Básico (Adição, Tabuada, Subtração simples): <= 1.8s
    // Divisão / Porcentagem: <= 2.8s
    const automatedTimeLimit = (domain === 'ADDITION' || domain === 'MULTIPLICATION' || domain === 'SUBTRACTION') ? 1.8 : 2.8;

    if (item.attempts >= 3 && accuracy >= 90 && avgSec <= automatedTimeLimit && item.recentErrors === 0) {
      item.masteryLevel = 'AUTOMATED'; // 🔵 Automatizado
    } else if (item.attempts >= 2 && accuracy >= 80 && avgSec <= (automatedTimeLimit * 1.8)) {
      item.masteryLevel = 'MASTERED';  // 🟢 Dominado
    } else if (item.attempts >= 2 && accuracy >= 65) {
      item.masteryLevel = 'KNOWN';     // 🟡 Conhecido
    } else if (item.attempts >= 1) {
      item.masteryLevel = 'LEARNING';  // 🟠 Em aprendizado
    } else {
      item.masteryLevel = 'UNMASTERED';// 🔴 Não dominado
    }

    this.knowledgeBank.set(knowledgeId, item);
    await this.storage.saveMathMastery(item);
  }

  // Seleciona um item do banco com foco em afunilamento (Prioriza não dominados e em aprendizado)
  private selectFactItem(domain: MathDomain, userDifficulty: number): MathKnowledgeItem {
    const domainItems = Array.from(this.knowledgeBank.values()).filter(it => it.domain === domain);
    if (domainItems.length === 0) {
      return {
        knowledgeId: `${domain.toLowerCase()}_7_8`,
        domain,
        familyId: `fam_${domain.toLowerCase()}_7_8`,
        operandA: 7,
        operandB: 8,
        result: 56,
        difficulty: 50,
        attempts: 0,
        correctCount: 0,
        avgResponseTimeMs: 0,
        recentErrors: 0,
        masteryLevel: 'UNMASTERED',
        lastReviewedAt: 0
      };
    }

    // Ponderação do Afunilamento (Sec. 6):
    // Fracos / Erros recentes: peso 5
    // Não dominados / Aprendendo: peso 4
    // Conhecidos: peso 2
    // Dominados: peso 1
    // Automatizados: peso 0.2 (afunilados para fora da sessão regular)
    const weightedPool: MathKnowledgeItem[] = [];

    domainItems.forEach(item => {
      // Filtra por proximidade de dificuldade se houver muitos
      let weight = 1;
      if (item.recentErrors > 0) weight = 5;
      else if (item.masteryLevel === 'UNMASTERED') weight = 4;
      else if (item.masteryLevel === 'LEARNING') weight = 3;
      else if (item.masteryLevel === 'KNOWN') weight = 2;
      else if (item.masteryLevel === 'MASTERED') weight = 1;
      else if (item.masteryLevel === 'AUTOMATED') weight = 0.2;

      const repeatCount = Math.max(1, Math.round(weight * 3));
      for (let i = 0; i < repeatCount; i++) {
        weightedPool.push(item);
      }
    });

    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
  }

  // Gera opções numéricas inteligentes e realistas
  public generateNumericOptions(correct: number): number[] {
    const options = new Set<number>([correct]);
    const offsets = [-10, 10, -1, 1, -2, 2, -5, 5, -20, 20];
    
    let attempts = 0;
    while (options.size < 4 && attempts < 30) {
      attempts++;
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = correct + offset;
      if (candidate !== correct) {
        options.add(candidate);
      }
    }

    while (options.size < 4) {
      options.add(correct + Math.floor(Math.random() * 12) + 3);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  private trackRecent(prompt: string): void {
    this.recentQuestionsQueue.push(prompt);
    if (this.recentQuestionsQueue.length > 8) {
      this.recentQuestionsQueue.shift();
    }
  }

  // Retorna sumários de domínio para relatórios e progresso
  public async getDomainSummaries(): Promise<DomainMasterySummary[]> {
    return await this.storage.getDomainMasterySummaries();
  }
}
