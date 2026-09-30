import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { WorkoutService } from '../../core/services/workout.service';
import {
  ProgressionEngineService,
  FOCUS_SESSIONS,
  ALL_FOCUS_UNITS,
  FocusUnitMeta
} from '../../core/services/progression-engine.service';
import {
  DailyWorkoutSession,
  PersonalRecord,
  FocusUnitId,
  FocusSession,
  TestProgressionState,
  PlayerOverallProgression,
  FocalWorkoutConfig
} from '../../core/models/cognitive.models';

export interface DiagnosticItem {
  meta: FocusUnitMeta;
  state: TestProgressionState;
  levelTitle: string;
  accuracy: number;
  attemptsCount: number;
  gapPercentage: number;
  diagnosticTitle: string;
  diagnosticDesc: string;
  recommendation: string;
  tagClass: string;
  tagLabel: string;
}

export interface SubsegmentItem {
  meta: FocusUnitMeta;
  state: TestProgressionState;
  levelTitle: string;
  stars: boolean[];
  isTrained: boolean;
  accuracy: number;
  attemptsCount: number;
  progressPercent: number; // 0 a 100
  gapToGoal: number;
  daysUntilDecay: number | null;
  isDecayWarning: boolean;
  isBottleneck: boolean;
  isPeak: boolean;
  diagnosticMessage: string;
  statusText: string;
  statusClass: string;
  shieldLabel: string;
  shieldClass: string;
}

export interface SegmentGroup {
  session: FocusSession;
  averageLevel: number;
  levelTitle: string;
  stars: boolean[];
  totalAttempts: number;
  averageAccuracy: number;
  promotedCount: number;
  totalUnits: number;
  decayCount: number;
  domainStatus: 'REQUER_ATENCAO' | 'AVANCADO' | 'EM_EVOLUCAO' | 'INICIAL';
  domainStatusLabel: string;
  domainStatusClass: string;
  subsegments: SubsegmentItem[];
}

