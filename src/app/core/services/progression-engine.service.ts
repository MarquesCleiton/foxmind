import { Injectable, inject } from '@angular/core';
import {
  ExerciseType,
  ExerciseLevel,
  FocusUnitId,
  FocusSession,
  TestProgressionState,
  TestAttemptRecord,
  SessionSummaryRecord,
  ExerciseAttempt,
  PlayerOverallProgression,
  FocalWorkoutConfig
} from '../models/cognitive.models';
import { StorageService } from './storage.service';

// ── Metadados de cada Unidade de Foco ────────────────────────────────────────
export interface FocusUnitMeta {
  unitId: FocusUnitId;
  name: string;
  icon: string;
  exerciseType: ExerciseType; // tipo base para geração de questões
  subtype?: string;           // parâmetro extra passado ao gerador
  sessionId: string;
  description: string;
  category: 'CALCULATION' | 'MEMORY' | 'ATTENTION' | 'LOGIC';
}

export const ALL_FOCUS_UNITS: FocusUnitMeta[] = [
  // ── Sessão: Cálculo ──────────────────────────────────────────────
  { unitId: 'math-addition',       name: 'Adição',                  icon: '➕', exerciseType: 'MENTAL_MATH',    subtype: 'ADDITION',        sessionId: 'calculo',  description: 'Somas de 1 a 4 dígitos com progressão de velocidade.',     category: 'CALCULATION' },
  { unitId: 'math-subtraction',    name: 'Subtração',               icon: '➖', exerciseType: 'MENTAL_MATH',    subtype: 'SUBTRACTION',     sessionId: 'calculo',  description: 'Subtrações diretas, com empréstimo e complementos de 10.',  category: 'CALCULATION' },
  { unitId: 'math-multiplication', name: 'Multiplicação',           icon: '✖️', exerciseType: 'MENTAL_MATH',    subtype: 'MULTIPLICATION',  sessionId: 'calculo',  description: 'Tabuadas e multiplicações de 2 dígitos.',                   category: 'CALCULATION' },
  { unitId: 'math-division',       name: 'Divisão',                 icon: '➗', exerciseType: 'MENTAL_MATH',    subtype: 'DIVISION',        sessionId: 'calculo',  description: 'Divisões exatas, estimativas e com resto.',                 category: 'CALCULATION' },
  { unitId: 'pct-basic',           name: 'Porcentagem Básica',      icon: '💯', exerciseType: 'PERCENTAGE',     subtype: 'BASIC',           sessionId: 'calculo',  description: '10%, 25%, 50% aplicados a valores redondos.',               category: 'CALCULATION' },
  { unitId: 'pct-applied',         name: 'Porcentagem Aplicada',    icon: '%',  exerciseType: 'PERCENTAGE',     subtype: 'APPLIED',         sessionId: 'calculo',  description: 'Descontos, aumentos, reverso e porcentagens compostas.',    category: 'CALCULATION' },
  // ── Sessão: Memória ──────────────────────────────────────────────
  { unitId: 'seq-forward',         name: 'Sequência Direta',        icon: '🔢', exerciseType: 'NUMBER_SEQUENCE', subtype: 'FORWARD',        sessionId: 'memoria',  description: 'Memorize e repita dígitos na ordem original.',              category: 'MEMORY' },
  { unitId: 'seq-reverse',         name: 'Sequência Inversa',       icon: '🔄', exerciseType: 'NUMBER_SEQUENCE', subtype: 'REVERSE',        sessionId: 'memoria',  description: 'Memorize e repita a sequência de trás para frente.',        category: 'MEMORY' },
  { unitId: 'spatial-grid',        name: 'Memória Espacial',        icon: '📐', exerciseType: 'SPATIAL_GRID',   subtype: undefined,         sessionId: 'memoria',  description: 'Memorize posições em grade e reconstrua o padrão.',         category: 'MEMORY' },
  { unitId: 'genius-colors',       name: 'Genius / Cores',          icon: '🎨', exerciseType: 'GENIUS_COLORS',  subtype: undefined,         sessionId: 'memoria',  description: 'Memorize e repita sequências de cores em ordem.',            category: 'MEMORY' },
  // ── Sessão: Atenção & Reação ─────────────────────────────────────
  { unitId: 'att-match',           name: 'Atenção: Positiva',       icon: '✅', exerciseType: 'ATTENTION_TARGET', subtype: 'MATCH',         sessionId: 'atencao',  description: 'Identifique e toque na cor correta rapidamente.',            category: 'ATTENTION' },
  { unitId: 'att-negate',          name: 'Atenção: Negativa',       icon: '🚫', exerciseType: 'ATTENTION_TARGET', subtype: 'NEGATE',        sessionId: 'atencao',  description: 'Toque no botão que NÃO é a cor indicada.',                  category: 'ATTENTION' },
  { unitId: 'stroop-ink',          name: 'Stroop: Tinta',           icon: '🖊️', exerciseType: 'STROOP_TEST',     subtype: 'INK',            sessionId: 'atencao',  description: 'Ignore a palavra e responda pela COR DA TINTA.',            category: 'ATTENTION' },
  { unitId: 'stroop-word',         name: 'Stroop: Palavra',         icon: '🔤', exerciseType: 'STROOP_TEST',     subtype: 'WORD',           sessionId: 'atencao',  description: 'Ignore a cor e responda pela PALAVRA ESCRITA.',             category: 'ATTENTION' },
  { unitId: 'number-ordering',     name: 'Ordenação Numérica',      icon: '🔢', exerciseType: 'NUMBER_ORDERING', subtype: undefined,         sessionId: 'atencao',  description: 'Toque nos números em ordem crescente sob pressão de tempo.', category: 'ATTENTION' },
  // ── Sessão: Raciocínio Lógico ────────────────────────────────────
  { unitId: 'pat-arithmetic',      name: 'Padrão Aritmético',       icon: '📈', exerciseType: 'LOGICAL_PATTERN', subtype: 'ARITHMETIC',     sessionId: 'logica',   description: 'Progressões com soma ou subtração constante (+n, -n).',     category: 'LOGIC' },
  { unitId: 'pat-geometric',       name: 'Padrão Geométrico',       icon: '🌀', exerciseType: 'LOGICAL_PATTERN', subtype: 'GEOMETRIC',      sessionId: 'logica',   description: 'Progressões geométricas (×2, ×3, ÷2...).',                  category: 'LOGIC' },
  { unitId: 'pat-complex',         name: 'Padrão Complexo',         icon: '🧩', exerciseType: 'LOGICAL_PATTERN', subtype: 'COMPLEX',        sessionId: 'logica',   description: 'Fibonacci, sequências intercaladas e padrões mistos.',       category: 'LOGIC' },
  { unitId: 'word-problem',        name: 'Problemas Contextuais',   icon: '📝', exerciseType: 'WORD_PROBLEM',    subtype: undefined,         sessionId: 'logica',   description: 'Velocidade, proporção, regra de 3 e estimativas.',           category: 'LOGIC' },
];

