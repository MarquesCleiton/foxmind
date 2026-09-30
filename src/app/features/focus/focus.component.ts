import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import {
  ProgressionEngineService,
  ALL_FOCUS_UNITS,
  FOCUS_SESSIONS,
  FocusUnitMeta,
  PROGRESSION_CONFIG
} from '../../core/services/progression-engine.service';
import {
  FocusUnitId,
  FocusSession,
  TestProgressionState,
  FocalWorkoutConfig,
  ExerciseLevel
} from '../../core/models/cognitive.models';

export interface FocusSessionItem {
  session: FocusSession;
  averageLevel: number;
  levelTitle: string;
  stars: boolean[];
  bottleneckUnitId: FocusUnitId | null;
  decayCount: number;
  trainedCount: number;
  averageAccuracy: number;
  units: FocusUnitRowItem[];
}

export interface FocusUnitRowItem {
  meta: FocusUnitMeta;
  state: TestProgressionState;
  levelTitle: string;
  stars: boolean[];
  accuracy: number;
  sessionsCount: number;
  recentSessionsCount: number;
  targetQuestions: number;
  isBottleneck: boolean;
  isPeak: boolean;
  isDecayWarning: boolean;
  daysUntilDecay: number | null;
  shieldLabel: string;
  shieldClass: string;
}

