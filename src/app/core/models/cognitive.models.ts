export type CognitiveCategory = 
  | 'CALCULATION' 
  | 'MEMORY' 
  | 'ATTENTION' 
  | 'SPEED' 
  | 'SPATIAL' 
  | 'ORDERING'
  | 'LOGIC';

export type ExerciseType = 
  | 'MENTAL_MATH' 
  | 'PERCENTAGE'         // Módulo Dedicado de Porcentagem (NeuroSprint Módulo Próprio)
  | 'WORD_PROBLEM'      // Distância, Velocidade, Tempo, Proporções, Contexto
  | 'NUMBER_SEQUENCE' 
  | 'GENIUS_COLORS' 
  | 'SPATIAL_GRID' 
  | 'ATTENTION_TARGET' 
  | 'STROOP_TEST'         // Inibição e Controle Cognitivo (Stroop)
  | 'NUMBER_ORDERING' 
  | 'LOGICAL_PATTERN'    // Sequências lógicas e padrões visuais/aritméticos
  | 'N_BACK';             // Memória de trabalho contínua

export interface ExerciseQuestion {
  id: string;
  category: CognitiveCategory;
  type: ExerciseType;
  difficulty: number; // 1 a 100 (retrocompatibilidade)
  level?: ExerciseLevel; // Nível 1 a 5
  unitId?: FocusUnitId;  // Unidade de foco granular
  subtype?: string;      // Sub-tipo dentro do exercício (ex: 'FORWARD', 'INK', 'ARITHMETIC')
  prompt: string;
  data: any;
  options?: any[];
  expectedAnswer: any;
  explanationStrategy?: string;
  hintStrategy?: string;  // Ajuda sutil da Raposa durante o exercício
  timeLimitSeconds?: number;
  hasTimerBar?: boolean;
  knowledgeId?: string;
  mathDomain?: 'ADDITION' | 'SUBTRACTION' | 'MULTIPLICATION' | 'DIVISION' | 'PERCENTAGE';
  mathFormat?: string;
}

export interface ExerciseAttempt {
  id?: number;
  sessionId: string;
  category: CognitiveCategory;
  type: ExerciseType;
  difficulty: number;
  userAnswer: any;
  expectedAnswer: any;
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: number;
  questionPrompt?: string;
  explanationStrategy?: string;
  isTimeout?: boolean;
  unitId?: FocusUnitId;
  knowledgeId?: string;
  mathDomain?: 'ADDITION' | 'SUBTRACTION' | 'MULTIPLICATION' | 'DIVISION' | 'PERCENTAGE';
}

export interface DailyWorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  durationTargetMin: number;
  totalDurationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  accuracyPercentage: number;
  averageResponseTimeMs: number;
  xpEarned: number;
  categoriesTrained: CognitiveCategory[];
  completed: boolean;
  createdAt: number;
  isImpulsive?: boolean;
  sessionTag?: 'Cirúrgico' | 'Consistente' | 'Desafio' | 'Impulsivo';
}

export interface CognitiveProfile {
  id: number;
  streakCurrent: number;
  streakBest: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakShieldCount: number;
  totalXp: number;
  level: number;
  totalSessionsCompleted: number;
  targetMinutes: number; // 3, 8 ou 15
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: 'dark' | 'light';
  cognitiveScores: {
    calculation: number;
    memory: number;
    attention: number;
    speed: number;
    spatial: number;
    flexibility: number;
  };
}

export interface PersonalRecord {
  category: CognitiveCategory;
  bestAccuracy: number;
  bestTimeMs: number;
  maxDifficulty: number;
  bestStreakInSession: number;
  lastUpdated: number;
}

export interface PendingReviewError {
  id?: number;
  sessionId: string;
  question: ExerciseQuestion;
  wrongAnswer: any;
  reviewAttempts: number;
  resolved: boolean;
  createdAt: number;
}

export type ExerciseLevel = 1 | 2 | 3 | 4 | 5;

