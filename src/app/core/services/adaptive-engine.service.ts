import { Injectable } from '@angular/core';
import { 
  CognitiveCategory, 
  ExerciseQuestion, 
  ExerciseType 
} from '../models/cognitive.models';

@Injectable({
  providedIn: 'root'
})
export class AdaptiveEngineService {

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

  // Gera uma questão procedural de acordo com o tipo e dificuldade
  public generateQuestion(type: ExerciseType, difficulty: number): ExerciseQuestion {
    switch (type) {
      case 'MENTAL_MATH':
        return this.generateMentalMath(difficulty);
      case 'WORD_PROBLEM':
        return this.generateWordProblem(difficulty);
      case 'NUMBER_SEQUENCE':
        return this.generateNumberSequence(difficulty);
      case 'GENIUS_COLORS':
        return this.generateGeniusColors(difficulty);
      case 'SPATIAL_GRID':
        return this.generateSpatialGrid(difficulty);
      case 'ATTENTION_TARGET':
        return this.generateAttentionTarget(difficulty);
      case 'STROOP_TEST':
        return this.generateStroopTest(difficulty);
      case 'NUMBER_ORDERING':
        return this.generateNumberOrdering(difficulty);
      case 'LOGICAL_PATTERN':
        return this.generateLogicalPattern(difficulty);
      default:
        return this.generateMentalMath(difficulty);
    }
  }

