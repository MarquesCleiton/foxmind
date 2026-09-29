import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { MentalMathService } from '../../core/services/mental-math.service';
import { DailyWorkoutSession, PersonalRecord } from '../../core/models/cognitive.models';
import { DomainMasterySummary } from '../../core/models/mental-math.models';

export interface EvaluatedSkill {
  key: string;
  name: string;
  icon: string;
  score: number;
  barClass: string;
  tier: 'Mestre' | 'Avançado' | 'Em Evolução' | 'Iniciante';
  tierClass: string;
  trend: 'UP' | 'STABLE' | 'DOWN';
  trendDelta: number;
  description: string;
  recommendation: string;
  tag?: 'Gargalo' | 'Forte' | 'Equilibrado';
}

export interface CognitiveDiagnosis {
  overallScore: number;
  overallTier: string;
  overallTierClass: string;
  calibrationStatus: 'CALIBRATING' | 'CONSOLIDATED';
  calibrationCount: number;
  calibrationTarget: number;
  momentumText: string;
  strongestSkill: EvaluatedSkill;
  weakestSkill: EvaluatedSkill;
  dailyAction: string;
  foxAdvice: string;
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
  private mentalMath = inject(MentalMathService);
  public recentSessions = signal<DailyWorkoutSession[]>([]);
  public personalRecords = signal<PersonalRecord[]>([]);
  public domainSummaries = signal<DomainMasterySummary[]>([]);
  public expandedSkillKey = signal<string | null>(null);

  // Avaliação rica e estruturada de cada habilidade
  public evaluatedSkills = computed<EvaluatedSkill[]>(() => {
    const scores = this.storage.profileSignal().cognitiveScores;
    const sessions = this.recentSessions();

    const defs = [
      {
        key: 'calculation',
        categoryKey: 'CALCULATION',
        name: 'Cálculo Mental',
        icon: '🔢',
        score: scores.calculation ?? 40,
        barClass: 'bar-calc',
        description: 'Operações mentais, porcentagens e problemas numéricos.',
        recommendation: 'Decomponha números em dezenas inteiras para acelerar cálculos complexos.'
      },
      {
        key: 'memory',
        categoryKey: 'MEMORY',
        name: 'Memória de Trabalho',
        icon: '🧠',
        score: scores.memory ?? 40,
        barClass: 'bar-mem',
        description: 'Retenção imediata de sequências de dígitos (direto/inverso).',
        recommendation: 'Use a técnica de agrupamento (chunking) em blocos de 2 a 3 dígitos.'
      },
      {
        key: 'attention',
        categoryKey: 'ATTENTION',
        name: 'Atenção & Inibição',
        icon: '🎯',
        score: scores.attention ?? 40,
        barClass: 'bar-att',
        description: 'Foco seletivo e controle inibitório sobre distrações (Stroop).',
        recommendation: 'Faça uma micro-pausa de 1s antes de responder em estímulos com conflito de cores.'
      },
      {
        key: 'speed',
        categoryKey: 'SPEED',
        name: 'Velocidade de Reação',
        icon: '⚡',
        score: scores.speed ?? 40,
        barClass: 'bar-spd',
        description: 'Tempo de reação e tomada de decisão motora sob pressão de tempo.',
        recommendation: 'Mantenha o foco visual relaxado no centro da tela para registrar os estímulos mais rápido.'
      },
      {
        key: 'spatial',
        categoryKey: 'SPATIAL',
        name: 'Memória Espacial',
        icon: '📐',
        score: scores.spatial ?? 40,
        barClass: 'bar-calc',
        description: 'Codificação e lembrança de posições relativas em grade.',
        recommendation: 'Visualize a disposição dos blocos iluminados como uma figura geométrica unificada.'
      },
      {
        key: 'flexibility',
        categoryKey: 'ORDERING',
        name: 'Flexibilidade Lógica',
        icon: '🔄',
        score: scores.flexibility ?? 40,
        barClass: 'bar-mem',
        description: 'Alternância de regras, ordenação e dedução de sequências lógicas.',
        recommendation: 'Pratique inversão rápida e identificação de regras de progressão (somas e Fibonacci).'
      }
    ];

    // Identifica com rigor estatístico se há um gargalo real isolado e uma fortaleza isolada
    const minVal = Math.min(...defs.map(d => d.score));
    const maxVal = Math.max(...defs.map(d => d.score));
    const countMin = defs.filter(d => d.score === minVal).length;
    const countMax = defs.filter(d => d.score === maxVal).length;

    // Apenas marca como gargalo se for a única menor, com diferença >= 4 pts e score < 60
    const singleBottleneckKey = (countMin === 1 && maxVal - minVal >= 4 && minVal < 60)
      ? defs.find(d => d.score === minVal)?.key
      : null;

    // Apenas marca como forte se for a única maior, com diferença >= 4 pts e score >= 65
    const singleStrengthKey = (countMax === 1 && maxVal - minVal >= 4 && maxVal >= 65)
      ? defs.find(d => d.score === maxVal)?.key
      : null;

    return defs.map(d => {
      let tier: 'Mestre' | 'Avançado' | 'Em Evolução' | 'Iniciante' = 'Iniciante';
      let tierClass = 'tier-practice';

      if (d.score >= 85) {
        tier = 'Mestre';
        tierClass = 'tier-master';
      } else if (d.score >= 70) {
        tier = 'Avançado';
        tierClass = 'tier-advanced';
      } else if (d.score >= 50) {
        tier = 'Em Evolução';
        tierClass = 'tier-developing';
      }

      // Cálculo de tendência heurística com base nas sessões recentes
      let trend: 'UP' | 'STABLE' | 'DOWN' = 'STABLE';
      let trendDelta = 0;
      
      const relevantSessions = sessions.filter(s => s.categoriesTrained?.includes(d.categoryKey as any));
      if (relevantSessions.length >= 2) {
        const latestAcc = relevantSessions[0].accuracyPercentage;
        const prevAcc = relevantSessions[1].accuracyPercentage;
        const diff = latestAcc - prevAcc;
        if (diff >= 10) {
          trend = 'UP';
          trendDelta = Math.min(5, Math.max(1, Math.round(diff / 10)));
        } else if (diff <= -10) {
          trend = 'DOWN';
          trendDelta = Math.max(-5, Math.min(-1, Math.round(diff / 10)));
        }
      } else if (d.score > 50) {
        trend = 'UP';
        trendDelta = 1;
      }

      let tag: 'Gargalo' | 'Forte' | 'Equilibrado' = 'Equilibrado';
      if (d.key === singleBottleneckKey) {
        tag = 'Gargalo';
      } else if (d.key === singleStrengthKey) {
        tag = 'Forte';
      }

      return {
        ...d,
        tier,
        tierClass,
        trend,
        trendDelta,
        tag
      };
    });
  });