export interface ModalTarget {
  type: 'unit' | 'session';
  meta?: FocusUnitMeta;
  session?: FocusSession;
  state?: TestProgressionState;
  level: number;
  levelTitle: string;
  sessionsCount: number;
  accuracy: number;
  questionCount: number;
  formatLabel: string;
}

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.css']
})
export class FocusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public workout = inject(WorkoutService);
  public progression = inject(ProgressionEngineService);

  public isLoading = signal<boolean>(true);
  public isStarting = signal<boolean>(false);
  public modalTarget = signal<ModalTarget | null>(null);

  // Controle de expansão das sessões (minimizadas por padrão)
  public expandedSessions = signal<Record<string, boolean>>({});

  // Configuração global de progressão (acessível no template)
  public readonly progressionConfig = PROGRESSION_CONFIG;

  public overallProgression = computed(() => this.progression.getOverallProgression());

  public sessions = computed<FocusSessionItem[]>(() => {
    const overall = this.overallProgression();
    // Exclui 'geral' para exibir as 5 categorias cognitivas focais
    const core = FOCUS_SESSIONS.filter(s => s.id !== 'geral');

    return core.map(session => {
      const avgLevel = this.progression.getSessionLevel(session);
      const stars = [1, 2, 3, 4, 5].map(i => i <= Math.floor(avgLevel));
      const bottleneck = this.progression.getSessionBottleneck(session);
      const decayCount = session.unitIds.filter(uid => {
        const s = this.progression.getState(uid);
        return this.progression.isInDecayWarning(s);
      }).length;

      const units: FocusUnitRowItem[] = session.unitIds.map(uid => {
        const meta = ALL_FOCUS_UNITS.find(u => u.unitId === uid)!;
        const state = this.progression.getState(uid);
        const uStars = [1, 2, 3, 4, 5].map(i => i <= state.currentLevel);
        const days = this.progression.daysUntilDecay(state);
        const isDecay = this.progression.isInDecayWarning(state);
        const isBottleneck = overall.bottleneckUnitId !== null && uid === overall.bottleneckUnitId;
        const isPeak = overall.peakUnitId !== null && uid === overall.peakUnitId;

        let shieldLabel = 'Nível Base';
        let shieldClass = 'shield-base';
        if (state.currentLevel > 1) {
          if (days === null) {
            shieldLabel = 'Protegido';
            shieldClass = 'shield-ok';
          } else if (days <= 0) {
            shieldLabel = '⚠️ Decaimento!';
            shieldClass = 'shield-danger';
          } else if (isDecay) {
            shieldLabel = `⚠️ ${days}d p/ expirar`;
            shieldClass = 'shield-warning';
          } else {
            shieldLabel = `🛡️ ${days}d escudo`;
            shieldClass = 'shield-ok';
          }
        }

        const sessionsCount = state.totalSessionsAtLevel || 0;
        const recentSessionsCount = state.recentSessions?.length || 0;
        const targetQuestions = this.progression.questionsForUnit(uid, state.currentLevel);

        return {
          meta,
          state,
          levelTitle: this.progression.getLevelFullLabel(state.currentLevel),
          stars: uStars,
          accuracy: state.accuracyPercentage,
          sessionsCount,
          recentSessionsCount,
          targetQuestions,
          isBottleneck,
          isPeak,
          isDecayWarning: isDecay,
          daysUntilDecay: days,
          shieldLabel,
          shieldClass
        };
      });

      const trained = units.filter(u => u.state.lastTrainedAt > 0 || u.state.totalSessionsAtLevel > 0 || u.state.totalAttemptsAtLevel > 0);
      const trainedCount = trained.length;
      const averageAccuracy = trainedCount > 0
        ? Math.round(trained.reduce((acc, u) => acc + u.accuracy, 0) / trainedCount)
        : 0;

      return {
        session,
        averageLevel: avgLevel,
        levelTitle: this.progression.getLevelFullLabel(avgLevel),
        stars,
        bottleneckUnitId: bottleneck?.unitId ?? null,
        decayCount,
        trainedCount,
        averageAccuracy,
        units
      };
    });
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.progression.init();
    } catch (e) {
      console.error('Erro na inicialização de Foco:', e);
    } finally {
      this.isLoading.set(false);
    }

    // Deep-link: ?unit=math-addition ou ?session=calculo
    const unitParam = this.route.snapshot.queryParamMap.get('unit') as FocusUnitId | null;
    const sessionParam = this.route.snapshot.queryParamMap.get('session');

    if (unitParam) {
      const meta = ALL_FOCUS_UNITS.find(u => u.unitId === unitParam);
      if (meta) {
        this.expandedSessions.update(curr => ({ ...curr, [meta.sessionId]: true }));
        this.openUnitModal(meta);
      }
    } else if (sessionParam) {
      const session = FOCUS_SESSIONS.find(s => s.id === sessionParam);
      if (session) {
        this.expandedSessions.update(curr => ({ ...curr, [session.id]: true }));
        this.openSessionModal(session);
      }
    }
  }

  // ── Expansão / Colapso de Sessão ───────────────────────────────────────────
  toggleSession(sessionId: string): void {
    this.expandedSessions.update(curr => ({
      ...curr,
      [sessionId]: !curr[sessionId]
    }));
  }

  isSessionExpanded(sessionId: string): boolean {
    return this.expandedSessions()[sessionId] ?? false;
  }

  // ── Modal de Início do Desafio ─────────────────────────────────────────────
  openUnitModal(meta: FocusUnitMeta, event?: Event): void {
    if (event) event.stopPropagation();
    const state = this.progression.getState(meta.unitId);
    const questionCount = this.progression.questionsForUnit(meta.unitId, state.currentLevel);
    const formatLabel = this.progression.getChallengeFormatLabel(meta.unitId, state.currentLevel);

    this.modalTarget.set({
      type: 'unit',
      meta,
      state,
      level: state.currentLevel,
      levelTitle: this.progression.getLevelFullLabel(state.currentLevel),
      sessionsCount: state.totalSessionsAtLevel || 0,
      accuracy: state.accuracyPercentage,
      questionCount,
      formatLabel
    });
  }

  openSessionModal(session: FocusSession, event?: Event): void {
    if (event) event.stopPropagation();
    const avgLevel = this.progression.getSessionLevel(session);
    const states = session.unitIds.map(uid => this.progression.getState(uid));
    const totalSessions = Math.round(states.reduce((acc, s) => acc + (s.totalSessionsAtLevel || 0), 0) / states.length);
    const avgAcc = states.length > 0
      ? Math.round(states.reduce((acc, s) => acc + s.accuracyPercentage, 0) / states.length)
      : 0;

    this.modalTarget.set({
      type: 'session',
      session,
      level: Math.round(avgLevel),
      levelTitle: this.progression.getLevelFullLabel(avgLevel),
      sessionsCount: totalSessions,
      accuracy: avgAcc,
      questionCount: 20,
      formatLabel: `Treino de Domínio: 20 questões combinadas entre as ${session.unitIds.length} habilidades.`
    });
  }

  closeModal(): void {
    this.modalTarget.set(null);
  }

  async startModalWorkout(): Promise<void> {
    const target = this.modalTarget();
    if (!target || this.isStarting()) return;

    this.isStarting.set(true);

    let config: FocalWorkoutConfig;
    if (target.type === 'unit' && target.meta) {
      config = {
        unitIds: [target.meta.unitId],
        durationMinutes: 5,
        questionCount: target.questionCount
      };
    } else if (target.type === 'session' && target.session) {
      config = {
        unitIds: target.session.unitIds,
        sessionId: target.session.id,
        durationMinutes: 5,
        questionCount: target.questionCount || 20
      };
    } else {
      this.isStarting.set(false);
      return;
    }

    try {
      await this.workout.startFocalWorkout(config);
      this.closeModal();
      this.router.navigate(['/workout']);
    } finally {
      this.isStarting.set(false);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
