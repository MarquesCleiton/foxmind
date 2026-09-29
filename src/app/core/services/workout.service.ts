import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { AudioHapticService } from './audio-haptic.service';
import { AdaptiveEngineService } from './adaptive-engine.service';
import { 
  CognitiveCategory, 
  DailyWorkoutSession, 
  ExerciseAttempt, 
  ExerciseQuestion, 
  ExerciseType, 
  PendingReviewError 
} from '../models/cognitive.models';

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
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private storage = inject(StorageService);
  private audio = inject(AudioHapticService);
  private engine = inject(AdaptiveEngineService);

  // Estados Reativos do Treino
  public state = signal<WorkoutState>('IDLE');
  public currentQuestion = signal<ExerciseQuestion | null>(null);
  public currentQuestionIndex = signal<number>(0);
  public totalQuestionsCount = signal<number>(12);
  public sessionProgressPercent = signal<number>(0);
  
  // Feedback imediato sutil (sem interromper)
  public feedback = signal<{ isCorrect: boolean; text: string } | null>(null);
  
  // Resumo final
  public sessionResult = signal<DailyWorkoutSession | null>(null);
  public sessionDiagnostics = signal<SessionDiagnostics | null>(null);
  public selectedMinutes = signal<number>(8);
  public naturalHintActive = signal<boolean>(false);
  
  // Sessão em andamento
  private sessionId = '';
  private questionsQueue: ExerciseQuestion[] = [];
  private sessionAttempts: ExerciseAttempt[] = [];
  private currentDifficulty = 40;
  private sessionStartTime = 0;
  private questionStartTime = 0;
  private pendingErrors: PendingReviewError[] = [];
  private reviewingErrorIndex = 0;
  private consecutiveErrors = 0;

  // Inicia o Treino Diário
  public startDailyWorkout(targetMinutes?: number): void {
    const mins = targetMinutes ?? this.storage.profileSignal().targetMinutes ?? 8;
    this.selectedMinutes.set(mins);
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

    // Montar fila de exercícios da sessão diária proporcional ao tempo
    this.questionsQueue = this.buildSessionQueue(mins);
    this.totalQuestionsCount.set(this.questionsQueue.length);
    this.currentQuestionIndex.set(0);
    this.sessionProgressPercent.set(0);

    // Iniciar aquecimento sutil de 3 segundos
    this.state.set('WARMUP');
  }

  // Transição do Aquecimento para o primeiro Exercício
  public endWarmup(): void {
    this.state.set('EXERCISING');
    this.presentNextQuestion();
  }

  private buildSessionQueue(targetMinutes: number): ExerciseQuestion[] {
    const queue: ExerciseQuestion[] = [];
    // 3 min = 6 questões | 8 min = 12 questões | 15 min = 20 questões
    const count = targetMinutes <= 3 ? 6 : (targetMinutes <= 8 ? 12 : 20);

    const exerciseDistribution: ExerciseType[] = [
      'MENTAL_MATH',
      'WORD_PROBLEM',
      'NUMBER_SEQUENCE',
      'STROOP_TEST',
      'SPATIAL_GRID',
      'LOGICAL_PATTERN',
      'ATTENTION_TARGET',
      'NUMBER_ORDERING',
      'GENIUS_COLORS'
    ];

    for (let i = 0; i < count; i++) {
      const type = exerciseDistribution[i % exerciseDistribution.length];
      queue.push(this.engine.generateQuestion(type, this.currentDifficulty));
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

    // Registrar tentativa no IndexedDB
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
      isTimeout
    };

    this.sessionAttempts.push(attempt);
    await this.storage.saveAttempt(attempt);

    // Se errou e ainda estamos no treino regular, guarda para a revisão final
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
      await this.storage.saveErrorForReview(errItem);
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

    // Pequeno intervalo de 350ms para absorção e próximo exercício
    setTimeout(() => {
      if (this.state() === 'EXERCISING') {
        this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
        this.presentNextQuestion();
      } else if (this.state() === 'ERROR_REVIEW') {
        this.nextErrorReview();
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

    // Cálculo do XP: Base (50) + Acertos (10 cada) + Bônus de acurácia
    const xpEarned = Math.round(50 + (correctCount * 10) + (accuracyPercentage > 80 ? 30 : 10));

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
      createdAt: Date.now()
    };

    await this.storage.recordSessionComplete(sessionData);

    // Atualizar Recordes Pessoais
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

      if (acc >= 75) {
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
        let detail = `${acc}% de precisão. `;
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
        detail: 'Sua precisão foi máxima! No próximo treino, experimente aumentar o tempo para 15 minutos para exercitar a resistência sob maior volume.'
      });
    }

    // Se não houve nenhuma com 75%+
    if (strengths.length === 0 && totalQuestions > 0) {
      const best = [...categoriesTrained].sort((a, b) => {
        const accA = (this.sessionAttempts.filter(x => x.category === a && x.isCorrect).length / this.sessionAttempts.filter(x => x.category === a).length);
        const accB = (this.sessionAttempts.filter(x => x.category === b && x.isCorrect).length / this.sessionAttempts.filter(x => x.category === b).length);
        return accB - accA;
      })[0];
      const meta = categoryNames[best] || { name: best, icon: '✨' };
      strengths.push({
        category: best,
        icon: meta.icon,
        title: meta.name,
        detail: 'Habilidade onde você demonstrou maior persistência e empenho na sessão.'
      });
    }

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
        : 'Bom treino! O motor adaptativo recalibrou os desafios para fortalecer seus pontos de hesitação.'
    });

    this.audio.playCelebration();
    this.sessionResult.set(sessionData);
    this.state.set('SUMMARY');
  }

  public exitToHome(): void {
    this.state.set('IDLE');
    this.currentQuestion.set(null);
    this.sessionResult.set(null);
    this.sessionDiagnostics.set(null);
  }
}