  // Diagnóstico Geral da Raposa
  public diagnosis = computed<CognitiveDiagnosis>(() => {
    const list = this.evaluatedSkills();
    const sorted = [...list].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const totalScore = list.reduce((sum, s) => sum + s.score, 0);
    const overallScore = Math.round(totalScore / list.length);

    const totalSessions = this.storage.profileSignal().totalSessionsCompleted;
    const calibrationTarget = 3;
    const calibrationStatus = totalSessions >= calibrationTarget ? 'CONSOLIDATED' : 'CALIBRATING';
    const calibrationCount = Math.min(calibrationTarget, totalSessions);

    let overallTier = 'Iniciante';
    let overallTierClass = 'tier-practice';
    if (overallScore >= 85) {
      overallTier = 'Mestre';
      overallTierClass = 'tier-master';
    } else if (overallScore >= 70) {
      overallTier = 'Avançado';
      overallTierClass = 'tier-advanced';
    } else if (overallScore >= 50) {
      overallTier = 'Em Evolução';
      overallTierClass = 'tier-developing';
    }

    // Momentum heurístico
    let momentumText = 'Índice estável nos treinos recentes';
    const recent = this.recentSessions();
    if (recent.length >= 2) {
      const avgRecentAcc = Math.round(recent.slice(0, 3).reduce((sum, s) => sum + s.accuracyPercentage, 0) / Math.min(3, recent.length));
      if (avgRecentAcc >= 75) {
        momentumText = '↑ Ritmo em ascensão nos últimos treinos';
      } else if (avgRecentAcc < 50) {
        momentumText = '↓ Atenção ao controle e precisão recente';
      }
    }

    let dailyAction = `Praticar ${weakest.name} para fortalecer sua base de sustentação.`;
    if (weakest.key === 'calculation') {
      dailyAction = 'Pratique decompor números em dezenas inteiras para acelerar cálculos complexos.';
    } else if (weakest.key === 'memory') {
      dailyAction = 'Exercite a retenção em blocos mentais (chunking) de 2 a 3 dígitos.';
    } else if (weakest.key === 'attention') {
      dailyAction = 'Faça uma micro-pausa de 1s antes de tocar em testes com conflito de cores (Stroop).';
    }

    let foxAdvice = 'Você está construindo conexões neurais. A consistência diária é o fator determinante de evolução.';
    if (calibrationStatus === 'CALIBRATING') {
      foxAdvice = `Complete mais ${calibrationTarget - calibrationCount} treino(s) diário(s) para consolidar sua calibração heurística.`;
    } else if (overallScore >= 80) {
      foxAdvice = 'Seu perfil cognitivo demonstra altíssimo rendimento e equilíbrio nas 6 áreas!';
    } else if (overallScore >= 60) {
      foxAdvice = `Seus reflexos e retenção estão sólidos. O maior salto agora virá de destravar ${weakest.name}.`;
    } else {
      foxAdvice = `Seu foco estratégico imediato deve ser desacelerar o ritmo em ${weakest.name} para garantir precisão antes da velocidade.`;
    }

    return {
      overallScore,
      overallTier,
      overallTierClass,
      calibrationStatus,
      calibrationCount,
      calibrationTarget,
      momentumText,
      strongestSkill: strongest,
      weakestSkill: weakest,
      dailyAction,
      foxAdvice
    };
  });

  async ngOnInit(): Promise<void> {
    const sessions = await this.storage.getRecentSessions(7);
    this.recentSessions.set(sessions);
    const records = await this.storage.getRecords();
    this.personalRecords.set(records);
    const summaries = await this.mentalMath.getDomainSummaries();
    this.domainSummaries.set(summaries);
  }

  public toggleSkillExpand(key: string): void {
    if (this.expandedSkillKey() === key) {
      this.expandedSkillKey.set(null);
    } else {
      this.expandedSkillKey.set(key);
    }
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