  // 1. CÁLCULO MENTAL PROCEDURAL
  // Regra: Conforme evolui -> Menos tempo de resposta, mais números (3 a 4 operandos) e operações encadeadas
  private generateMentalMath(difficulty: number): ExerciseQuestion {
    const id = 'math-' + Math.random().toString(36).substring(2, 9);
    let prompt = '';
    let expectedAnswer = 0;
    let strategy = '';
    let hint = '';

    // O tempo limite diminui com a evolução (de 18s no nível 1 até 6s no nível 100)
    const timeLimitSeconds = Math.max(6, Math.round(18 - (difficulty * 0.12)));

    if (difficulty <= 20) {
      // 2 operandos simples (Adição / Subtração básica)
      const op = Math.random() > 0.5 ? '+' : '-';
      if (op === '+') {
        const a = Math.floor(Math.random() * 20) + 4;
        const b = Math.floor(Math.random() * 20) + 4;
        prompt = `${a} + ${b}`;
        expectedAnswer = a + b;
        hint = `Some as unidades primeiro (${a % 10} + ${b % 10}).`;
        strategy = `Some as unidades primeiro ou arredonde para a dezena mais próxima.`;
      } else {
        const b = Math.floor(Math.random() * 15) + 3;
        const a = b + Math.floor(Math.random() * 20) + 2;
        prompt = `${a} - ${b}`;
        expectedAnswer = a - b;
        hint = `Tente subtrair as unidades primeiro.`;
        strategy = `Subtraia primeiro até a dezena inteira e depois subtraia o restante.`;
      }
    } else if (difficulty <= 40) {
      // 2 operandos com multiplicação ou divisão exata
      const mode = Math.random();
      if (mode < 0.6) {
        const a = Math.floor(Math.random() * 9) + 3;
        const b = Math.floor(Math.random() * 12) + 3;
        prompt = `${a} × ${b}`;
        expectedAnswer = a * b;
        hint = `Multiplique por 10 (${a * 10}) e ajuste o restante.`;
        strategy = `Multiplique ${a} por 10 e ajuste com o resto.`;
      } else {
        const divisor = Math.floor(Math.random() * 8) + 2;
        const quotient = Math.floor(Math.random() * 12) + 2;
        const dividend = divisor * quotient;
        prompt = `${dividend} ÷ ${divisor}`;
        expectedAnswer = quotient;
        hint = `Qual número multiplicado por ${divisor} dá ${dividend}?`;
        strategy = `Pense na tabuada de ${divisor}.`;
      }
    } else if (difficulty <= 60) {
      // 3 operandos encadeados OU porcentagem direta (Aumento da quantidade de números!)
      const roll = Math.random();
      if (roll < 0.5) {
        // 3 operandos: a + b - c ou a × b + c
        const a = Math.floor(Math.random() * 15) + 6;
        const b = Math.floor(Math.random() * 6) + 3;
        const c = Math.floor(Math.random() * 15) + 4;
        prompt = `${a} × ${b} + ${c}`;
        expectedAnswer = (a * b) + c;
        hint = `Calcule primeiro ${a} × ${b} e depois adicione ${c}.`;
        strategy = `Faça a multiplicação primeiro: ${a} × ${b} = ${a * b}, depois some ${c} = ${expectedAnswer}.`;
      } else {
        const base = (Math.floor(Math.random() * 8) + 2) * 50;
        const perc = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        prompt = `${perc}% de ${base}`;
        expectedAnswer = (perc / 100) * base;
        hint = `Calcule 10% dividindo ${base} por 10 (${base / 10}).`;
        strategy = `10% de ${base} é ${base * 0.1}. Multiplique proporcionalmente.`;
      }
    } else if (difficulty <= 80) {
      // 3 a 4 operandos OU porcentagens decompostas
      const roll = Math.random();
      if (roll < 0.5) {
        // 3 operandos compostos: a + b + c ou a × b - c
        const a = Math.floor(Math.random() * 25) + 12;
        const b = Math.floor(Math.random() * 25) + 12;
        const c = Math.floor(Math.random() * 20) + 8;
        prompt = `${a} + ${b} + ${c}`;
        expectedAnswer = a + b + c;
        hint = `Some ${a} + ${b} primeiro (${a + b}), depois adicione ${c}.`;
        strategy = `Agrupe dezenas inteiras: (${a} + ${b} = ${a + b}) + ${c} = ${expectedAnswer}.`;
      } else {
        const base = (Math.floor(Math.random() * 6) + 3) * 60;
        const perc = [15, 20, 35, 45][Math.floor(Math.random() * 4)];
        prompt = `${perc}% de ${base}`;
        expectedAnswer = Math.round((perc / 100) * base);
        hint = `Calcule 10% (${base * 0.1}) e 5% (${base * 0.05}).`;
        strategy = `Quebre ${perc}% em parcelas simples: 10% + 5% ou dezenas inteiras.`;
      }
    } else {
      // Dificuldade Máxima (81-100): 4 operandos OU Multiplicação pesada de 2 dígitos (37 × 24)
      const roll = Math.random();
      if (roll < 0.5) {
        // Multiplicação de 2 dígitos clássica da especificação
        const a = Math.floor(Math.random() * 25) + 22;
        const b = Math.floor(Math.random() * 15) + 14;
        prompt = `${a} × ${b}`;
        expectedAnswer = a * b;
        const tens = Math.floor(b / 10) * 10;
        const units = b % 10;
        hint = `Quebre em (${a} × ${tens}) + (${a} × ${units}).`;
        strategy = `Quebre em (${a} × ${tens} = ${a * tens}) + (${a} × ${units} = ${a * units}) = ${expectedAnswer}.`;
      } else {
        // Cadeia de 4 operandos: a × b + c - d
        const a = Math.floor(Math.random() * 12) + 5;
        const b = Math.floor(Math.random() * 6) + 4;
        const c = Math.floor(Math.random() * 20) + 10;
        const d = Math.floor(Math.random() * 15) + 5;
        prompt = `${a} × ${b} + ${c} - ${d}`;
        expectedAnswer = (a * b) + c - d;
        hint = `Calcule ${a} × ${b} (${a * b}), some ${c} e subtraia ${d}.`;
        strategy = `Multiplicação prioritária: ${a * b} + ${c} - ${d} = ${expectedAnswer}.`;
      }
    }

    const options = this.generateNumericOptions(expectedAnswer);

    return {
      id,
      category: 'CALCULATION',
      type: 'MENTAL_MATH',
      difficulty,
      prompt,
      data: { equation: prompt },
      options,
      expectedAnswer,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true
    };
  }

