import { FocusUnitId } from '../../core/models/cognitive.models';

export interface GuideExampleStep {
  seeLabel: string;
  seeTokens: string[];
  arrowText: string;
  actionLabel: string;
  actionTokens: string[];
  reasoning: string;
}

export interface SpeedHackItem {
  title: string;
  description: string;
}

export interface GuideTopic {
  id: FocusUnitId;
  title: string;
  icon: string;
  category: 'CALCULATION' | 'MEMORY' | 'ATTENTION' | 'LOGIC';
  categoryLabel: string;
  badgeLabel: string;
  badgeClass: 'badge-direct' | 'badge-reverse' | 'badge-calc' | 'badge-mem' | 'badge-att' | 'badge-logic';
  levelRange: string;
  ruleText: string;
  ruleHighlight: string;
  example: GuideExampleStep;
  secondaryExample?: GuideExampleStep;
  foxTip: string;
  speedHacks: SpeedHackItem[];
  defaultQuestionsText: string;
}

export const GUIDE_TOPICS: GuideTopic[] = [
  // =========================================================================
  // PILAR 1: CÁLCULO MENTAL & PORCENTAGEM (6 UNIDADES)
  // =========================================================================
  {
    id: 'math-addition',
    title: 'Adição Mental Rápida',
    icon: '➕',
    category: 'CALCULATION',
    categoryLabel: 'Cálculo & Porcentagem',
    badgeLabel: '➔ Decomposição Decimal',
    badgeClass: 'badge-calc',
    levelRange: 'Nível 1 (45 Fatos) ao Nível 5',
    ruleText: 'Calcule a soma mentalmente combinando dezenas e unidades sem armar conta tradicional.',
    ruleHighlight: 'some da esquerda para a direita (dezenas primeiro, unidades depois).',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['47', '+', '38'],
      arrowText: '➔ Decompor Dezenas',
      actionLabel: 'Você digita:',
      actionTokens: ['85'],
      reasoning: 'Raciocínio: 47 + 30 = 77; 77 + 8 = 85 (ou arredonde: 47 + 40 - 2 = 85).'
    },
    secondaryExample: {
      seeLabel: 'Nível 1 Básico:',
      seeTokens: ['7', '+', '8'],
      arrowText: '➔ Complemento de 10',
      actionLabel: 'Você digita:',
      actionTokens: ['15'],
      reasoning: '7 precisa de 3 para virar 10. Tira 3 do 8 (sobra 5) ➔ 10 + 5 = 15.'
    },
    foxTip: 'Técnica do Arredondamento com Troco: Quando somar números terminados em 7, 8 ou 9, arredonde para a próxima dezena redonda e devolva a diferença! Exemplo: 56 + 39 vira 56 + 40 = 96, menos 1 = 95. Cálculo em milissegundos!',
    speedHacks: [
      {
        title: 'Abandone a soma da direita para a esquerda',
        description: 'No papel você aprendeu a somar as unidades primeiro e "levar um". Na mente isso sobrecarrega a memória de trabalho. Some dezenas primeiro, depois as unidades.'
      },
      {
        title: 'Memorize os Pares de 10',
        description: 'Os complementos que somam 10 (1+9, 2+8, 3+7, 4+6, 5+5) devem ser automáticos e reflexivos, sem contagem intermediária.'
      }
    ],
    defaultQuestionsText: '45Q (Nível 1) • 20Q (N2 a N5)'
  },
  {
    id: 'math-subtraction',
    title: 'Subtração & Polaridade',
    icon: '➖',
    category: 'CALCULATION',
    categoryLabel: 'Cálculo & Porcentagem',
    badgeLabel: '➔ Distância na Reta Numérica',
    badgeClass: 'badge-calc',
    levelRange: 'Nível 1 (81 Fatos Polarizados) ao Nível 5',
    ruleText: 'Subtraia números inteiros de 1 a 3 dígitos e domine resultados positivos e negativos.',
    ruleHighlight: 'quando o menor subtrai o maior, o sinal fica sempre negativo.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['3', '−', '8'],
      arrowText: '➔ Distância Invertida',
      actionLabel: 'Você digita:',
      actionTokens: ['−5'],
      reasoning: 'Raciocínio: A distância entre 3 e 8 é 5. Como 3 é menor que 8, o saldo é −5.'
    },
    secondaryExample: {
      seeLabel: 'Níveis Avançados:',
      seeTokens: ['83', '−', '27'],
      arrowText: '➔ Troco de Balcão',
      actionLabel: 'Você digita:',
      actionTokens: ['56'],
      reasoning: 'De 27 até 30 (+3); de 30 até 83 (+53) ➔ 53 + 3 = 56.'
    },
    foxTip: 'Método do Troco de Balcão: Nunca "peça emprestado" na mente! Em vez de 83 - 27, pergunte: quanto falta de 27 para chegar a 83? Subir a reta numérica em blocos é 3x mais rápido porque o cérebro humano soma muito melhor do que subtrai.',
    speedHacks: [
      {
        title: 'Inversão Polarizada Imediata',
        description: 'Ao ver 4 − 9, inverta mentalmente para 9 − 4 = 5 e coloque o sinal de menos na frente: −5. Treine essa inversão sem hesitar.'
      },
      {
        title: 'Compensação por Excesso',
        description: 'Para subtrair 19, subtraia 20 e some 1. Para subtrair 38, subtraia 40 e some 2. Reduz o esforço cognitivo em 70%.'
      }
    ],
    defaultQuestionsText: '81Q (Nível 1) • 20Q (N2 a N5)'
  },
  {
    id: 'math-multiplication',
    title: 'Multiplicação & Tabuada Rápida',
    icon: '✖️',
    category: 'CALCULATION',
    categoryLabel: 'Cálculo & Porcentagem',
    badgeLabel: '➔ Propriedade Distributiva',
    badgeClass: 'badge-calc',
    levelRange: 'Nível 1 (45 Fatos Únicos) ao Nível 5',
    ruleText: 'Fixe a tabuada básica completa e domine multiplicações com múltiplos de 10 e dois dígitos.',
    ruleHighlight: 'decomponha números em (10 + n) e use a comutatividade (a × b = b × a).',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['14', '×', '6'],
      arrowText: '➔ Decompor (10 + 4) × 6',
      actionLabel: 'Você digita:',
      actionTokens: ['84'],
      reasoning: 'Raciocínio: (10 × 6) + (4 × 6) = 60 + 24 = 84.'
    },
    secondaryExample: {
      seeLabel: 'Tabuada Nível 1:',
      seeTokens: ['7', '×', '8'],
      arrowText: '➔ Quadrado Próximo',
      actionLabel: 'Você digita:',
      actionTokens: ['56'],
      reasoning: 'Se 7 × 7 = 49, então 7 × 8 é só somar 7: 49 + 7 = 56.'
    },
    foxTip: 'O Truque do Dobro da Metade: Ao multiplicar por números pares, divida um lado por 2 e dobre o outro! Exemplo: 16 × 5 ➔ metade de 16 é 8, dobro de 5 é 10 ➔ 8 × 10 = 80! Faça isso para qualquer multiplicação.',
    speedHacks: [
      {
        title: 'Multiplicação por 9 e 11',
        description: 'Multiplicar por 9 é multiplicar por 10 e subtrair o número (14 × 9 = 140 − 14 = 126). Multiplicar por 5 é multiplicar por 10 e pegar a metade.'
      },
      {
        title: 'Quadrados Perfeitos como Âncoras',
        description: 'Fixe 6²=36, 7²=49, 8²=64, 9²=81. Quando aparecer 8 × 7, basta fazer 64 − 8 = 56.'
      }
    ],
    defaultQuestionsText: '45Q (Nível 1) • 20Q (N2 a N5)'
  },
  {
    id: 'math-division',
    title: 'Divisão Exata & Frações',
    icon: '➗',
    category: 'CALCULATION',
    categoryLabel: 'Cálculo & Porcentagem',
    badgeLabel: '➔ Fatoração & Metades Sucessivas',
    badgeClass: 'badge-calc',
    levelRange: 'Nível 1 (81 Fatos Exatos) ao Nível 5',
    ruleText: 'Encontre o quociente exato da tabuada e fatore divisões complexas em etapas simples.',
    ruleHighlight: 'enxergue a divisão como a multiplicação de trás para a frente.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['72', '÷', '8'],
      arrowText: '➔ 8 × ? = 72',
      actionLabel: 'Você digita:',
      actionTokens: ['9'],
      reasoning: 'Raciocínio: Qual número multiplicado por 8 dá 72? É 9, pois 8 × 9 = 72.'
    },
    secondaryExample: {
      seeLabel: 'Divisão por 4:',
      seeTokens: ['140', '÷', '4'],
      arrowText: '➔ Metade da Metade',
      actionLabel: 'Você digita:',
      actionTokens: ['35'],
      reasoning: 'Metade de 140 é 70; metade de 70 é 35.'
    },
    foxTip: 'Divisão por 5 Instantânea: Para dividir qualquer número por 5, dobre o número e divida por 10 (corte o último zero ou passe uma vírgula). Exemplo: 230 ÷ 5 ➔ 230 × 2 = 460 ➔ 46! Sem conta armada.',
    speedHacks: [
      {
        title: 'Metades Sucessivas para 4 e 8',
        description: 'Dividir por 4 é fazer duas metades seguidas. Dividir por 8 é fazer três metades seguidas (88 ➔ 44 ➔ 22 ➔ 11).'
      },
      {
        title: 'Cancelamento Prévio',
        description: 'Em frações e divisões compostas, simplifique os fatores pares antes de tentar dividir mentalmente.'
      }
    ],
    defaultQuestionsText: '81Q (Nível 1) • 20Q (N2 a N5)'
  },
  {
    id: 'pct-basic',
    title: 'Porcentagem Básica & Âncoras',
    icon: '📊',
    category: 'CALCULATION',
    categoryLabel: 'Cálculo & Porcentagem',
    badgeLabel: '➔ Âncoras Universais (10%, 25%, 50%)',
    badgeClass: 'badge-calc',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Calcule porcentagens essenciais sem fórmulas complexas usando frações canônicas de cabeça.',
    ruleHighlight: '10% move a vírgula 1 casa; 1% move 2 casas; 50% é metade; 25% é quarta parte.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['25%', 'de', '84'],
      arrowText: '➔ Metade da Metade (÷4)',
      actionLabel: 'Você digita:',
      actionTokens: ['21'],
      reasoning: 'Raciocínio: 25% = 1/4. Metade de 84 é 42; metade de 42 é 21.'
    },
    secondaryExample: {
      seeLabel: 'Propriedade Secreta:',
      seeTokens: ['16%', 'de', '50'],
      arrowText: '➔ Inverter (50% de 16)',
      actionLabel: 'Você digita:',
      actionTokens: ['8'],
      reasoning: 'x% de y é exatamente igual a y% de x! 50% de 16 é simplesmente 8.'
    },
    foxTip: 'A Regra da Comutatividade (x% de y = y% de x): Se calcularem 18% de 50, sua cabeça vai travar. Mas 50% de 18 é apenas a metade de 18: 9! Sempre que o número for 50, 25 ou 20, inverta a ordem na hora!',
    speedHacks: [
      {
        title: 'Os 5 Blocos Fundamentais',
        description: '50% = dividir por 2 | 25% = dividir por 4 | 20% = dividir por 5 | 10% = cortar zero | 5% = metade de 10%.'
      },
      {
        title: 'Decomposição em Soma',
        description: 'Quer 15% de 80? 10% é 8, 5% é 4. 8 + 4 = 12. Qualquer porcentagem pode ser feita somando blocos de 10% e 5%.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'pct-applied',
    title: 'Porcentagem Aplicada & Variação',
    icon: '🏷️',
    category: 'CALCULATION',
    categoryLabel: 'Cálculo & Porcentagem',
    badgeLabel: '➔ Fatores de Desconto e Acréscimo',
    badgeClass: 'badge-calc',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Aplique descontos comerciais, aumentos percentuais e deduza valores finais de cabeça.',
    ruleHighlight: 'desconto de 15% significa que sobra 85%; aumento de 20% multiplica por 1,2.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['R$ 120', 'com', '−15%'],
      arrowText: '➔ 10% + 5% de Desconto',
      actionLabel: 'Você digita:',
      actionTokens: ['102'],
      reasoning: 'Raciocínio: 10% de 120 = 12; 5% = 6. Desconto total = 18. Valor final = 120 − 18 = 102.'
    },
    secondaryExample: {
      seeLabel: 'Acréscimo Rápido:',
      seeTokens: ['R$ 80', 'com', '+25%'],
      arrowText: '➔ Soma 1/4 do Valor',
      actionLabel: 'Você digita:',
      actionTokens: ['100'],
      reasoning: '25% de 80 é 20. 80 + 20 = 100.'
    },
    foxTip: 'Fator Multiplicativo Unificado: Em vez de calcular o desconto e depois subtrair, pense no que sobra! Um desconto de 20% em 90 significa 80% de 90. 8 × 9 = 72! Você resolve a questão inteira em uma única operação.',
    speedHacks: [
      {
        title: 'Descontos Sucessivos Nunca se Somam',
        description: '20% de desconto seguido de 10% NÃO é 30%. O segundo desconto incide sobre a base já diminuída (100 ➔ 80 ➔ 72, total de 28%).'
      },
      {
        title: 'Cálculo Reverso Prático',
        description: 'Se um item de 80 reais já está com 20% de desconto, 80 representa 80% do total. Logo, o preço original era 100.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },

  // =========================================================================
  // PILAR 2: MEMÓRIA DE TRABALHO & ESPACIAL (4 UNIDADES)
  // =========================================================================
  {
    id: 'seq-forward',
    title: 'Sequência Numérica Direta',
    icon: '➡️',
    category: 'MEMORY',
    categoryLabel: 'Memória de Trabalho',
    badgeLabel: '➔ Ordem Direta',
    badgeClass: 'badge-direct',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Memorize a sequência exibida e digite exatamente na mesma ordem em que os números apareceram.',
    ruleHighlight: 'digite do primeiro ao último número sem alterar posições.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['3', '7', '5', '2'],
      arrowText: '➔ Mesma Ordem',
      actionLabel: 'Você digita:',
      actionTokens: ['3', '7', '5', '2'],
      reasoning: 'Raciocínio: Repita os dígitos criando um ritmo sonoro na mente (ex: "trinta e sete, cinquenta e dois").'
    },
    foxTip: 'Chunking (Agrupamento Rítmico): A memória de trabalho humana só retém cerca de 4 a 7 itens isolados. Ao ver 3-8-1-9-4, agrupe em blocos: "381" e "94". O cérebro armazena cada bloco como 1 única unidade de memória!',
    speedHacks: [
      {
        title: 'Loop Fonológico Rítmico',
        description: 'Fale os números na sua mente com uma melodia interna ou ritmo fixo. O eco fonológico permanece ativo por até 4 segundos sem se degradar.'
      },
      {
        title: 'Prontidão Motora',
        description: 'Deixe os dedos posicionados sobre o teclado numérico na tela antes da contagem terminar para digitar no reflexo.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'seq-reverse',
    title: 'Sequência Numérica Inversa',
    icon: '🔄',
    category: 'MEMORY',
    categoryLabel: 'Memória de Trabalho',
    badgeLabel: '➔ Inversão Mental',
    badgeClass: 'badge-reverse',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Memorize a sequência e digite de trás para a frente (do último para o primeiro número).',
    ruleHighlight: 'o último dígito exibido será o primeiro a ser digitado no teclado.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['4', '8', '2'],
      arrowText: '➔ Inverter',
      actionLabel: 'Você digita:',
      actionTokens: ['2', '8', '4'],
      reasoning: 'Raciocínio: O 2 é o último número visto, logo é a primeira tecla a ser clicada!'
    },
    foxTip: 'Ancoragem no Último Número: Fixe o último número que você viu com máxima intensidade! Assim que o teclado liberar, digite ele imediatamente. Isso "descarrega" a pressão mental e permite puxar os outros de trás para frente.',
    speedHacks: [
      {
        title: 'A Lousa Mental Invertida',
        description: 'Imagine os números projetados numa lousa mental da esquerda para a direita. Ao digitar, faça seus olhos mentais varrerem da direita para a esquerda.'
      },
      {
        title: 'Não Inverta Antes da Hora',
        description: 'Guarde os números na ordem normal enquanto eles estão sendo exibidos. Tentar inverter enquanto lê sobrecarrega a atenção prematuramente.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'spatial-grid',
    title: 'Memória Espacial em Grade',
    icon: '🗺️',
    category: 'MEMORY',
    categoryLabel: 'Memória de Trabalho',
    badgeLabel: '➔ Padrão de Constelação',
    badgeClass: 'badge-mem',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Memorize as células que se iluminam na matriz e selecione exatamente as mesmas posições.',
    ruleHighlight: 'não decore coordenadas: forme desenhos geométricos conectando os pontos.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['✦ Canto Sup.', '✦ Centro', '✦ Canto Inf.'],
      arrowText: '➔ Constelação em Diagonal',
      actionLabel: 'Você clica:',
      actionTokens: ['Célula 1', 'Célula 5', 'Célula 9'],
      reasoning: 'Raciocínio: Conecte mentalmente as células formando uma linha diagonal contínua.'
    },
    foxTip: 'O Efeito Constelação: O córtex visual reconhece formas (triângulos, letras "L", diagonais) 10x mais rápido do que dados abstratos ("linha 2, coluna 3"). Conecte os pontos acesos formando uma figura única!',
    speedHacks: [
      {
        title: 'Divisão em 4 Quadrantes',
        description: 'Divida a grade mentalmente em 4 blocos (sup-esq, sup-dir, inf-esq, inf-dir). Guarde quantos pontos há em cada quadrante.'
      },
      {
        title: 'Ancoragem nos Cantos',
        description: 'Identifique se algum ponto toca a moldura externa ou o centro da matriz. Cantos e centros servem de âncoras geométricas.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'genius-colors',
    title: 'Genius / Cores Sequenciais',
    icon: '🎨',
    category: 'MEMORY',
    categoryLabel: 'Memória de Trabalho',
    badgeLabel: '➔ Codificação Sonora Rápida',
    badgeClass: 'badge-mem',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Observe a ordem das cores piscadas e repita a sequência na mesma ordem correta.',
    ruleHighlight: 'atribua sílabas curtas de 1 som para cada cor e repita como uma palavra inventada.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['Azul', 'Verde', 'Roxo', 'Amarelo'],
      arrowText: '➔ Palavra Inventada',
      actionLabel: 'Você clica:',
      actionTokens: ['Azul', 'Verde', 'Roxo', 'Amarelo'],
      reasoning: 'Raciocínio: "Az-Ver-Rox-Am" ➔ 4 sílabas rápidas que cabem em 1 segundo no cérebro.'
    },
    foxTip: 'Codificação Monossilábica: Nomes como "A-ma-re-lo" (4 sílabas) cansam o loop fonológico. Fale mentalmente apenas o primeiro som: Az, Ver, Rox, Am. A sequência vira uma palavra única ("Az-Ver-Rox-Am") impossível de esquecer!',
    speedHacks: [
      {
        title: 'Memória Muscular Espacial',
        description: 'Combine o som com a posição física dos blocos (cima, baixo, esquerda, direita). A memória motora auxilia a visual.'
      },
      {
        title: 'Aproveite a Revisão de Emergência',
        description: 'O FoxMind permite 1 revisão gratuita se você tiver dúvida. Use apenas se a sequência for maior que 4 itens.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },

  // =========================================================================
  // PILAR 3: ATENÇÃO, INIBIÇÃO & REAÇÃO (5 UNIDADES)
  // =========================================================================
  {
    id: 'att-match',
    title: 'Atenção: Identificação Positiva',
    icon: '🎯',
    category: 'ATTENTION',
    categoryLabel: 'Atenção & Reação',
    badgeLabel: '➔ Filtro Pop-Out',
    badgeClass: 'badge-att',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Localize com precisão o alvo solicitado entre diversos distratores concorrentes no menor tempo.',
    ruleHighlight: 'filtre primeiro o atributo de maior contraste (cor) antes de examinar detalhes finos.',
    example: {
      seeLabel: 'Alvo Solicitado:',
      seeTokens: ['Círculo', 'Azul', 'Preenchido'],
      arrowText: '➔ Eliminar Não-Azuis',
      actionLabel: 'Você clica:',
      actionTokens: ['Opção B (Círculo Azul)'],
      reasoning: 'Raciocínio: A cor azul é processada pelo córtex visual em 40ms, descartando 80% das alternativas.'
    },
    foxTip: 'Filtro Pop-Out: O cérebro processa cor antes de formato. Não procure "círculo azul" lendo um por um. Desfoque ligeiramente os olhos e deixe a cor azul "saltar" no seu campo visual periférico!',
    speedHacks: [
      {
        title: 'Evite a Varredura Linear',
        description: 'Ler itens da esquerda para a direita como se lesse um texto custa 400ms a mais. Mantenha os olhos no centro e capte a tela como um todo.'
      },
      {
        title: 'Eliminação por Bloco',
        description: 'Se o alvo é vermelho, descarte mentalmente todas as formas verdes e amarelas em um único golpe de vista.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'att-negate',
    title: 'Atenção: Identificação Negativa ("NÃO")',
    icon: '🚫',
    category: 'ATTENTION',
    categoryLabel: 'Atenção & Reação',
    badgeLabel: '➔ Inibição Pré-Frontal',
    badgeClass: 'badge-att',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Encontre o item que viola a regra ou NÃO pertence ao grupo solicitado pelo enunciado.',
    ruleHighlight: 'cuidado com o reflexo: seu cérebro quer clicar no item correto, mas você busca o intruso.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['Qual NÃO é par?', '[ 8, 14, 21, 30 ]'],
      arrowText: '➔ Identificar o Ímpar',
      actionLabel: 'Você clica:',
      actionTokens: ['21'],
      reasoning: 'Raciocínio: 8, 14 e 30 são pares (obedecem). O intruso que NÃO é par é 21.'
    },
    foxTip: 'O Grito Mental do "INTRUSO!": O viés cognitivo natural busca confirmação. Ao ler a palavra "NÃO", diga internamente com força a palavra "INTRUSO". Seu córtex pré-frontal aciona os freios e evita o clique por impulso.',
    speedHacks: [
      {
        title: 'A Regra dos Três Checks',
        description: 'Faça um check mental rápido nos 3 que cumprem a regra. O único elemento sem check é a resposta correta imediata.'
      },
      {
        title: 'Respire 100ms Antes do Clique',
        description: 'Em exercícios negativos, 92% dos erros são cliques impulsivos. Uma pausa de apenas 100 milissegundos garante 100% de precisão.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'stroop-ink',
    title: 'Stroop: Foco na Cor da Tinta',
    icon: '🎨',
    category: 'ATTENTION',
    categoryLabel: 'Atenção & Reação',
    badgeLabel: '➔ Supressão de Leitura',
    badgeClass: 'badge-att',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Responda a COR DA TINTA com que a palavra foi desenhada e ignore totalmente o texto escrito.',
    ruleHighlight: 'não leia a palavra: ela é um distrator projetado para confundir seu reflexo leitor.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['VERMELHO (em tinta Azul)'],
      arrowText: '➔ Ignorar Texto, Ver Tinta',
      actionLabel: 'Você clica:',
      actionTokens: ['AZUL'],
      reasoning: 'Raciocínio: O texto diz "VERMELHO", mas a tinta visível é AZUL. Responda AZUL.'
    },
    foxTip: 'Supressão Foveal (Desfoque de Leitura): A leitura automática humana é 200ms mais rápida que a identificação de cores. Para derrotá-la, olhe para a primeira letra ou para as bordas externas sem tentar ler a palavra!',
    speedHacks: [
      {
        title: 'Bloqueie a Voz Interna',
        description: 'Se você subvocalizar (ler na mente), você falará o texto escrito e errará. Olhe a mancha de cor e acione o botão da cor diretamente pelo reflexo visual.'
      },
      {
        title: 'Treino de Mapeamento Visual',
        description: 'Associe a cor diretamente à posição do botão de resposta na tela, sem traduzir a cor em palavras.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'stroop-word',
    title: 'Stroop: Foco na Palavra Escrita',
    icon: '📖',
    category: 'ATTENTION',
    categoryLabel: 'Atenção & Reação',
    badgeLabel: '➔ Foco Léxico Puro',
    badgeClass: 'badge-att',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Responda o SIGNIFICADO DO TEXTO escrito e ignore a cor em que ele foi pintado.',
    ruleHighlight: 'leia a palavra imediatamente e feche a atenção para o matiz cromático.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['VERDE (em tinta Vermelha)'],
      arrowText: '➔ Ler Texto com Firmeza',
      actionLabel: 'Você clica:',
      actionTokens: ['VERDE'],
      reasoning: 'Raciocínio: A tinta é vermelha, mas o texto escrito é VERDE. Responda VERDE.'
    },
    foxTip: 'Dispare o Reflexo de Leitura: Aqui você faz o contrário do Stroop de tinta! Confie na sua leitura automática. Leia a palavra com convicção na mente e clique na opção correspondente sem olhar para a cor.',
    speedHacks: [
      {
        title: 'Leitura Instantânea',
        description: 'Este teste mede a velocidade de ativação léxica e flexibilidade atencional. Responda em menos de 1 segundo para acumular bônus de agilidade.'
      },
      {
        title: 'Mantenha a Flexibilidade',
        description: 'A alternância entre Stroop Tinta e Stroop Palavra fortalece o controle inibitório pré-frontal do cérebro.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'number-ordering',
    title: 'Ordenação Numérica Relâmpago',
    icon: '🔢',
    category: 'ATTENTION',
    categoryLabel: 'Atenção & Reação',
    badgeLabel: '➔ Classificação de Extremos',
    badgeClass: 'badge-att',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Ordene rapidamente a lista de números exibida em ordem crescente (ou decrescente).',
    ruleHighlight: 'localize primeiro o menor absoluto e o maior absoluto para balizar a série.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['42', '17', '89', '5'],
      arrowText: '➔ Ordem Crescente',
      actionLabel: 'Você clica:',
      actionTokens: ['5', '17', '42', '89'],
      reasoning: 'Raciocínio: Menor de todos é 5; depois 17, 42 e finalmente o maior, 89.'
    },
    foxTip: 'Ancoragem das Pontas: Em vez de ordenar número por número no meio, ache o menor de todos e o maior de todos! Ao identificar as pontas, os intermediários se resolvem quase por eliminação instantânea.',
    speedHacks: [
      {
        title: 'Filtre pela Casa da Dezena',
        description: 'Para comparar números de 2 dígitos (17 vs 42), olhe apenas para o primeiro algarismo. 1 dezena sempre vence 4 dezenas; ignore a unidade.'
      },
      {
        title: 'Uso dos Dois Polegares',
        description: 'No celular, posicione os dois polegares sobre a tela para tocar de forma alternada e reduzir a latência motora.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },

  // =========================================================================
  // PILAR 4: RACIOCÍNIO LÓGICO & PROBLEMAS (4 UNIDADES)
  // =========================================================================
  {
    id: 'pat-arithmetic',
    title: 'Padrão Aritmético (Saltos Delta)',
    icon: '📈',
    category: 'LOGIC',
    categoryLabel: 'Raciocínio Lógico',
    badgeLabel: '➔ Diferença Constante (Δ)',
    badgeClass: 'badge-logic',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Descubra o termo seguinte da sequência calculando a diferença constante entre termos adjacentes.',
    ruleHighlight: 'calcule a diferença entre o 1º e o 2º número e confirme com o 3º.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['4', '11', '18', '25', '?'],
      arrowText: '➔ Salto Fixo Δ = +7',
      actionLabel: 'Você digita:',
      actionTokens: ['32'],
      reasoning: 'Raciocínio: 11 − 4 = +7; 18 − 11 = +7; 25 − 18 = +7. Próximo: 25 + 7 = 32.'
    },
    secondaryExample: {
      seeLabel: 'Delta Variável:',
      seeTokens: ['2', '4', '7', '11', '16', '?'],
      arrowText: '➔ Saltos +2, +3, +4, +5',
      actionLabel: 'Você digita:',
      actionTokens: ['22'],
      reasoning: 'O salto aumenta em 1 a cada passo. Próximo salto é +6: 16 + 6 = 22.'
    },
    foxTip: 'O Teste do Delta Primário: Calcule a subtração do 2º termo menos o 1º logo no primeiro segundo. Se for fixa, basta somar ao último! Se a diferença crescer (+2, +4, +6), você está diante de uma progressão de 2ª ordem.',
    speedHacks: [
      {
        title: 'Identificação de Saltos Decrescentes',
        description: 'Quando a sequência cai de forma suave (ex: 50, 43, 36, 29), calcule 50 − 43 = 7. Trata-se de uma subtração constante de 7 em 7.'
      },
      {
        title: 'Verifique os Dois Primeiros Pares',
        description: 'Nunca tente adivinhar a regra com apenas 1 par de números. Sempre confira se a regra se mantém entre o 2º e o 3º termo.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'pat-geometric',
    title: 'Padrão Geométrico (Razões & Potências)',
    icon: '⚡',
    category: 'LOGIC',
    categoryLabel: 'Raciocínio Lógico',
    badgeLabel: '➔ Razão Multiplicativa / Potências',
    badgeClass: 'badge-logic',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Encontre o próximo termo em sequências de multiplicação, divisão ou séries de potências.',
    ruleHighlight: 'se os números crescem ou caem rapidamente, trata-se de multiplicação ou potência.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['3', '6', '12', '24', '?'],
      arrowText: '➔ Razão ×2',
      actionLabel: 'Você digita:',
      actionTokens: ['48'],
      reasoning: 'Raciocínio: Cada número dobra: 3 × 2 = 6; 6 × 2 = 12; 24 × 2 = 48.'
    },
    secondaryExample: {
      seeLabel: 'Série de Quadrados:',
      seeTokens: ['1', '4', '9', '16', '25', '?'],
      arrowText: '➔ Potências (n²)',
      actionLabel: 'Você digita:',
      actionTokens: ['36'],
      reasoning: '1², 2², 3², 4², 5²... Próximo é 6² = 36.'
    },
    foxTip: 'Crescimento Explosivo = Multiplicação: Quando você notar que os números estão explodindo em tamanho, abandone a soma! Divida o segundo termo pelo primeiro para encontrar a razão multiplicativa na hora.',
    speedHacks: [
      {
        title: 'Detecte Séries de Metades',
        description: 'Se a sequência diminui pela metade (ex: 160, 80, 40, 20), o próximo termo é 10. Divisões sucessivas por 2 ou 3 são muito frequentes.'
      },
      {
        title: 'Conheça os Quadrados Perfeitos',
        description: 'Reconhecer 4, 9, 16, 25, 36, 49, 64, 81 instantaneamente economiza até 5 segundos por questão.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'pat-complex',
    title: 'Padrões Complexos (Fibonacci & Alternadas)',
    icon: '🧬',
    category: 'LOGIC',
    categoryLabel: 'Raciocínio Lógico',
    badgeLabel: '➔ Séries Entrelaçadas & Fibonacci',
    badgeClass: 'badge-logic',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Identifique padrões não-lineares, sequências de soma de vizinhos e duas séries intercaladas.',
    ruleHighlight: 'se os números sobem e descem em zigue-zague, pule de 2 em 2 termos.',
    example: {
      seeLabel: 'Você vê:',
      seeTokens: ['1', '1', '2', '3', '5', '8', '?'],
      arrowText: '➔ Soma dos 2 Anteriores',
      actionLabel: 'Você digita:',
      actionTokens: ['13'],
      reasoning: 'Raciocínio: Fibonacci: 1+1=2; 1+2=3; 2+3=5; 3+5=8. Próximo: 5 + 8 = 13.'
    },
    secondaryExample: {
      seeLabel: 'Série Intercalada:',
      seeTokens: ['2', '30', '4', '25', '6', '20', '?'],
      arrowText: '➔ Pular de 2 em 2',
      actionLabel: 'Você digita:',
      actionTokens: ['8'],
      reasoning: 'A série ímpar é (2, 4, 6, 8); a par é (30, 25, 20). Próximo da ímpar é 8.'
    },
    foxTip: 'O Olhar em Salto Duplo: Se a sequência oscila para cima e para baixo (sobe, desce, sobe, desce), tape mentalmente os termos pares e olhe apenas para os ímpares! Quase sempre são duas sequências independentes costuradas.',
    speedHacks: [
      {
        title: 'O Teste do Vizinho Duplo',
        description: 'Se a diferença não for constante nem multiplicativa, some os dois primeiros termos. Se o resultado for o terceiro, aplique a regra de Fibonacci até o final.'
      },
      {
        title: 'Operações Compostas',
        description: 'Fique atento a alternâncias de operadores (ex: +3, ×2, +3, ×2). Teste se o passo combina uma soma e um produto.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  },
  {
    id: 'word-problem',
    title: 'Problemas Contextuais & Estimativa',
    icon: '💡',
    category: 'LOGIC',
    categoryLabel: 'Raciocínio Lógico',
    badgeLabel: '➔ Proporção & Raciocínio Prático',
    badgeClass: 'badge-logic',
    levelRange: 'Nível 1 ao 5',
    ruleText: 'Resolva desafios de velocidade média, regra de três, tempo e proporções situacionais.',
    ruleHighlight: 'identifique primeiro se a grandeza é diretamente ou inversamente proporcional.',
    example: {
      seeLabel: 'Situação:',
      seeTokens: ['60 km/h', 'em', '2 horas'],
      arrowText: '➔ Dobro da Velocidade (120 km/h)',
      actionLabel: 'Você digita:',
      actionTokens: ['1'],
      reasoning: 'Raciocínio: Se a velocidade dobrou (×2), o tempo gasto cai pela metade (÷2). 2h ÷ 2 = 1h.'
    },
    secondaryExample: {
      seeLabel: 'Proporção Direta:',
      seeTokens: ['3 cadernos', '=', 'R$ 15'],
      arrowText: '➔ Custo de 5 Cadernos',
      actionLabel: 'Você digita:',
      actionTokens: ['25'],
      reasoning: 'Cada caderno custa 15 ÷ 3 = R$ 5. Logo, 5 cadernos custam 5 × 5 = R$ 25.'
    },
    foxTip: 'A Pergunta de Ouro: "Mais ou Menos?": Antes de fazer qualquer conta em problemas de proporção, pergunte a si mesmo: se eu aumentar essa variável, o resultado final deve ser MAIOR ou MENOR? Isso impede que você use proporção direta em problemas inversos!',
    speedHacks: [
      {
        title: 'Simplifique Antes de Multiplicar',
        description: 'Em regras de três como (45 × 12) ÷ 9, divida 45 por 9 primeiro (= 5) e multiplique 5 × 12 = 60. Evita números gigantes.'
      },
      {
        title: 'Estimativa por Ordens de Magnitude',
        description: 'Avalie se a resposta esperada tem 1 dígito, 2 dígitos ou centenas para descartar hipóteses sem perder tempo.'
      }
    ],
    defaultQuestionsText: '20 Questões Padrão'
  }
];