export interface ProgressModalTarget {
  type: 'unit' | 'session';
  meta?: FocusUnitMeta;
  session?: FocusSession;
  state?: TestProgressionState;
  level: number;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {
  public storage = inject(StorageService);
  public workout = inject(WorkoutService);
  public progression = inject(ProgressionEngineService);
  private router = inject(Router);

  public isLoading = signal<boolean>(true);
  public isStarting = signal<boolean>(false);
  public selectedSegmentFilter = signal<string>('all'); // 'all' | 'calculo' | 'memoria' | 'atencao' | 'logica'
  public recentSessions = signal<DailyWorkoutSession[]>([]);
  public personalRecords = signal<PersonalRecord[]>([]);

  // Modal de Duração Rápida
  public modalTarget = signal<ProgressModalTarget | null>(null);
  public selectedDuration = signal<2 | 5 | 10>(5);

  public readonly DURATION_OPTIONS: Array<{ minutes: 2 | 5 | 10; label: string; sublabel: string; questions: number; isRecommended?: boolean }> = [
    { minutes: 2,  label: '2 min',  sublabel: '6 questões • Aquecimento rápido',         questions: 6  },
    { minutes: 5,  label: '5 min',  sublabel: '12 questões • Treino padrão de foco',     questions: 12, isRecommended: true },
    { minutes: 10, label: '10 min', sublabel: '20 questões • Janela de promoção (N1→N5)', questions: 20 }
  ];

  // Controle de expansão de cada sessão (minimizadas por padrão)
  public expandedSessions = signal<Record<string, boolean>>({});

  // Sessões centrais (exclui o 'geral' para segmentação visual clara)
  public readonly coreSessions = FOCUS_SESSIONS.filter(s => s.id !== 'geral');

  // Progressão Geral do Jogador (Níveis 1.0 a 5.0)
  public overall = computed<PlayerOverallProgression>(() => {
    return this.progression.getOverallProgression();
  });

  // Título elegante do Nível Geral (Ex: "Nível 1 • Base")
  public overallLevelFullLabel = computed<string>(() => {
    return this.progression.getLevelFullLabel(this.overall().overallLevel);
  });

  // Verifica se o usuário já realizou qualquer teste no sistema
  public hasTrainedAny = computed<boolean>(() => {
    const states = this.progression.getAllStates();
    return states.some(s => s.lastTrainedAt > 0 || s.totalAttemptsAtLevel > 0);
  });

  // Acurácia Média Global
  public overallAccuracy = computed<number>(() => {
    const states = this.progression.getAllStates().filter(s => s.lastTrainedAt > 0 || s.totalAttemptsAtLevel > 0);
    if (states.length === 0) return 0;
    return Math.round(states.reduce((acc, s) => acc + s.accuracyPercentage, 0) / states.length);
  });

  // Total de questões respondidas somando todas as unidades
  public totalQuestionsAnswered = computed<number>(() => {
    const states = this.progression.getAllStates();
    return states.reduce((sum, s) => sum + (s.totalAttemptsAtLevel || 0), 0);
  });

  // Quantidade de unidades em nível 2 ou superior
  public promotedUnitsCount = computed<number>(() => {
    return this.progression.getAllStates().filter(s => s.currentLevel >= 2).length;
  });

  // Quantidade de unidades no Nível 5 (Mestre)
  public maxLevelUnitsCount = computed<number>(() => {
    return this.progression.getAllStates().filter(s => s.currentLevel === 5).length;
  });

  // ── PLANO DE MELHORIA: GARGALOS CRÍTICOS (O que melhorar agora) ───────────
  public criticalBottlenecks = computed<DiagnosticItem[]>(() => {
    if (!this.hasTrainedAny()) return [];
    const overall = this.overall();
    const states = this.progression.getAllStates();
    const trained = states.filter(s => s.lastTrainedAt > 0 || s.totalAttemptsAtLevel > 0);

    // Unidades que são o gargalo geral ou têm acurácia < 70%
    const items = trained.filter(s =>
      s.unitId === overall.bottleneckUnitId || s.accuracyPercentage < 70
    );

    return items
      .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
      .map(s => {
        const meta = ALL_FOCUS_UNITS.find(u => u.unitId === s.unitId)!;
        const levelTitle = this.progression.getLevelFullLabel(s.currentLevel);
        const gap = Math.max(0, 95 - s.accuracyPercentage);
        return {
          meta,
          state: s,
          levelTitle,
          accuracy: s.accuracyPercentage,
          attemptsCount: s.recentAttempts.length,
          gapPercentage: gap,
          diagnosticTitle: `${meta.name} (${s.accuracyPercentage}% de acertos)`,
          diagnosticDesc: `Sua precisão atual está ${gap}% abaixo da meta de 95% para avançar para o Nível ${s.currentLevel + 1}.`,
          recommendation: `Pratique um treino focado em ${meta.name.toLowerCase()} para recuperar precisão e destravar seu Nível Geral.`,
          tagClass: 'tag-danger',
          tagLabel: '🚨 Gargalo a Superar'
        };
      });
  });

  // ── PLANO DE MELHORIA: PRÓXIMAS PROMOÇÕES (Quase subindo de nível) ─────────
  public nearPromotion = computed<DiagnosticItem[]>(() => {
    if (!this.hasTrainedAny()) return [];
    const states = this.progression.getAllStates();
    const bottleneckId = this.overall().bottleneckUnitId;

    // Habilidades em 75% a 94% (não sendo gargalo e ainda não no nível 5)
    const items = states.filter(s =>
      (s.lastTrainedAt > 0 || s.totalAttemptsAtLevel > 0) &&
      s.unitId !== bottleneckId &&
      s.currentLevel < 5 &&
      s.accuracyPercentage >= 75 &&
      s.accuracyPercentage < 95
    );

    return items
      .sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)
      .map(s => {
        const meta = ALL_FOCUS_UNITS.find(u => u.unitId === s.unitId)!;
        const levelTitle = this.progression.getLevelFullLabel(s.currentLevel);
        const gap = Math.max(0, 95 - s.accuracyPercentage);
        return {
          meta,
          state: s,
          levelTitle,
          accuracy: s.accuracyPercentage,
          attemptsCount: s.recentAttempts.length,
          gapPercentage: gap,
          diagnosticTitle: `${meta.name} (${s.accuracyPercentage}% de precisão)`,
          diagnosticDesc: `Você está a apenas ${gap}% de atingir a meta de 95% e conquistar a promoção para o Nível ${s.currentLevel + 1}!`,
          recommendation: `Faça uma sessão de 10 min (janela oficial de 20 questões) para sacramentar sua promoção.`,
          tagClass: 'tag-success',
          tagLabel: '📈 Perto da Promoção'
        };
      });
  });