// ── Identificadores granulares das 19 Unidades de Foco ───────────────────────
export type FocusUnitId =
  // Sessão: Cálculo (6 unidades)
  | 'math-addition'        // Adição
  | 'math-subtraction'     // Subtração
  | 'math-multiplication'  // Multiplicação
  | 'math-division'        // Divisão
  | 'pct-basic'            // Porcentagem Básica (10%, 25%, 50%)
  | 'pct-applied'          // Porcentagem Aplicada (desconto, aumento, reverso)
  // Sessão: Memória (4 unidades)
  | 'seq-forward'          // Sequência Numérica Direta
  | 'seq-reverse'          // Sequência Numérica Inversa
  | 'spatial-grid'         // Memória Espacial em Grade
  | 'genius-colors'        // Genius / Cores Sequenciais
  // Sessão: Atenção & Reação (5 unidades)
  | 'att-match'            // Atenção: Identificação Positiva
  | 'att-negate'           // Atenção: Identificação Negativa ("NÃO é")
  | 'stroop-ink'           // Stroop: Foco na Cor da Tinta
  | 'stroop-word'          // Stroop: Foco na Palavra Escrita
  | 'number-ordering'      // Ordenação Numérica
  // Sessão: Raciocínio Lógico (4 unidades)
  | 'pat-arithmetic'       // Padrão Aritmético (+n, -n)
  | 'pat-geometric'        // Padrão Geométrico (×n, sequência geométrica)
  | 'pat-complex'          // Padrão Complexo (Fibonacci, intercaladas)
  | 'word-problem';        // Problemas Contextuais (velocidade, proporção, estimativa)

export interface TestAttemptRecord {
  isCorrect: boolean;
  timestamp: number;
  responseTimeMs: number;
}

export interface SessionSummaryRecord {
  sessionId: string;
  timestamp: number;
  totalQuestions: number;      // ex: 20
  correctCount: number;        // ex: 19
  accuracyPercentage: number;  // ex: 95
  averageResponseTimeMs: number;
  level: ExerciseLevel;
  source: 'FOCAL' | 'GENERAL_BLOCK';
}

export interface TestProgressionState {
  unitId: FocusUnitId;
  currentLevel: ExerciseLevel;
  recentAttempts: TestAttemptRecord[]; // histórico de tentativas para micro-análise
  totalAttemptsAtLevel: number;
  correctCountAtLevel: number;
  accuracyPercentage: number; // 0 a 100 (média ponderada das sessões recentes)
  lastTrainedAt: number;      // timestamp da última tentativa/sessão desta unidade
  promotedAt?: number;
  gracePeriodAttemptsLeft: number;
  // Sistema de promoção por 50 sessões consistentes:
  recentSessions: SessionSummaryRecord[]; // até 50 sessões no nível atual
  totalSessionsAtLevel: number;
  accumulatedQuestionsBuffer?: { correct: number; total: number }; // acúmulo de questões do Treino Geral (a cada 20 -> 1 sessão)
}

// ── Sessão de Foco (agrupa unidades relacionadas) ────────────────────────────
export interface FocusSession {
  id: string;           // ex: 'calculo', 'memoria'
  name: string;         // ex: 'Cálculo'
  icon: string;         // ex: '🔢'
  description: string;
  unitIds: FocusUnitId[];
  color: string;        // cor temática para o card
}

export interface PlayerOverallProgression {
  overallLevel: number; // ex: 3.4
  overallRankTitle: string; // ex: "Raposa Estratégista"
  overallRankBadge: string; // ex: "🦊⚡"
  bottleneckUnitId: FocusUnitId | null;
  peakUnitId: FocusUnitId | null;
  testsInDecayRisk: FocusUnitId[];
  unitsSummary: TestProgressionState[];
}

export interface FocalWorkoutConfig {
  unitIds: FocusUnitId[];       // 1 unit = foco; vários = sessão
  sessionId?: string;           // ID da sessão pai (se vier de uma sessão)
  questionCount?: number;       // Padrão: 20 questões
  durationMinutes?: 2 | 5 | 10; // Retrocompatibilidade opcional
  level?: ExerciseLevel;        // Força nível específico (null = usa o atual de cada unidade)
}
