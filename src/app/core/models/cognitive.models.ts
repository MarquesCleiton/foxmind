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
  difficulty: number; // 1 a 100
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
