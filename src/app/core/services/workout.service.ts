import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { AudioHapticService } from './audio-haptic.service';
import { AdaptiveEngineService } from './adaptive-engine.service';
import { MentalMathService } from './mental-math.service';
import { ProgressionEngineService, ALL_FOCUS_UNIT_IDS } from './progression-engine.service';
import { 
  CognitiveCategory, 
  DailyWorkoutSession, 
  ExerciseAttempt, 
  ExerciseQuestion, 
  ExerciseType, 
  PendingReviewError,
  FocalWorkoutConfig,
  ExerciseLevel,
  FocusUnitId
} from '../models/cognitive.models';
import { MathDomain } from '../models/mental-math.models';

export type WorkoutState = 'IDLE' | 'WARMUP' | 'EXERCISING' | 'ERROR_REVIEW' | 'SUMMARY';

export interface SessionDiagnosticItem {
  category: string;
  icon: string;
  title: string;
  detail: string;
}

export interface SessionDiagnostics {
  formattedDuration: string;
  strengths: SessionDiagnosticItem[];
  improvements: SessionDiagnosticItem[];
  overallSummary: string;
  speechTitle: string;
  speechMessage: string;
  accuracyClass: 'acc-high' | 'acc-mid' | 'acc-low';
  isImpulsive: boolean;
  honestNotice?: string;
}

export interface TimeoutModalData {
  question: ExerciseQuestion;
  correctAnswerDisplay: string;
  strategy?: string;
}

const ACTIVE_SESSION_STORAGE_KEY = 'foxmind_active_workout_session';