  // ── MAIOR DOMÍNIO (PICO REAL - NUNCA O MESMO QUE O GARGALO) ───────────────
  public topStrengths = computed<DiagnosticItem[]>(() => {
    if (!this.hasTrainedAny()) return [];
    const peakId = this.overall().peakUnitId;
    const bottleneckId = this.overall().bottleneckUnitId;
    if (!peakId || peakId === bottleneckId) return [];

    const state = this.progression.getState(peakId);
    if (state.currentLevel === 1 && state.accuracyPercentage < 70) return [];

    const meta = ALL_FOCUS_UNITS.find(u => u.unitId === peakId);
    if (!meta) return [];

    return [{
      meta,
      state,
      levelTitle: this.progression.getLevelFullLabel(state.currentLevel),
      accuracy: state.accuracyPercentage,
      attemptsCount: state.recentAttempts.length,
      gapPercentage: 0,
      diagnosticTitle: `${meta.name} (${state.accuracyPercentage}% de precisão)`,
      diagnosticDesc: `Seu maior domínio cognitivo atual. Desempenho exemplar neste segmento!`,
      recommendation: `Treine periodicamente para manter seu escudo ativo contra o decaimento.`,
      tagClass: 'tag-peak',
      tagLabel: '🌟 Maior Destaque'
    }];
  });