  // 2. PROBLEMAS CONTEXTUAIS (Distância, Velocidade, Tempo, Regra de Três, Estimativa)
  private generateWordProblem(difficulty: number): ExerciseQuestion {
    const id = 'wp-' + Math.random().toString(36).substring(2, 9);
    const subTypes = ['SPEED_DISTANCE_TIME', 'PROPORTION_RULE_OF_3', 'ESTIMATION'];
    const chosen = subTypes[Math.floor(Math.random() * subTypes.length)];

    let prompt = '';
    let expectedAnswer = 0;
    let strategy = '';
    let hint = '';
    let unit = '';

    // Tempo diminui com a evolução (de 22s até 8s)
    const timeLimitSeconds = Math.max(8, Math.round(22 - (difficulty * 0.14)));

    if (chosen === 'SPEED_DISTANCE_TIME') {
      const mode = Math.floor(Math.random() * 3);
      if (mode === 0) {
        // Velocidade: V = D ÷ T
        const speeds = difficulty > 50 ? [75, 80, 85, 90, 110] : [40, 50, 60, 70, 80];
        const times = difficulty > 60 ? [2, 3, 4, 5] : [2, 3];
        const speed = speeds[Math.floor(Math.random() * speeds.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        const dist = speed * time;

        prompt = `Um carro percorre ${dist} km em ${time} horas. Qual é a velocidade média?`;
        expectedAnswer = speed;
        unit = 'km/h';
        hint = `Velocidade = Distância ÷ Tempo (${dist} ÷ ${time}).`;
        strategy = `Divida a distância total (${dist} km) pelo tempo (${time} h) = ${speed} km/h.`;
      } else if (mode === 1) {
        // Distância: D = V × T
        const speeds = difficulty > 50 ? [75, 80, 90, 100] : [60, 70, 80];
        const speed = speeds[Math.floor(Math.random() * speeds.length)];
        const time = [2, 3, 4][Math.floor(Math.random() * 3)];
        const dist = speed * time;

        prompt = `Viajando a ${speed} km/h durante ${time} horas, qual a distância percorrida?`;
        expectedAnswer = dist;
        unit = 'km';
        hint = `Distância = Velocidade × Tempo (${speed} × ${time}).`;
        strategy = `Multiplique a velocidade (${speed} km/h) pelo tempo (${time} h) = ${dist} km.`;
      } else {
        // Tempo: T = D ÷ V
        const speed = [50, 60, 80, 100][Math.floor(Math.random() * 4)];
        const time = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const dist = speed * time;

        prompt = `A uma velocidade de ${speed} km/h, quantas horas leva para percorrer ${dist} km?`;
        expectedAnswer = time;
        unit = 'horas';
        hint = `Tempo = Distância ÷ Velocidade (${dist} ÷ ${speed}).`;
        strategy = `Divida os quilômetros (${dist} km) pela velocidade (${speed} km/h) = ${time} horas.`;
      }
    } else if (chosen === 'PROPORTION_RULE_OF_3') {
      const unitPrice = Math.floor(Math.random() * 6) + 3;
      const q1 = Math.floor(Math.random() * 3) + 2;
      const cost1 = unitPrice * q1;
      const q2 = q1 + Math.floor(Math.random() * 4) + 2;
      const cost2 = unitPrice * q2;

      const items = ['maçãs', 'cadernos', 'garrafas', 'pacotes de café'];
      const item = items[Math.floor(Math.random() * items.length)];

      prompt = `Se ${q1} ${item} custam R$ ${cost1}, quanto custarão ${q2} ${item}?`;
      expectedAnswer = cost2;
      unit = 'R$';
      hint = `Descubra primeiro o valor de 1 unidade (${cost1} ÷ ${q1} = R$ ${unitPrice}).`;
      strategy = `Cada item custa R$ ${unitPrice}. Multiplique por ${q2} = R$ ${cost2}.`;
    } else {
      const a = [19, 21, 29, 31, 49, 51][Math.floor(Math.random() * 6)];
      const b = [39, 41, 49, 51, 99][Math.floor(Math.random() * 5)];
      const approxA = Math.round(a / 10) * 10;
      const approxB = Math.round(b / 10) * 10;
      expectedAnswer = approxA * approxB;

      prompt = `Qual valor é APROXIMADAMENTE igual a ${a} × ${b}?`;
      hint = `Arredonde ${a} para ${approxA} e ${b} para ${approxB}.`;
      strategy = `Arredonde para dezenas inteiras: ${approxA} × ${approxB} = ${expectedAnswer}.`;
    }

    const options = this.generateNumericOptions(expectedAnswer);

    return {
      id,
      category: 'CALCULATION',
      type: 'WORD_PROBLEM',
      difficulty,
      prompt,
      data: { text: prompt, unit },
      options,
      expectedAnswer,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true
    };
  }

  // 3. SEQUÊNCIA NUMÉRICA
  // Regra: Conforme evolui -> Mais dígitos para memorizar (até 10) e tempo de exposição muito mais rápido
  private generateNumberSequence(difficulty: number): ExerciseQuestion {
    const id = 'seq-' + Math.random().toString(36).substring(2, 9);
    
    // Quantidade de dígitos aumenta progressivamente (de 4 até 10 dígitos)
    const length = Math.min(10, Math.max(4, Math.floor(difficulty / 15) + 3));
    const isReverse = difficulty > 35 && Math.random() > 0.35;
    
    const digits: number[] = [];
    for (let i = 0; i < length; i++) {
      digits.push(Math.floor(Math.random() * 9) + 1);
    }

    const expected = isReverse ? [...digits].reverse().join('') : digits.join('');
    const prompt = isReverse ? 'Memorize e digite ao CONTRÁRIO:' : 'Memorize e repita na ORDEM:';

    // O tempo de exposição por dígito encurta conforme evolui (de 850ms até 350ms por dígito)
    const msPerDigit = Math.max(350, Math.round(850 - (difficulty * 5)));
    const displayTimeMs = (msPerDigit * length) + 400;

    // Tempo para digitação diminui com evolução (de 24s até 10s)
    const timeLimitSeconds = Math.max(10, Math.round(24 - (difficulty * 0.14)));

    return {
      id,
      category: 'MEMORY',
      type: 'NUMBER_SEQUENCE',
      difficulty,
      prompt,
      data: {
        sequence: digits,
        isReverse,
        displayTimeMs
      },
      expectedAnswer: expected,
      hintStrategy: isReverse 
        ? 'Guarde o último número primeiro, ele será o primeiro a ser digitado!' 
        : 'Agrupe os dígitos de 2 em 2 ou crie um ritmo sonoro.',
      explanationStrategy: isReverse 
        ? 'Dica: agrupe os números de 2 em 2 visualmente para inverter mais facilmente.' 
        : 'Dica: crie um ritmo sonoro mental ao ler os números.',
      timeLimitSeconds,
      hasTimerBar: false
    };
  }

  // 4. MEMÓRIA ESPACIAL (GRADE)
  // Regra: Conforme evolui -> Mais blocos iluminados (até 9), grade maior (4x4) e menor tempo de exposição
  private generateSpatialGrid(difficulty: number): ExerciseQuestion {
    const id = 'spatial-' + Math.random().toString(36).substring(2, 9);
    const gridSize = difficulty > 40 ? 4 : 3;
    const totalCells = gridSize * gridSize;
    
    // Mais alvos para memorizar: de 3 até 9 alvos
    const targetsCount = Math.min(
      gridSize === 4 ? 9 : 5, 
      Math.max(3, Math.floor(difficulty / 14) + 2)
    );

    const targets: number[] = [];
    while (targets.length < targetsCount) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!targets.includes(idx)) {
        targets.push(idx);
      }
    }

    // Tempo de flash diminui bruscamente com a dificuldade (de 2800ms até 850ms)
    const flashTimeMs = Math.max(850, Math.round(2800 - (difficulty * 19.5)));

    return {
      id,
      category: 'SPATIAL',
      type: 'SPATIAL_GRID',
      difficulty,
      prompt: `Memorize as ${targetsCount} posições marcadas na grade:`,
      data: {
        gridSize,
        targets,
        flashTimeMs
      },
      expectedAnswer: targets.sort((a, b) => a - b),
      hintStrategy: 'Agrupe os blocos visualmente por linhas ou cantos.',
      explanationStrategy: 'Dica: visualize uma forma geométrica conectando os pontos no espaço.',
      timeLimitSeconds: Math.max(7, Math.round(16 - (difficulty * 0.09))),
      hasTimerBar: false
    };
  }