export interface PersistedWorkoutSession {
  sessionId: string;
  selectedMinutes: number;
  activeMathDomain: MathDomain | 'MIXED' | null;
  currentQuestionIndex: number;
  totalQuestionsCount: number;
  currentDifficulty: number;
  sessionStartTime: number;
  consecutiveErrors: number;
  sessionAttempts: ExerciseAttempt[];
  pendingErrors: PendingReviewError[];
  state: WorkoutState;
  exerciseTypes: ExerciseType[];
  isFocalWorkout?: boolean;
  focalWorkoutConfig?: FocalWorkoutConfig | null;
  questionsQueue?: ExerciseQuestion[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private storage = inject(StorageService);
  private audio = inject(AudioHapticService);
  private engine = inject(AdaptiveEngineService);
  private mentalMath = inject(MentalMathService);
  private progression = inject(ProgressionEngineService);

  // Estados Reativos do Treino
  public state = signal<WorkoutState>('IDLE');
  public currentQuestion = signal<ExerciseQuestion | null>(null);
  public currentQuestionIndex = signal<number>(0);
  public totalQuestionsCount = signal<number>(12);
  public sessionProgressPercent = signal<number>(0);
  public activeMathDomain = signal<MathDomain | 'MIXED' | null>(null);
  public isFocalWorkout = signal<boolean>(false);
  public focalWorkoutConfig = signal<FocalWorkoutConfig | null>(null);

  // Eventos de Level Up ocorridos na sessão
  public levelUpEvents = signal<Array<{ type: ExerciseType; newLevel: ExerciseLevel }>>([]);
  
  // Feedback imediato sutil (sem interromper)
  public feedback = signal<{ isCorrect: boolean; text: string } | null>(null);
  
  // Resumo final e telas intermediárias
  public sessionResult = signal<DailyWorkoutSession | null>(null);
  public sessionDiagnostics = signal<SessionDiagnostics | null>(null);
  public timeoutModalData = signal<TimeoutModalData | null>(null);
  public selectedMinutes = signal<number>(8);
  public naturalHintActive = signal<boolean>(false);
  
  // Sessão em andamento
  private sessionId = '';
  private questionsQueue: ExerciseQuestion[] = [];
  private sessionExerciseTypes: ExerciseType[] = [];
  private sessionAttempts: ExerciseAttempt[] = [];
  private currentDifficulty = 40;
  private sessionStartTime = 0;
  private questionStartTime = 0;
  private pendingErrors: PendingReviewError[] = [];
  private reviewingErrorIndex = 0;
  private consecutiveErrors = 0;

  // Inicia o Treino Diário Geral (40 Questões • 10 por área)
  public async startDailyWorkout(): Promise<void> {
    await this.progression.init();
    this.engine.resetMathDecks();
    this.activeMathDomain.set(null);
    this.isFocalWorkout.set(false);
    this.focalWorkoutConfig.set(null);
    this.levelUpEvents.set([]);
    this.selectedMinutes.set(10);
    this.sessionId = 'sesh-' + Date.now().toString(36);
    this.sessionAttempts = [];
    this.pendingErrors = [];
    this.consecutiveErrors = 0;
    this.naturalHintActive.set(false);
    this.sessionStartTime = Date.now();
    
    // Obter dificuldade média inicial do perfil
    const profile = this.storage.profileSignal();
    this.currentDifficulty = Math.round(
      (profile.cognitiveScores.calculation + profile.cognitiveScores.memory + profile.cognitiveScores.attention) / 3
    ) || 40;

    // Montar fila de 40 questões balanceadas (10 Cálculo, 10 Memória, 10 Atenção, 10 Lógica)
    const plan = this.progression.buildGeneralWorkoutPlan(40);
    this.sessionExerciseTypes = [];
    this.questionsQueue = plan.map(({ unitId, level }) => {
      const q = this.engine.generateQuestionForUnit(unitId, level);
      this.sessionExerciseTypes.push(q.type);
      return q;
    });

    this.totalQuestionsCount.set(this.questionsQueue.length);
    this.currentQuestionIndex.set(0);
    this.sessionProgressPercent.set(0);

    // Iniciar aquecimento sutil de 3 segundos
    this.state.set('WARMUP');
    this.saveActiveSessionToStorage();
  }

  // Inicia Treino Focado em um Módulo de Matemática Mental (45 ou 81 para N1, 20 para N2+)
  public startMathDomainWorkout(domain: MathDomain | 'MIXED'): void {
    this.engine.resetMathDecks();
    this.activeMathDomain.set(domain);
    this.isFocalWorkout.set(false);
    this.focalWorkoutConfig.set(null);
    this.levelUpEvents.set([]);
    this.selectedMinutes.set(5);
    this.sessionId = 'math-' + domain.toLowerCase() + '-' + Date.now().toString(36);
    this.sessionAttempts = [];
    this.pendingErrors = [];
    this.consecutiveErrors = 0;
    this.naturalHintActive.set(false);
    this.sessionStartTime = Date.now();

    const profile = this.storage.profileSignal();
    this.currentDifficulty = profile.cognitiveScores.calculation || 40;

    // Nível 1 das operações básicas: conjunto exaustivo completo
    let count = 20;
    if (domain === 'ADDITION' || domain === 'MULTIPLICATION') count = 45;
    else if (domain === 'SUBTRACTION' || domain === 'DIVISION') count = 81;

    const queue: ExerciseQuestion[] = [];
    this.sessionExerciseTypes = [];
    for (let i = 0; i < count; i++) {
      this.sessionExerciseTypes.push('MENTAL_MATH');
      queue.push(this.engine.generateMathDomainQuestion(domain, this.currentDifficulty));
    }

    this.questionsQueue = queue;
    this.totalQuestionsCount.set(queue.length);
    this.currentQuestionIndex.set(0);
    this.sessionProgressPercent.set(0);

    this.state.set('WARMUP');
    this.saveActiveSessionToStorage();
  }

  // Inicia Treino Focal (Central de Treinos) — N1 das 4 operações: conjunto completo (45 ou 81); outros: 20 questões
  public async startFocalWorkout(config: FocalWorkoutConfig): Promise<void> {
    await this.progression.init();
    this.engine.resetMathDecks();
    this.activeMathDomain.set(null);
    this.isFocalWorkout.set(true);
    this.focalWorkoutConfig.set(config);
    this.levelUpEvents.set([]);
    this.selectedMinutes.set(config.durationMinutes || 5);
    this.sessionId = 'focal-' + (config.sessionId ?? config.unitIds[0]) + '-' + Date.now().toString(36);
    this.sessionAttempts = [];
    this.pendingErrors = [];
    this.consecutiveErrors = 0;
    this.naturalHintActive.set(false);
    this.sessionStartTime = Date.now();
    this.currentDifficulty = 50;

    let totalQ = config.questionCount;
    if (!totalQ) {
      if (config.unitIds.length === 1) {
        totalQ = this.progression.questionsForUnit(config.unitIds[0], config.level);
      } else {
        totalQ = 20;
      }
    }

    const plan = this.progression.buildFocalWorkoutPlan(config.unitIds, totalQ, config.level);

    this.sessionExerciseTypes = [];
    const queue: ExerciseQuestion[] = plan.map(({ unitId, level }) => {
      const q = this.engine.generateQuestionForUnit(unitId, level);
      this.sessionExerciseTypes.push(q.type);
      return q;
    });

    this.questionsQueue = queue;
    this.totalQuestionsCount.set(queue.length);
    this.currentQuestionIndex.set(0);
    this.sessionProgressPercent.set(0);
    this.state.set('WARMUP');
    this.saveActiveSessionToStorage();
  }

  // Transição do Aquecimento para o primeiro Exercício
  public endWarmup(): void {
    this.state.set('EXERCISING');
    this.presentNextQuestion();
    this.saveActiveSessionToStorage();
  }

  private buildSessionQueue(targetMinutes: number): ExerciseQuestion[] {
    const queue: ExerciseQuestion[] = [];
    // 3 min = 6 questões | 8 min = 12 questões | 15 min = 20 questões
    const count = targetMinutes <= 3 ? 6 : (targetMinutes <= 8 ? 12 : 20);

    // Distribuição das 19 unidades de foco no treino diário
    this.sessionExerciseTypes = [];
    for (let i = 0; i < count; i++) {
      const unitId = ALL_FOCUS_UNIT_IDS[i % ALL_FOCUS_UNIT_IDS.length];
      const level  = this.progression.getLevel(unitId);
      const q = this.engine.generateQuestionForUnit(unitId, level);
      this.sessionExerciseTypes.push(q.type);
      queue.push(q);
    }

    return queue;
  }

  private presentNextQuestion(): void {
    const idx = this.currentQuestionIndex();
    if (idx < this.questionsQueue.length) {
      const q = this.questionsQueue[idx];
      this.currentQuestion.set(q);
      this.questionStartTime = Date.now();
      this.feedback.set(null);
      this.sessionProgressPercent.set(Math.round((idx / this.questionsQueue.length) * 100));
      
      // Oferece destaque visual de ajuda da Raposa apenas se tiver 2 erros recentes
      this.naturalHintActive.set(this.consecutiveErrors >= 2);
    } else {
      // Finalizou as questões principais -> verificar se há erros para revisão
      if (this.pendingErrors.length > 0) {
        this.startErrorReview();
      } else {
        this.finishSession();
      }
    }
  }

  // O usuário submete uma resposta (ou tempo esgotado)
  public async submitAnswer(userAnswer: any, isTimeout = false): Promise<void> {
    const q = this.currentQuestion();
    if (!q) return;

    const responseTimeMs = isTimeout 
      ? (q.timeLimitSeconds ? q.timeLimitSeconds * 1000 : 15000) 
      : Date.now() - this.questionStartTime;
    
    const isCorrect = !isTimeout && this.validateAnswer(q, userAnswer);

    // Feedback sonoro/tátil sutil
    if (isCorrect) {
      this.audio.playSuccess();
      this.feedback.set({ isCorrect: true, text: 'Correto' });
      this.consecutiveErrors = 0;
      this.naturalHintActive.set(false);
    } else {
      this.audio.playError();
      const text = isTimeout ? 'Tempo Esgotado' : 'Incorreto';
      this.feedback.set({ isCorrect: false, text });
      this.consecutiveErrors++;
      if (this.consecutiveErrors >= 2) {
        this.naturalHintActive.set(true);
      }
    }

    // Registrar tentativa na memória da sessão atual
    // (IMPORTANTE: Nenhum dado é salvo no banco/progresso se o usuário desistir antes de concluir!)
    const attempt: ExerciseAttempt = {
      sessionId: this.sessionId,
      category: q.category,
      type: q.type,
      difficulty: q.difficulty,
      userAnswer,
      expectedAnswer: q.expectedAnswer,
      isCorrect,
      responseTimeMs,
      timestamp: Date.now(),
      questionPrompt: q.prompt,
      explanationStrategy: q.explanationStrategy,
      isTimeout,
      unitId: (q.unitId as FocusUnitId | undefined),
      knowledgeId: q.knowledgeId,
      mathDomain: q.mathDomain
    };

    this.sessionAttempts.push(attempt);

    // Se errou e ainda estamos no treino regular, guarda para a revisão final (em memória)
    if (!isCorrect && this.state() === 'EXERCISING') {
      const errItem: PendingReviewError = {
        sessionId: this.sessionId,
        question: q,
        wrongAnswer: isTimeout ? 'Tempo Esgotado' : userAnswer,
        reviewAttempts: 0,
        resolved: false,
        createdAt: Date.now()
      };
      this.pendingErrors.push(errItem);
    }

    // Atualizar motor adaptativo (ajuste mais acolhedor em caso de dificuldade persistente)
    this.currentDifficulty = this.engine.calculateNextDifficulty(
      this.currentDifficulty, 
      isCorrect, 
      responseTimeMs
    );
    if (this.consecutiveErrors >= 2) {
      this.currentDifficulty = Math.max(10, this.currentDifficulty - 4);
    }


    // Se foi tempo esgotado, pausa e exibe tela intermediária para evitar cliques acidentais
    if (isTimeout) {
      let expectedStr = String(q.expectedAnswer);
      if (Array.isArray(q.expectedAnswer)) {
        expectedStr = q.expectedAnswer.join(' ➔ ');
      }
      this.timeoutModalData.set({
        question: q,
        correctAnswerDisplay: expectedStr,
        strategy: q.explanationStrategy || q.hintStrategy
      });
      return; // Aguarda o usuário tocar em "Continuar para o Próximo"
    }

    // Pequeno intervalo de 450ms para absorção e próximo exercício
    setTimeout(() => {
      if (this.state() === 'EXERCISING') {
        this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
        this.presentNextQuestion();
        this.saveActiveSessionToStorage();
      } else if (this.state() === 'ERROR_REVIEW') {
        this.nextErrorReview();
        this.saveActiveSessionToStorage();
      }
    }, 450);
  }

  private validateAnswer(q: ExerciseQuestion, userAns: any): boolean {
    if (Array.isArray(q.expectedAnswer)) {
      if (!Array.isArray(userAns)) return false;
      if (userAns.length !== q.expectedAnswer.length) return false;
      return userAns.every((val, i) => val === q.expectedAnswer[i]);
    }
    return String(userAns).trim().toLowerCase() === String(q.expectedAnswer).trim().toLowerCase();
  }

  // Fluxo de Revisão de Erros
  private startErrorReview(): void {
    this.state.set('ERROR_REVIEW');
    this.reviewingErrorIndex = 0;
    this.presentReviewError();
  }

  private presentReviewError(): void {
    if (this.reviewingErrorIndex < this.pendingErrors.length) {
      const err = this.pendingErrors[this.reviewingErrorIndex];
      this.currentQuestion.set(err.question);
      this.questionStartTime = Date.now();
      this.feedback.set(null);
    } else {
      this.finishSession();
    }
  }

  private nextErrorReview(): void {
    this.reviewingErrorIndex++;
    this.presentReviewError();
  }

  // Concluir Sessão
  private async finishSession(): Promise<void> {
    const totalDurationSeconds = Math.max(10, Math.round((Date.now() - this.sessionStartTime) / 1000));
    const correctCount = this.sessionAttempts.filter(a => a.isCorrect).length;
    const totalQuestions = this.sessionAttempts.length;
    const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    const avgResponseTimeMs = totalQuestions > 0 
      ? Math.round(this.sessionAttempts.reduce((acc, cur) => acc + cur.responseTimeMs, 0) / totalQuestions) 
      : 0;

    // Heurística Anti-Impulsividade (Thresholds mínimos para leitura e resposta cognitiva)
    const minThresholds: Record<CognitiveCategory, number> = {
      CALCULATION: 700,
      MEMORY: 500,
      ATTENTION: 350,
      SPEED: 250,
      SPATIAL: 500,
      ORDERING: 600,
      LOGIC: 800
    };

    const impulsiveCount = this.sessionAttempts.filter(a => 
      !a.isCorrect && !a.isTimeout && a.responseTimeMs < (minThresholds[a.category] || 500)
    ).length;

    const isImpulsive = totalQuestions > 0 && (
      (impulsiveCount / totalQuestions >= 0.4) || 
      (accuracyPercentage === 0 && avgResponseTimeMs < 600)
    );

    // Cálculo do XP: Ético e Heurístico
    let xpEarned = 0;
    if (isImpulsive) {
      xpEarned = 5; // Apenas 5 XP simbólico por sessão com cliques impulsivos / chutes cegos
    } else {
      const accBonus = accuracyPercentage >= 80 ? 25 : (accuracyPercentage >= 60 ? 10 : 0);
      xpEarned = Math.round(25 + (correctCount * 10) + accBonus);
    }

    let sessionTag: 'Cirúrgico' | 'Consistente' | 'Desafio' | 'Impulsivo' = 'Consistente';
    if (isImpulsive) {
      sessionTag = 'Impulsivo';
    } else if (accuracyPercentage === 100) {
      sessionTag = 'Cirúrgico';
    } else if (accuracyPercentage < 50) {
      sessionTag = 'Desafio';
    }

    const categoriesTrained: CognitiveCategory[] = Array.from(
      new Set(this.sessionAttempts.map(a => a.category))
    );

    const sessionData: DailyWorkoutSession = {
      id: this.sessionId,
      date: new Date().toISOString().split('T')[0],
      durationTargetMin: Math.round(totalDurationSeconds / 60) || 1,
      totalDurationSeconds,
      totalQuestions,
      correctCount,
      accuracyPercentage,
      averageResponseTimeMs: avgResponseTimeMs,
      xpEarned,
      categoriesTrained,
      completed: true,
      createdAt: Date.now(),
      isImpulsive,
      sessionTag
    };

    // 1. Salvar todas as tentativas e fatos matemáticos da sessão 100% concluída
    for (const att of this.sessionAttempts) {
      await this.storage.saveAttempt(att);
      if (att.knowledgeId && att.mathDomain) {
        await this.mentalMath.recordAttempt(att.knowledgeId, att.mathDomain, att.isCorrect, att.responseTimeMs);
      }
    }

    // 2. Salvar erros para o banco de revisão
    for (const err of this.pendingErrors) {
      await this.storage.saveErrorForReview(err);
    }

    await this.storage.recordSessionComplete(sessionData);

    // Processamento de progressão de nível (Focal vs Geral)
    if (!isImpulsive && totalQuestions >= 10) {
      if (this.isFocalWorkout() && this.focalWorkoutConfig()) {
        const config = this.focalWorkoutConfig()!;
        if (config.unitIds.length === 1) {
          const unitId = config.unitIds[0];
          const sessionRecord = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            totalQuestions,
            correctCount,
            accuracyPercentage,
            averageResponseTimeMs: avgResponseTimeMs,
            level: this.progression.getLevel(unitId),
            source: 'FOCAL' as const
          };
          const promoResult = await this.progression.recordCompletedSession(unitId, sessionRecord);
          if (promoResult.levelUp) {
            const current = this.levelUpEvents();
            const unitMeta = this.progression.getUnitMeta(unitId);
            this.levelUpEvents.set([...current, { type: unitMeta.exerciseType, newLevel: promoResult.newLevel }]);
          }
        } else {
          // Se foi treino focal com múltiplas unidades, acumula blocos
          const promoEvents = await this.progression.recordGeneralWorkoutBlocks(this.sessionAttempts);
          if (promoEvents.length > 0) {
            const current = this.levelUpEvents();
            this.levelUpEvents.set([...current, ...promoEvents]);
          }
        }
      } else {
        // Treino Geral Diário:
        // 1. Ativa Super Escudo Diário em todas as 19 unidades (evita decaimento por inatividade)
        await this.progression.applySuperShield();

        // 2. Acumula blocos de 20 questões completadas para creditar sessões
        const promoEvents = await this.progression.recordGeneralWorkoutBlocks(this.sessionAttempts);
        if (promoEvents.length > 0) {
          const current = this.levelUpEvents();
          this.levelUpEvents.set([...current, ...promoEvents]);
        }
      }
    }

    // Atualizar Recordes Pessoais (Apenas para tentativas com engajamento legítimo)
    if (!isImpulsive) {
      for (const cat of categoriesTrained) {
        const catAttempts = this.sessionAttempts.filter(a => a.category === cat);
        const catCorrect = catAttempts.filter(a => a.isCorrect);
        const bestTime = catCorrect.length > 0 ? Math.min(...catCorrect.map(a => a.responseTimeMs)) : 0;
        const catAccuracy = Math.round((catCorrect.length / catAttempts.length) * 100);

        await this.storage.updatePersonalRecord({
          category: cat,
          bestAccuracy: catAccuracy,
          bestTimeMs: bestTime,
          maxDifficulty: Math.max(...catAttempts.map(a => a.difficulty)),
          bestStreakInSession: catCorrect.length,
          lastUpdated: Date.now()
        });
      }
    }

    // Diagnósticos da Sessão (O que foi bem & Onde focar para melhorar)
    const categoryNames: Record<CognitiveCategory, { name: string; icon: string }> = {
      CALCULATION: { name: 'Cálculo Mental', icon: '🔢' },
      MEMORY: { name: 'Memória de Trabalho', icon: '🧠' },
      ATTENTION: { name: 'Atenção & Foco', icon: '🎯' },
      SPEED: { name: 'Velocidade de Reação', icon: '⚡' },
      SPATIAL: { name: 'Memória Espacial', icon: '📐' },
      ORDERING: { name: 'Flexibilidade & Ordenação', icon: '🔄' },
      LOGIC: { name: 'Raciocínio Lógico', icon: '💡' }
    };

    const strengths: SessionDiagnosticItem[] = [];
    const improvements: SessionDiagnosticItem[] = [];

    for (const cat of categoriesTrained) {
      const attempts = this.sessionAttempts.filter(a => a.category === cat);
      const correct = attempts.filter(a => a.isCorrect).length;
      const acc = Math.round((correct / attempts.length) * 100);
      const avgMs = Math.round(attempts.reduce((sum, a) => sum + a.responseTimeMs, 0) / attempts.length);
      const avgSec = (avgMs / 1000).toFixed(1);
      const timeouts = attempts.filter(a => a.isTimeout).length;
      const meta = categoryNames[cat] || { name: cat, icon: '✨' };

      // Apenas é destaque se acurácia for realmente representativa (>= 70%)
      if (acc >= 70) {
        let detail = `${acc}% de acerto com média de ${avgSec}s por questão.`;
        if (acc === 100) {
          detail = `Precisão impecável (100% de acerto)! Respostas ágeis em ${avgSec}s.`;
        }
        strengths.push({
          category: cat,
          icon: meta.icon,
          title: meta.name,
          detail
        });
      } else {
        let detail = `${acc}% de precisão (${avgSec}s médios). `;
        if (timeouts > 0) {
          detail += `Houve ${timeouts} questão(ões) com tempo esgotado; tente responder com um primeiro palpite se estiver em dúvida.`;
        } else if (cat === 'CALCULATION') {
          detail += 'Pratique decompor números em dezenas inteiras para acelerar o raciocínio.';
        } else if (cat === 'MEMORY' || cat === 'SPATIAL') {
          detail += 'Tente criar padrões visuais ou agrupar os dígitos em blocos na mente.';
        } else if (cat === 'ATTENTION' || cat === 'SPEED') {
          detail += 'Nos testes de conflito (Stroop/Cores), faça uma pausa de 1 segundo antes de tocar.';
        } else {
          detail += 'Pratique para ganhar fluência na inversão e dedução de sequências lógicas.';
        }

        improvements.push({
          category: cat,
          icon: meta.icon,
          title: meta.name,
          detail
        });
      }
    }

    // Se o usuário gabaritou tudo (100%)
    if (improvements.length === 0) {
      improvements.push({
        category: 'ALL',
        icon: '🚀',
        title: 'Próximo Desafio',
        detail: 'Sua precisão foi máxima! Mantenha a consistência diária para avançar de nível rumo a Mestre.'
      });
    }

    // Aviso honesto se não houve destaques legítimos
    let honestNotice: string | undefined;
    if (strengths.length === 0) {
      honestNotice = isImpulsive
        ? 'Nenhum destaque registrado. O ritmo apressado causou erros consecutivos. Pratique responder com mais calma na próxima sessão para assimilar as estratégias.'
        : 'Nenhum destaque registrado nesta rodada. O nível dos exercícios estava elevado; foque nas oportunidades abaixo para evoluir.';
    }

    // Mensagem da Raposa Contextual
    let speechTitle = 'Treino Concluído!';
    let speechMessage = 'Você completou sua meta diária com consistência. Pode descansar por hoje.';

    if (isImpulsive) {
      speechTitle = 'Ritmo Muito Acelerado!';
      speechMessage = 'Você respondeu em ritmo impulsivo sem tempo hábil para processamento reflexivo. Respire fundo e foque na precisão antes da velocidade.';
    } else if (accuracyPercentage === 100) {
      speechTitle = 'Precisão Cirúrgica!';
      speechMessage = 'Você gabaritou todos os desafios! Seus circuitos neurais trabalharam em sincronia impecável.';
    } else if (accuracyPercentage >= 80) {
      speechTitle = 'Excelente Treino!';
      speechMessage = 'Ótimo aproveitamento e controle cognitivo. Seu cérebro foi desafiado no ponto certo.';
    } else if (accuracyPercentage >= 50) {
      speechTitle = 'Treino Concluído!';
      speechMessage = 'Bom esforço e persistência. Continue praticando para lapidar sua velocidade e precisão.';
    } else {
      speechTitle = 'Desafio Elevado!';
      speechMessage = 'Sessão exigente! O motor adaptativo identificou áreas de hesitação para reforçarmos nos próximos treinos.';
    }

    const accuracyClass: 'acc-high' | 'acc-mid' | 'acc-low' = 
      accuracyPercentage >= 80 ? 'acc-high' : (accuracyPercentage >= 50 ? 'acc-mid' : 'acc-low');

    const mins = Math.floor(totalDurationSeconds / 60);
    const secs = totalDurationSeconds % 60;
    const formattedDuration = mins > 0 
      ? (secs > 0 ? `${mins} min ${secs < 10 ? '0' : ''}${secs}s` : `${mins} min`)
      : `${secs}s`;

    this.sessionDiagnostics.set({
      formattedDuration,
      strengths,
      improvements,
      overallSummary: accuracyPercentage >= 80 
        ? 'Excelente sessão! Seus circuitos neurais trabalharam em alta sintonia.'
        : 'Sessão concluída. As respostas foram analisadas para calibrar seus próximos treinos.',
      speechTitle,
      speechMessage,
      accuracyClass,
      isImpulsive,
      honestNotice
    });

    if (accuracyPercentage >= 50 && !isImpulsive) {
      this.audio.playCelebration();
    }
    this.sessionResult.set(sessionData);
    this.state.set('SUMMARY');
    this.clearSavedSession();
  }