  // ── RELATÓRIO DETALHADO POR ÁREA COGNITIVA ────────────────────────────────
  public segments = computed<SegmentGroup[]>(() => {
    const filter = this.selectedSegmentFilter();
    const targetSessions = filter === 'all'
      ? this.coreSessions
      : this.coreSessions.filter(s => s.id === filter);

    const overall = this.overall();

    return targetSessions.map(session => {
      const avgLevel = this.progression.getSessionLevel(session);
      const levelTitle = this.progression.getLevelFullLabel(avgLevel);
      const stars = [1, 2, 3, 4, 5].map(lvl => lvl <= Math.floor(avgLevel));

      const subsegments: SubsegmentItem[] = session.unitIds.map(uid => {
        const meta = ALL_FOCUS_UNITS.find(u => u.unitId === uid)!;
        const state = this.progression.getState(uid);
        const isTrained = state.lastTrainedAt > 0 || state.totalAttemptsAtLevel > 0;
        const attemptsCount = state.recentAttempts.length;
        const accuracy = state.accuracyPercentage;
        const daysUntilDecay = this.progression.daysUntilDecay(state);
        const isDecayWarning = this.progression.isInDecayWarning(state);
        const isBottleneck = overall.bottleneckUnitId !== null && uid === overall.bottleneckUnitId && isTrained;
        const isPeak = overall.peakUnitId !== null && uid === overall.peakUnitId && !isBottleneck && isTrained;
        const levelTitle = this.progression.getLevelFullLabel(state.currentLevel);

        // Progresso rumo a 95% para promoção
        const progressPercent = state.currentLevel === 5 ? 100 : Math.min(100, Math.round((accuracy / 95) * 100));
        const gapToGoal = Math.max(0, 95 - accuracy);

        // Mensagem diagnóstica precisa
        let diagnosticMessage = '';
        let statusText = 'Não iniciado';
        let statusClass = 'status-untrained';

        if (state.currentLevel === 5) {
          statusText = 'Mestre ⭐';
          statusClass = 'status-master';
          diagnosticMessage = '⭐ Nível Máximo atingido. Mantenha o escudo ativo.';
        } else if (!isTrained) {
          statusText = 'Início • Base';
          statusClass = 'status-untrained';
          diagnosticMessage = '⚪ Comece no Nível 1 básico para traçar sua evolução.';
        } else if (attemptsCount >= 20 && accuracy >= 95) {
          statusText = `🚀 Apto ao Nível ${state.currentLevel + 1}`;
          statusClass = 'status-promote';
          diagnosticMessage = `✨ Meta de 95% atingida! Promoção garantida ao Nível ${state.currentLevel + 1}.`;
        } else if (accuracy >= 95) {
          statusText = `${attemptsCount}/20 com 95%+`;
          statusClass = 'status-high';
          diagnosticMessage = `🎯 Precisão perfeita (${accuracy}%). Responda ${20 - attemptsCount} questões p/ promover.`;
        } else if (attemptsCount >= 10 && accuracy < 50) {
          statusText = '⚠️ Risco de queda';
          statusClass = 'status-danger';
          diagnosticMessage = `⚠️ Precisão abaixo de 50%. Risco de decair de nível!`;
        } else if (accuracy < 70) {
          statusText = `${accuracy}% acerto`;
          statusClass = 'status-danger';
          diagnosticMessage = `🔴 Abaixo da meta. Faltam ${gapToGoal}% de acertos para o Nível ${state.currentLevel + 1}.`;
        } else {
          statusText = `${accuracy}% acerto`;
          statusClass = 'status-normal';
          diagnosticMessage = `🟡 Em consolidação. Faltam ${gapToGoal}% de acertos para o Nível ${state.currentLevel + 1}.`;
        }

        // Informação do Escudo de Inatividade
        let shieldLabel = '🛡️ Nível Base';
        let shieldClass = 'shield-safe';

        if (state.currentLevel > 1) {
          if (daysUntilDecay === null) {
            shieldLabel = '🛡️ Protegido';
            shieldClass = 'shield-safe';
          } else if (daysUntilDecay <= 2) {
            shieldLabel = `⚠️ ${daysUntilDecay}d p/ expirar`;
            shieldClass = 'shield-urgent';
          } else if (isDecayWarning) {
            shieldLabel = `⏳ ${daysUntilDecay}d restantes`;
            shieldClass = 'shield-warning';
          } else {
            shieldLabel = `🛡️ ${daysUntilDecay}d de escudo`;
            shieldClass = 'shield-safe';
          }
        }

        const unitStars = [1, 2, 3, 4, 5].map(lvl => lvl <= state.currentLevel);

        return {
          meta,
          state,
          levelTitle,
          stars: unitStars,
          isTrained,
          accuracy,
          attemptsCount,
          progressPercent,
          gapToGoal,
          daysUntilDecay,
          isDecayWarning,
          isBottleneck,
          isPeak,
          diagnosticMessage,
          statusText,
          statusClass,
          shieldLabel,
          shieldClass
        };
      });

      const trainedSubs = subsegments.filter(s => s.isTrained);
      const totalAttempts = subsegments.reduce((acc, s) => acc + s.state.totalAttemptsAtLevel, 0);
      const averageAccuracy = trainedSubs.length > 0
        ? Math.round(trainedSubs.reduce((acc, s) => acc + s.accuracy, 0) / trainedSubs.length)
        : 0;
      const decayCount = subsegments.filter(s => s.isDecayWarning).length;
      const promotedCount = subsegments.filter(s => s.state.currentLevel >= 2).length;

      // Status do Domínio Cognitivo
      let domainStatus: 'REQUER_ATENCAO' | 'AVANCADO' | 'EM_EVOLUCAO' | 'INICIAL';
      let domainStatusLabel: string;
      let domainStatusClass: string;

      if (subsegments.some(s => s.isBottleneck || (s.isTrained && s.accuracy < 70))) {
        domainStatus = 'REQUER_ATENCAO';
        domainStatusLabel = '🚨 Requer Atenção';
        domainStatusClass = 'status-domain-alert';
      } else if (avgLevel >= 3) {
        domainStatus = 'AVANCADO';
        domainStatusLabel = '⚡ Avançado';
        domainStatusClass = 'status-domain-advanced';
      } else if (trainedSubs.length > 0) {
        domainStatus = 'EM_EVOLUCAO';
        domainStatusLabel = '📈 Em Evolução';
        domainStatusClass = 'status-domain-progress';
      } else {
        domainStatus = 'INICIAL';
        domainStatusLabel = '🌱 Nível 1 Base';
        domainStatusClass = 'status-domain-base';
      }

      return {
        session,
        averageLevel: avgLevel,
        levelTitle,
        stars,
        totalAttempts,
        averageAccuracy,
        promotedCount,
        totalUnits: subsegments.length,
        decayCount,
        domainStatus,
        domainStatusLabel,
        domainStatusClass,
        subsegments
      };
    });
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.progression.init();
      const sessions = await this.storage.getRecentSessions(7);
      this.recentSessions.set(sessions);
      const records = await this.storage.getRecords();
      this.personalRecords.set(records);
    } catch (e) {
      console.error('Erro na inicialização de Progresso:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  public setFilter(filterId: string): void {
    this.selectedSegmentFilter.set(filterId);
  }

  public toggleSession(sessionId: string): void {
    this.expandedSessions.update(curr => ({
      ...curr,
      [sessionId]: !curr[sessionId]
    }));
  }

  public isSessionExpanded(sessionId: string): boolean {
    return this.expandedSessions()[sessionId] ?? false;
  }

  // ── Modal de Treino Rápido ────────────────────────────────────────────────
  public openUnitModal(meta: FocusUnitMeta, event?: Event): void {
    if (event) event.stopPropagation();
    const state = this.progression.getState(meta.unitId);
    this.modalTarget.set({
      type: 'unit',
      meta,
      state,
      level: state.currentLevel
    });
  }

  public openSessionModal(session: FocusSession, event?: Event): void {
    if (event) event.stopPropagation();
    const avgLevel = this.progression.getSessionLevel(session);
    this.modalTarget.set({
      type: 'session',
      session,
      level: Math.round(avgLevel)
    });
  }

  public closeModal(): void {
    this.modalTarget.set(null);
  }

  public selectDuration(minutes: 2 | 5 | 10): void {
    this.selectedDuration.set(minutes);
  }

  public async startModalWorkout(): Promise<void> {
    const target = this.modalTarget();
    if (!target || this.isStarting()) return;

    this.isStarting.set(true);

    let config: FocalWorkoutConfig;
    if (target.type === 'unit' && target.meta) {
      config = {
        unitIds: [target.meta.unitId],
        durationMinutes: this.selectedDuration()
      };
    } else if (target.type === 'session' && target.session) {
      config = {
        unitIds: target.session.unitIds,
        sessionId: target.session.id,
        durationMinutes: this.selectedDuration()
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

  public trainUnit(unitId: FocusUnitId): void {
    const meta = ALL_FOCUS_UNITS.find(u => u.unitId === unitId);
    if (meta) {
      this.openUnitModal(meta);
    } else {
      this.router.navigate(['/focus'], { queryParams: { unit: unitId } });
    }
  }

  public trainSession(sessionId: string): void {
    const session = FOCUS_SESSIONS.find(s => s.id === sessionId);
    if (session) {
      this.openSessionModal(session);
    } else {
      this.router.navigate(['/focus'], { queryParams: { session: sessionId } });
    }
  }

  public startWorkout(): void {
    this.router.navigate(['/focus']);
  }

  public formatDuration(totalSeconds: number | undefined): string {
    if (!totalSeconds) return '0s';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs < 10 ? '0' : ''}${secs}s`;
  }

  public getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'CALCULATION': return '🔢 Cálculo';
      case 'MEMORY': return '🧠 Memória';
      case 'ATTENTION': return '🎯 Atenção';
      case 'SPEED': return '⚡ Velocidade';
      case 'SPATIAL': return '📐 Espacial';
      case 'ORDERING': return '🔄 Flexibilidade';
      default: return cat;
    }
  }
}