export const ALL_FOCUS_UNIT_IDS: FocusUnitId[] = ALL_FOCUS_UNITS.map(u => u.unitId);

// ── Definição das 5 Sessões ───────────────────────────────────────────────────
export const FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'calculo',
    name: 'Cálculo',
    icon: '🔢',
    description: 'Aritmética, porcentagem e raciocínio numérico.',
    unitIds: ['math-addition', 'math-subtraction', 'math-multiplication', 'math-division', 'pct-basic', 'pct-applied'],
    color: 'rgba(249, 115, 22, 0.15)'
  },
  {
    id: 'memoria',
    name: 'Memória',
    icon: '🧠',
    description: 'Retenção de sequências, posições e padrões visuais.',
    unitIds: ['seq-forward', 'seq-reverse', 'spatial-grid', 'genius-colors'],
    color: 'rgba(99, 102, 241, 0.15)'
  },
  {
    id: 'atencao',
    name: 'Atenção & Reação',
    icon: '🎯',
    description: 'Foco seletivo, inibição cognitiva e velocidade de resposta.',
    unitIds: ['att-match', 'att-negate', 'stroop-ink', 'stroop-word', 'number-ordering'],
    color: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 'logica',
    name: 'Raciocínio Lógico',
    icon: '💡',
    description: 'Padrões, sequências complexas e problemas contextuais.',
    unitIds: ['pat-arithmetic', 'pat-geometric', 'pat-complex', 'word-problem'],
    color: 'rgba(234, 179, 8, 0.15)'
  },
  {
    id: 'geral',
    name: 'Treino Geral',
    icon: '🦊',
    description: 'Todas as 19 unidades cognitivas em uma sessão completa.',
    unitIds: ALL_FOCUS_UNIT_IDS,
    color: 'rgba(239, 68, 68, 0.10)'
  }
];