  public dismissTimeoutAndAdvance(): void {
    this.timeoutModalData.set(null);
    if (this.state() === 'EXERCISING') {
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
      this.presentNextQuestion();
      this.saveActiveSessionToStorage();
    } else if (this.state() === 'ERROR_REVIEW') {
      this.nextErrorReview();
      this.saveActiveSessionToStorage();
    }
  }

  public exitToHome(): void {
    this.clearSavedSession();
    this.sessionId = '';
    this.sessionAttempts = [];
    this.pendingErrors = [];
    this.questionsQueue = [];
    this.state.set('IDLE');
    this.currentQuestion.set(null);
    this.sessionResult.set(null);
    this.sessionDiagnostics.set(null);
    this.timeoutModalData.set(null);
    this.activeMathDomain.set(null);
    this.isFocalWorkout.set(false);
    this.focalWorkoutConfig.set(null);
  }

  // ==================== PERSISTÊNCIA & RECUPERAÇÃO APÓS REFRESH (Item 3) ====================
  public hasSavedActiveSession(): boolean {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (!raw) return false;
      const parsed: PersistedWorkoutSession = JSON.parse(raw);
      return !!parsed.sessionId && 
             (Date.now() - parsed.sessionStartTime < 4 * 60 * 60 * 1000) && 
             parsed.state !== 'SUMMARY' && 
             parsed.state !== 'IDLE';
    } catch {
      return false;
    }
  }

  public restoreSessionWithRegeneratedCurrent(): boolean {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (!raw) return false;
      const saved: PersistedWorkoutSession = JSON.parse(raw);

      this.sessionId = saved.sessionId;
      this.selectedMinutes.set(saved.selectedMinutes);
      this.activeMathDomain.set(saved.activeMathDomain);
      this.currentDifficulty = saved.currentDifficulty || 40;
      this.sessionStartTime = saved.sessionStartTime || Date.now();
      this.consecutiveErrors = saved.consecutiveErrors || 0;
      this.sessionAttempts = saved.sessionAttempts || [];
      this.pendingErrors = saved.pendingErrors || [];
      this.sessionExerciseTypes = saved.exerciseTypes || [];
      this.totalQuestionsCount.set(saved.totalQuestionsCount);
      this.currentQuestionIndex.set(saved.currentQuestionIndex);
      this.isFocalWorkout.set(!!saved.isFocalWorkout);
      this.focalWorkoutConfig.set(saved.focalWorkoutConfig ?? null);

      // Reconstruir fila de questões respeitando o tipo de treino:
      let queue: ExerciseQuestion[] = [];
      if (saved.isFocalWorkout && saved.focalWorkoutConfig) {
        const plan = this.progression.buildFocalWorkoutPlan(
          saved.focalWorkoutConfig.unitIds,
          saved.totalQuestionsCount,
          saved.focalWorkoutConfig.level
        );
        queue = plan.map(({ unitId, level }) => this.engine.generateQuestionForUnit(unitId, level));
      } else if (saved.activeMathDomain) {
        for (let i = 0; i < saved.totalQuestionsCount; i++) {
          queue.push(this.engine.generateMathDomainQuestion(saved.activeMathDomain, this.currentDifficulty));
        }
      } else if (saved.questionsQueue && saved.questionsQueue.length === saved.totalQuestionsCount) {
        queue = [...saved.questionsQueue];
      } else {
        const plan = this.progression.buildGeneralWorkoutPlan(40);
        queue = plan.map(({ unitId, level }) => this.engine.generateQuestionForUnit(unitId, level));
      }
      this.questionsQueue = queue;

      if (saved.state === 'WARMUP') {
        this.state.set('WARMUP');
      } else {
        this.state.set('EXERCISING');
        const currentQ = this.questionsQueue[this.currentQuestionIndex()];
        this.currentQuestion.set(currentQ);
        this.questionStartTime = Date.now();
        this.feedback.set(null);
        this.sessionProgressPercent.set(Math.round((this.currentQuestionIndex() / this.totalQuestionsCount()) * 100));
        this.naturalHintActive.set(this.consecutiveErrors >= 2);
      }

      this.saveActiveSessionToStorage();
      return true;
    } catch (err) {
      console.error('Erro ao restaurar sessão de treino:', err);
      this.clearSavedSession();
      return false;
    }
  }

  public clearSavedSession(): void {
    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {}
  }

  private saveActiveSessionToStorage(): void {
    try {
      if (this.state() === 'IDLE' || this.state() === 'SUMMARY') {
        this.clearSavedSession();
        return;
      }
      const data: PersistedWorkoutSession = {
        sessionId: this.sessionId,
        selectedMinutes: this.selectedMinutes(),
        activeMathDomain: this.activeMathDomain(),
        currentQuestionIndex: this.currentQuestionIndex(),
        totalQuestionsCount: this.totalQuestionsCount(),
        currentDifficulty: this.currentDifficulty,
        sessionStartTime: this.sessionStartTime,
        consecutiveErrors: this.consecutiveErrors,
        sessionAttempts: this.sessionAttempts,
        pendingErrors: this.pendingErrors,
        state: this.state(),
        exerciseTypes: this.sessionExerciseTypes,
        isFocalWorkout: this.isFocalWorkout(),
        focalWorkoutConfig: this.focalWorkoutConfig(),
        questionsQueue: this.questionsQueue
      };
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
}