  // 5. GENIUS / CORES SEQUENCIAIS
  // Regra: Mais cores na sequência (até 10 passos) e velocidade de disparo mais rápida
  private generateGeniusColors(difficulty: number): ExerciseQuestion {
    const id = 'genius-' + Math.random().toString(36).substring(2, 9);
    const colors = ['CYAN', 'VIOLET', 'EMERALD', 'AMBER'];
    
    // De 3 até 10 passos na sequência
    const steps = Math.min(10, Math.max(3, Math.floor(difficulty / 13) + 3));

    const sequence: string[] = [];
    for (let i = 0; i < steps; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    // Velocidade de exibição acelera (de 650ms até 240ms por cor)
    const speedMs = Math.max(240, Math.round(650 - (difficulty * 4.1)));

    return {
      id,
      category: 'MEMORY',
      type: 'GENIUS_COLORS',
      difficulty,
      prompt: `Observe a sequência (${steps} passos) e repita:`,
      data: {
        colors,
        sequence,
        speedMs
      },
      expectedAnswer: sequence,
      hintStrategy: 'Associe cada cor a uma direção espacial ou som harmônico.',
      explanationStrategy: 'Dica: use memória rítmica para acompanhar sequências longas.',
      timeLimitSeconds: 25,
      hasTimerBar: false
    };
  }

  // 6. ORDENAÇÃO NUMÉRICA
  // Regra: Mais números para ordenar (até 8) e tempo mais restrito
  private generateNumberOrdering(difficulty: number): ExerciseQuestion {
    const id = 'ord-' + Math.random().toString(36).substring(2, 9);
    
    // Quantidade de números aumenta de 4 até 8
    const count = Math.min(8, Math.max(4, Math.floor(difficulty / 20) + 3));
    
    const numbers: number[] = [];
    const maxVal = difficulty > 60 ? 150 : (difficulty > 30 ? 90 : 40);

    while (numbers.length < count) {
      const num = Math.floor(Math.random() * maxVal) + 3;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const timeLimitSeconds = Math.max(6, Math.round(18 - (difficulty * 0.12)));

    return {
      id,
      category: 'ORDERING',
      type: 'NUMBER_ORDERING',
      difficulty,
      prompt: `Toque nos ${count} números em ordem CRESCENTE:`,
      data: {
        numbers: [...numbers]
      },
      expectedAnswer: sorted,
      hintStrategy: 'Localize rapidamente o menor de todos primeiro.',
      explanationStrategy: 'Dica: faça uma varredura visual rápida procurando primeiro o menor e o maior.',
      timeLimitSeconds,
      hasTimerBar: true
    };
  }

  // 7. TESTE DE STROOP (Inibição)
  private generateStroopTest(difficulty: number): ExerciseQuestion {
    const id = 'stroop-' + Math.random().toString(36).substring(2, 9);
    const colors = [
      { name: 'AZUL', color: '#06b6d4', id: 'blue' },
      { name: 'ROXO', color: '#8b5cf6', id: 'violet' },
      { name: 'VERDE', color: '#10b981', id: 'green' },
      { name: 'LARANJA', color: '#f97316', id: 'orange' }
    ];

    const wordItem = colors[Math.floor(Math.random() * colors.length)];
    const otherColors = colors.filter(c => c.name !== wordItem.name);
    const inkItem = otherColors[Math.floor(Math.random() * otherColors.length)];

    const askForInk = Math.random() > 0.4;
    const prompt = askForInk 
      ? `Toque na COR DA TINTA (ignore o que está escrito):` 
      : `Toque na PALAVRA ESCRITA (ignore a cor da tinta):`;

    const expectedAnswer = askForInk ? inkItem.id : wordItem.id;
    const hint = askForInk ? `Foque apenas na cor visual da letra.` : `Leia a palavra e ignore a cor.`;

    // Tempo de reação encurta de 8s até 3s!
    const timeLimitSeconds = Math.max(3, Math.round(8 - (difficulty * 0.05)));

    return {
      id,
      category: 'ATTENTION',
      type: 'STROOP_TEST',
      difficulty,
      prompt,
      data: {
        wordText: wordItem.name,
        inkColor: inkItem.color,
        askForInk
      },
      options: colors,
      expectedAnswer,
      explanationStrategy: `No teste Stroop, seu cérebro lê a palavra mais rápido do que processa a cor. Treine desacelerar o impulso inicial.`,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true
    };
  }

  // 8. PADRÕES LÓGICOS
  private generateLogicalPattern(difficulty: number): ExerciseQuestion {
    const id = 'pat-' + Math.random().toString(36).substring(2, 9);
    const patterns = ['GEOMETRIC', 'INCREMENTAL', 'FIBONACCI', 'DECREASING'];
    const patternType = patterns[Math.floor(Math.random() * patterns.length)];

    let sequence: number[] = [];
    let nextNum = 0;
    let hint = '';
    let strategy = '';

    if (patternType === 'GEOMETRIC') {
      const mult = Math.random() > 0.5 ? 2 : 3;
      const start = Math.floor(Math.random() * 3) + 2;
      sequence = [start, start * mult, start * mult * mult, start * mult * mult * mult];
      nextNum = sequence[3] * mult;
      hint = `Cada número é multiplicado por ${mult}.`;
      strategy = `Multiplicação contínua por ${mult}: ${sequence[3]} × ${mult} = ${nextNum}.`;
    } else if (patternType === 'INCREMENTAL') {
      const start = Math.floor(Math.random() * 6) + 2;
      const step = Math.floor(Math.random() * 3) + 2;
      sequence = [start, start + step, start + (step * 2), start + (step * 3)];
      nextNum = start + (step * 4);
      hint = `A diferença entre números é constante (+${step}).`;
      strategy = `Progressão constante somando +${step} a cada passo.`;
    } else if (patternType === 'FIBONACCI') {
      sequence = [1, 2, 3, 5, 8];
      nextNum = 13;
      hint = `Cada número é a soma dos dois anteriores.`;
      strategy = `Sequência onde cada termo é a soma dos dois anteriores: 5 + 8 = 13.`;
    } else {
      const step = Math.floor(Math.random() * 4) + 3;
      const start = (step * 5) + Math.floor(Math.random() * 10);
      sequence = [start, start - step, start - (step * 2), start - (step * 3)];
      nextNum = sequence[3] - step;
      hint = `A sequência diminui de ${step} em ${step}.`;
      strategy = `Subtração regular de -${step}: ${sequence[3]} - ${step} = ${nextNum}.`;
    }

    const options = this.generateNumericOptions(nextNum);
    const timeLimitSeconds = Math.max(6, Math.round(16 - (difficulty * 0.1)));

    return {
      id,
      category: 'LOGIC',
      type: 'LOGICAL_PATTERN',
      difficulty,
      prompt: 'Descubra o próximo número da sequência:',
      data: {
        sequenceText: sequence.join(' → ') + ' → ?'
      },
      options,
      expectedAnswer: nextNum,
      explanationStrategy: strategy,
      hintStrategy: hint,
      timeLimitSeconds,
      hasTimerBar: true
    };
  }

  // 9. ATENÇÃO & REAÇÃO
  private generateAttentionTarget(difficulty: number): ExerciseQuestion {
    const id = 'att-' + Math.random().toString(36).substring(2, 9);
    const colorNames = [
      { name: 'AZUL', color: '#06b6d4', id: 'blue' },
      { name: 'ROXO', color: '#8b5cf6', id: 'violet' },
      { name: 'VERDE', color: '#10b981', id: 'green' },
      { name: 'LARANJA', color: '#f97316', id: 'orange' }
    ];

    const isMatchColor = Math.random() > 0.4;
    const target = colorNames[Math.floor(Math.random() * colorNames.length)];
    const shuffled = [...colorNames].sort(() => Math.random() - 0.5);

    let prompt = '';
    let expected = '';

    if (isMatchColor) {
      prompt = `Toque no botão com a cor: ${target.name}`;
      expected = target.id;
    } else {
      prompt = `Toque no botão que NÃO é: ${target.name}`;
      const wrongIds = shuffled.filter(c => c.id !== target.id);
      expected = wrongIds[0].id;
    }

    const timeLimitSeconds = Math.max(2.5, Math.round(7 - (difficulty * 0.045)));

    return {
      id,
      category: 'ATTENTION',
      type: 'ATTENTION_TARGET',
      difficulty,
      prompt,
      data: {
        isMatchColor,
        target,
        items: shuffled
      },
      options: shuffled,
      expectedAnswer: expected,
      hintStrategy: 'Respire e toque apenas quando tiver certeza.',
      explanationStrategy: 'Dica: respire fundo e ignore o impulso automático do primeiro toque.',
      timeLimitSeconds,
      hasTimerBar: true
    };
  }

  // Gera opções numéricas realistas para questões de múltipla escolha
  private generateNumericOptions(correct: number): number[] {
    const options = new Set<number>([correct]);
    const offsets = [-10, 10, -2, 2, -1, 1, -5, 5, -20, 20];
    
    let attempts = 0;
    while (options.size < 4 && attempts < 25) {
      attempts++;
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = correct + offset;
      if (candidate > 0 && candidate !== correct) {
        options.add(candidate);
      }
    }

    while (options.size < 4) {
      options.add(correct + Math.floor(Math.random() * 15) + 3);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }
}