// ── Tolerância de inatividade por nível ───────────────────────────────────────
const INACTIVITY_TOLERANCE_DAYS: Record<ExerciseLevel, number> = {
  1: Infinity, 2: 21, 3: 14, 4: 10, 5: 7
};
const INACTIVITY_WARNING_DAYS: Record<ExerciseLevel, number> = {
  1: Infinity, 2: 15, 3: 10, 4: 7, 5: 5
};

export const REQUIRED_SESSIONS_FOR_PROMOTION = 50;
export const PROMOTION_ACCURACY_THRESHOLD    = 95; // 95%
const WINDOW_SIZE   = 20;

@Injectable({ providedIn: 'root' })
export class ProgressionEngineService {
  private storage = inject(StorageService);
  private states  = new Map<FocusUnitId, TestProgressionState>();
  private isLoaded = false;

  // ── Inicialização ──────────────────────────────────────────────────────────
  async init(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const persisted = await this.storage.getAllTestProgressions();
      const persistedMap = new Map(persisted.map(s => [s.unitId, s]));

      for (const unitId of ALL_FOCUS_UNIT_IDS) {
        if (persistedMap.has(unitId)) {
          const s = persistedMap.get(unitId)!;
          s.recentSessions = s.recentSessions || [];
          s.totalSessionsAtLevel = s.totalSessionsAtLevel || 0;
          s.accumulatedQuestionsBuffer = s.accumulatedQuestionsBuffer || { correct: 0, total: 0 };
          this.states.set(unitId, s);
        } else {
          const fresh = this.createFreshState(unitId);
          this.states.set(unitId, fresh);
          await this.storage.saveTestProgression(fresh);
        }
      }

      await this.evaluateDecayForAll();
      this.isLoaded = true;
    } catch (err) {
      console.warn('Conflito de versão ou schema no banco detectado. Executando auto-recuperação...', err);
      try {
        await this.storage.forceResetDatabase();
        for (const unitId of ALL_FOCUS_UNIT_IDS) {
          const fresh = this.createFreshState(unitId);
          this.states.set(unitId, fresh);
          await this.storage.saveTestProgression(fresh);
        }
        this.isLoaded = true;
      } catch (recoveryErr) {
        console.error('Falha na persistência. Ativando fallback resiliente em memória:', recoveryErr);
        for (const unitId of ALL_FOCUS_UNIT_IDS) {
          this.states.set(unitId, this.createFreshState(unitId));
        }
        this.isLoaded = true;
      }
    }
  }

  private createFreshState(unitId: FocusUnitId): TestProgressionState {
    return {
      unitId,
      currentLevel: 1,
      recentAttempts: [],
      totalAttemptsAtLevel: 0,
      correctCountAtLevel: 0,
      accuracyPercentage: 0,
      lastTrainedAt: 0,
      gracePeriodAttemptsLeft: 0,
      recentSessions: [],
      totalSessionsAtLevel: 0,
      accumulatedQuestionsBuffer: { correct: 0, total: 0 }
    };
  }

  // ── Leitura ────────────────────────────────────────────────────────────────
  getState(unitId: FocusUnitId): TestProgressionState {
    return this.states.get(unitId) ?? this.createFreshState(unitId);
  }

  getLevel(unitId: FocusUnitId): ExerciseLevel {
    return this.getState(unitId).currentLevel;
  }

  getUnitMeta(unitId: FocusUnitId): FocusUnitMeta {
    return ALL_FOCUS_UNITS.find(u => u.unitId === unitId) ?? ALL_FOCUS_UNITS[0];
  }

  getAllStates(): TestProgressionState[] {
    return ALL_FOCUS_UNIT_IDS.map(id => this.getState(id));
  }

  /** Nível médio de uma sessão (1.0 a 5.0) */
  getSessionLevel(session: FocusSession): number {
    const levels = session.unitIds.map(id => this.getState(id).currentLevel);
    return parseFloat((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1));
  }

  /** Unidade com menor nível dentro da sessão (gargalo real — apenas se houver treinos e disparidade) */
  getSessionBottleneck(session: FocusSession): TestProgressionState | null {
    const states = session.unitIds.map(id => this.getState(id));
    const trained = states.filter(s => s.lastTrainedAt > 0 || s.totalAttemptsAtLevel > 0);
    // Sem treinos registrados nesta sessão: nenhum gargalo
    if (trained.length === 0) return null;

    const minLevel = Math.min(...trained.map(s => s.currentLevel));
    const maxLevel = Math.max(...trained.map(s => s.currentLevel));
    const lowest = trained.filter(s => s.currentLevel === minLevel);

    // Só é gargalo se houver diferença de nível (max > min) OU se a acurácia estiver baixa (< 70%)
    if (maxLevel > minLevel || lowest.some(s => s.accuracyPercentage < 70)) {
      return lowest.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)[0];
    }
    return null;
  }

  getOverallProgression(): PlayerOverallProgression {
    const all = this.getAllStates();
    const levels = all.map(s => s.currentLevel);
    const overallLevel = parseFloat((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(1));
    const { title, badge } = this.rankFromLevel(overallLevel);

    const trained = all.filter(s => s.lastTrainedAt > 0 || s.totalAttemptsAtLevel > 0);

    let bottleneckUnitId: FocusUnitId | null = null;
    let peakUnitId: FocusUnitId | null = null;

    if (trained.length > 0) {
      const minLevel = Math.min(...trained.map(s => s.currentLevel));
      const maxLevel = Math.max(...trained.map(s => s.currentLevel));

      // 1. Gargalo real: menor nível se houver disparidade ou se estiver abaixo de 70% de acurácia
      const lowestCandidates = trained.filter(s => s.currentLevel === minLevel);
      if (maxLevel > minLevel || lowestCandidates.some(s => s.accuracyPercentage < 70)) {
        bottleneckUnitId = lowestCandidates.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)[0].unitId;
      }

      // 2. Fortaleza / Maior Destaque: deve ser um domínio real (nível >= 2 ou acurácia >= 75%)
      // E JAMAIS pode ser a mesma unidade do gargalo!
      const peakCandidates = trained
        .filter(s => s.unitId !== bottleneckUnitId)
        .filter(s => s.currentLevel >= 2 || s.accuracyPercentage >= 75);

      if (peakCandidates.length > 0) {
        const peakMaxLevel = Math.max(...peakCandidates.map(s => s.currentLevel));
        const highestOfPeaks = peakCandidates.filter(s => s.currentLevel === peakMaxLevel);
        peakUnitId = highestOfPeaks.sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)[0].unitId;
      } else if (!bottleneckUnitId && trained.length > 0) {
        // Se não há gargalo e o jogador está bem, destaca a melhor unidade se tiver bom desempenho (>= 70%)
        const best = trained.filter(s => s.accuracyPercentage >= 70);
        if (best.length > 0) {
          peakUnitId = best.sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)[0].unitId;
        }
      }
    }

    const decayRisk = all
      .filter(s => {
        const days = this.daysUntilDecay(s);
        return days !== null && days <= INACTIVITY_WARNING_DAYS[s.currentLevel];
      })
      .map(s => s.unitId);

    return {
      overallLevel,
      overallRankTitle: title,
      overallRankBadge: badge,
      bottleneckUnitId,
      peakUnitId,
      testsInDecayRisk: decayRisk,
      unitsSummary: all
    };
  }

  private rankFromLevel(level: number): { title: string; badge: string } {
    if (level >= 4.8) return { title: 'Grão-Mestre FoxMind',    badge: '🦊💎' };
    if (level >= 4.0) return { title: 'Raposa Soberana',         badge: '🦊👑' };
    if (level >= 3.0) return { title: 'Raposa Estrategista',     badge: '🦊⚡' };
    if (level >= 2.0) return { title: 'Raposa Atenta',           badge: '🦊🎯' };
    return               { title: 'Raposa Curiosa',          badge: '🦊🌱' };
  }

  getLevelName(level: number): string {
    const floor = Math.floor(level);
    switch (floor) {
      case 5: return 'Mestre ⭐';
      case 4: return 'Especialista';
      case 3: return 'Avançado';
      case 2: return 'Prático';
      case 1:
      default: return 'Base';
    }
  }

  getLevelFullLabel(level: number): string {
    const floor = Math.floor(level);
    switch (floor) {
      case 5: return 'Nível 5 • Mestre ⭐';
      case 4: return 'Nível 4 • Especialista';
      case 3: return 'Nível 3 • Avançado';
      case 2: return 'Nível 2 • Prático';
      case 1:
      default: return 'Nível 1 • Base';
    }
  }

  daysUntilDecay(state: TestProgressionState): number | null {
    if (state.currentLevel === 1 || state.lastTrainedAt === 0) return null;
    const tolerance = INACTIVITY_TOLERANCE_DAYS[state.currentLevel];
    if (tolerance === Infinity) return null;
    const daysSince = (Date.now() - state.lastTrainedAt) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(tolerance - daysSince));
  }

  isInDecayWarning(state: TestProgressionState): boolean {
    const remaining = this.daysUntilDecay(state);
    if (remaining === null) return false;
    return remaining <= INACTIVITY_WARNING_DAYS[state.currentLevel];
  }

  // ── Registro de Tentativa em Tempo Real ────────────────────────────────────
  async recordAttempt(
    unitId: FocusUnitId,
    isCorrect: boolean,
    responseTimeMs: number
  ): Promise<{ levelUp: boolean; levelDown: boolean; newLevel: ExerciseLevel }> {
    await this.init();
    const state = this.getState(unitId);

    const attempt: TestAttemptRecord = { isCorrect, timestamp: Date.now(), responseTimeMs };
    state.recentAttempts.push(attempt);
    if (state.recentAttempts.length > WINDOW_SIZE) state.recentAttempts.shift();

    state.totalAttemptsAtLevel++;
    if (isCorrect) state.correctCountAtLevel++;
    state.lastTrainedAt = Date.now();

    // Mantém a acurácia em tempo real se ainda não houver sessões completas
    if (state.recentSessions.length === 0) {
      const windowCorrect = state.recentAttempts.filter(a => a.isCorrect).length;
      state.accuracyPercentage = Math.round((windowCorrect / state.recentAttempts.length) * 100);
    }

    this.states.set(unitId, state);
    await this.storage.saveTestProgression(state);
    return { levelUp: false, levelDown: false, newLevel: state.currentLevel };
  }

  // ── Registro de Sessão Completa (Promoção por 50 Sessões com Média >= 95%) ───
  async recordCompletedSession(
    unitId: FocusUnitId,
    sessionRecord: SessionSummaryRecord
  ): Promise<{ levelUp: boolean; newLevel: ExerciseLevel }> {
    await this.init();
    const state = this.getState(unitId);
    state.recentSessions = state.recentSessions || [];
    state.recentSessions.push(sessionRecord);
    if (state.recentSessions.length > REQUIRED_SESSIONS_FOR_PROMOTION) {
      state.recentSessions.shift();
    }

    state.totalSessionsAtLevel = (state.totalSessionsAtLevel || 0) + 1;
    state.totalAttemptsAtLevel = (state.totalAttemptsAtLevel || 0) + sessionRecord.totalQuestions;
    state.correctCountAtLevel = (state.correctCountAtLevel || 0) + sessionRecord.correctCount;
    state.lastTrainedAt = Date.now();

    // Acurácia média histórica das sessões no nível atual
    const sessionsAtLevel = state.recentSessions.filter(s => s.level === state.currentLevel);
    const avgAcc = sessionsAtLevel.length > 0
      ? Math.round(sessionsAtLevel.reduce((sum, s) => sum + s.accuracyPercentage, 0) / sessionsAtLevel.length)
      : sessionRecord.accuracyPercentage;

    state.accuracyPercentage = avgAcc;

    let levelUp = false;

    // Regra das 50 sessões consistentes com média >= 95%
    if (
      sessionsAtLevel.length >= REQUIRED_SESSIONS_FOR_PROMOTION &&
      avgAcc >= PROMOTION_ACCURACY_THRESHOLD &&
      state.currentLevel < 5
    ) {
      state.currentLevel = (state.currentLevel + 1) as ExerciseLevel;
      state.promotedAt = Date.now();
      state.recentSessions = [];
      state.totalSessionsAtLevel = 0;
      state.accuracyPercentage = 0;
      state.recentAttempts = [];
      levelUp = true;
    }

    this.states.set(unitId, state);
    await this.storage.saveTestProgression(state);
    return { levelUp, newLevel: state.currentLevel };
  }

  // ── Acúmulo de Blocos do Treino Geral (40 Questões) ────────────────────────
  async recordGeneralWorkoutBlocks(attempts: ExerciseAttempt[]): Promise<Array<{ type: ExerciseType; newLevel: ExerciseLevel }>> {
    await this.init();
    const promoEvents: Array<{ type: ExerciseType; newLevel: ExerciseLevel }> = [];

    // Agrupa acertos e totais por unitId
    const counts = new Map<FocusUnitId, { correct: number; total: number; avgTime: number }>();
    for (const a of attempts) {
      if (!a.unitId) continue;
      const cur = counts.get(a.unitId) || { correct: 0, total: 0, avgTime: 0 };
      cur.total++;
      if (a.isCorrect) cur.correct++;
      cur.avgTime += a.responseTimeMs;
      counts.set(a.unitId, cur);
    }

    for (const [unitId, res] of counts.entries()) {
      const state = this.getState(unitId);
      const buffer = state.accumulatedQuestionsBuffer || { correct: 0, total: 0 };
      buffer.correct += res.correct;
      buffer.total += res.total;

      // Cada 20 questões acumuladas fecha 1 bloco consolidado equivalente a 1 sessão
      while (buffer.total >= 20) {
        const blockCorrect = Math.min(20, Math.round((buffer.correct / buffer.total) * 20));
        buffer.total -= 20;
        buffer.correct = Math.max(0, buffer.correct - blockCorrect);

        const sessionRecord: SessionSummaryRecord = {
          sessionId: 'gen-block-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          timestamp: Date.now(),
          totalQuestions: 20,
          correctCount: blockCorrect,
          accuracyPercentage: Math.round((blockCorrect / 20) * 100),
          averageResponseTimeMs: Math.round(res.avgTime / Math.max(1, res.total)),
          level: state.currentLevel,
          source: 'GENERAL_BLOCK'
        };

        const { levelUp, newLevel } = await this.recordCompletedSession(unitId, sessionRecord);
        if (levelUp) {
          const meta = this.getUnitMeta(unitId);
          promoEvents.push({ type: meta.exerciseType, newLevel });
        }
      }

      state.accumulatedQuestionsBuffer = buffer;
      this.states.set(unitId, state);
      await this.storage.saveTestProgression(state);
    }

    return promoEvents;
  }

  // ── Super Escudo: Proteção Global para as 19 Unidades ──────────────────────
  async applySuperShield(): Promise<void> {
    await this.init();
    const now = Date.now();
    for (const unitId of ALL_FOCUS_UNIT_IDS) {
      const state = this.getState(unitId);
      state.lastTrainedAt = now;
      this.states.set(unitId, state);
      await this.storage.saveTestProgression(state);
    }
  }

  // ── Decaimento por Inatividade ─────────────────────────────────────────────
  private async evaluateDecayForAll(): Promise<void> {
    for (const unitId of ALL_FOCUS_UNIT_IDS) {
      const state = this.states.get(unitId);
      if (!state || state.currentLevel === 1 || state.lastTrainedAt === 0) continue;
      const tolerance = INACTIVITY_TOLERANCE_DAYS[state.currentLevel];
      if (tolerance === Infinity) continue;
      const daysSince = (Date.now() - state.lastTrainedAt) / (1000 * 60 * 60 * 24);
      if (daysSince >= tolerance) {
        state.currentLevel = (state.currentLevel - 1) as ExerciseLevel;
        state.recentAttempts = [];
        state.recentSessions = [];
        state.totalSessionsAtLevel = 0;
        state.accuracyPercentage = 0;
        state.gracePeriodAttemptsLeft = 0;
        this.states.set(unitId, state);
        await this.storage.saveTestProgression(state);
      }
    }
  }

  // ── Geradores de Fila de Treino ────────────────────────────────────────────

  /**
   * Monta o plano do Treino Geral Diário: 40 Questões
   * (10 Cálculo + 10 Memória + 10 Atenção + 10 Raciocínio Lógico),
   * calibradas no nível exato do jogador em cada habilidade.
   */
  buildGeneralWorkoutPlan(totalQuestions = 40): Array<{ unitId: FocusUnitId; level: ExerciseLevel }> {
    const calculationUnits: FocusUnitId[] = ['math-addition', 'math-subtraction', 'math-multiplication', 'math-division', 'pct-basic', 'pct-applied'];
    const memoryUnits: FocusUnitId[]      = ['seq-forward', 'seq-reverse', 'spatial-grid', 'genius-colors'];
    const attentionUnits: FocusUnitId[]   = ['att-match', 'att-negate', 'stroop-ink', 'stroop-word', 'number-ordering'];
    const logicUnits: FocusUnitId[]       = ['pat-arithmetic', 'pat-geometric', 'pat-complex', 'word-problem'];

    const perDomain = Math.floor(totalQuestions / 4); // 10 por área
    const plan: Array<{ unitId: FocusUnitId; level: ExerciseLevel }> = [];

    // 10 de Cálculo
    for (let i = 0; i < perDomain; i++) {
      const uid = calculationUnits[i % calculationUnits.length];
      plan.push({ unitId: uid, level: this.getLevel(uid) });
    }
    // 10 de Memória
    for (let i = 0; i < perDomain; i++) {
      const uid = memoryUnits[i % memoryUnits.length];
      plan.push({ unitId: uid, level: this.getLevel(uid) });
    }
    // 10 de Atenção
    for (let i = 0; i < perDomain; i++) {
      const uid = attentionUnits[i % attentionUnits.length];
      plan.push({ unitId: uid, level: this.getLevel(uid) });
    }
    // 10 de Lógica
    for (let i = 0; i < perDomain; i++) {
      const uid = logicUnits[i % logicUnits.length];
      plan.push({ unitId: uid, level: this.getLevel(uid) });
    }

    // Embaralha para alternância cognitiva dinâmica
    return plan.sort(() => Math.random() - 0.5);
  }

  /**
   * Retorna a quantidade exata de questões para um treino focal da unidade:
   * - No Nível 1 das 4 operações básicas: conjunto exaustivo completo sem redundância (45 ou 81 questões)
   * - Para todos os outros itens e níveis 2+: 20 questões padrão
   */
  questionsForUnit(unitId: FocusUnitId, level?: ExerciseLevel): number {
    const lvl = level ?? this.getLevel(unitId);
    if (lvl === 1) {
      if (unitId === 'math-addition' || unitId === 'math-multiplication') return 45;
      if (unitId === 'math-subtraction' || unitId === 'math-division') return 81;
    }
    return 20;
  }

  /**
   * Texto explicativo do formato de treino daquela unidade
   */
  getChallengeFormatLabel(unitId: FocusUnitId, level?: ExerciseLevel): string {
    const lvl = level ?? this.getLevel(unitId);
    if (lvl === 1) {
      switch (unitId) {
        case 'math-addition':
          return 'Conjunto Completo: 45 questões únicas (todas as somas de 1 dígito 1+1 a 9+9)';
        case 'math-subtraction':
          return 'Conjunto Completo: 81 questões com polaridades (1-1 a 9-9 e valores negativos)';
        case 'math-multiplication':
          return 'Conjunto Completo: 45 questões únicas (todas as multiplicações 1×1 a 9×9)';
        case 'math-division':
          return 'Conjunto Completo: 81 divisões exatas da tabuada (1÷1 a 81÷9)';
      }
    }
    return 'Treino Focal Padrão: 20 questões exclusivas no seu nível.';
  }

  /**
   * Monta o plano do Treino Focal:
   * - Se for unidade única sem total forçado, utiliza questionsForUnit(unitId, forcedLevel)
   * - Caso contrário, utiliza o total solicitado (padrão 20)
   */
  buildFocalWorkoutPlan(
    unitIds: FocusUnitId[],
    totalQuestions?: number,
    forcedLevel?: ExerciseLevel
  ): Array<{ unitId: FocusUnitId; level: ExerciseLevel }> {
    let count = totalQuestions;
    if (!count) {
      if (unitIds.length === 1) {
        const uid = unitIds[0];
        const lvl = forcedLevel ?? this.getLevel(uid);
        count = this.questionsForUnit(uid, lvl);
      } else {
        count = 20;
      }
    }

    const plan: Array<{ unitId: FocusUnitId; level: ExerciseLevel }> = [];
    for (let i = 0; i < count; i++) {
      const unitId = unitIds[i % unitIds.length];
      plan.push({ unitId, level: forcedLevel ?? this.getLevel(unitId) });
    }
    return plan;
  }
}
