import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { DailyWorkoutSession, PersonalRecord } from '../../core/models/cognitive.models';

export interface EvaluatedSkill {
  key: string;
  name: string;
  icon: string;
  score: number;
  barClass: string;
  tier: 'Mestre' | 'Avançado' | 'Em Evolução' | 'Iniciante';
  tierClass: string;
  description: string;
  recommendation: string;
}

export interface CognitiveDiagnosis {
  overallScore: number;
  overallTier: string;
  overallTierClass: string;
  strongestSkill: EvaluatedSkill;
  weakestSkill: EvaluatedSkill;
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
  public recentSessions = signal<DailyWorkoutSession[]>([]);
  public personalRecords = signal<PersonalRecord[]>([]);

  // Avaliação rica e estruturada de cada habilidade
  public evaluatedSkills = computed<EvaluatedSkill[]>(() => {
    const scores = this.storage.profileSignal().cognitiveScores;

    const defs = [
      {
        key: 'calculation',
        name: 'Cálculo Mental',
        icon: '🔢',
        score: scores.calculation || 40,
        barClass: 'bar-calc',
        description: 'Operações mentais, porcentagens e problemas numéricos.',
        recommendation: 'Decomponha números em dezenas inteiras para acelerar cálculos complexos.'
      },
      {
        key: 'memory',
        name: 'Memória de Trabalho',
        icon: '🧠',
        score: scores.memory || 40,
        barClass: 'bar-mem',
        description: 'Retenção imediata de sequências de dígitos (direto/inverso).',
        recommendation: 'Use a técnica de agrupamento (chunking) em blocos de 2 a 3 dígitos.'
      },
      {
        key: 'attention',
        name: 'Atenção & Inibição',
        icon: '🎯',
        score: scores.attention || 40,
        barClass: 'bar-att',
        description: 'Foco seletivo e controle inibitório sobre distrações (Stroop).',
        recommendation: 'Faça uma micro-pausa de 1s antes de responder em estímulos com conflito de cores.'
      },
      {
        key: 'speed',
        name: 'Velocidade de Reação',
        icon: '⚡',
        score: scores.speed || 40,
        barClass: 'bar-spd',
        description: 'Tempo de reação e tomada de decisão motora sob pressão de tempo.',
        recommendation: 'Mantenha o foco visual relaxado no centro da tela para registrar os estímulos mais rápido.'
      },
      {
        key: 'spatial',
        name: 'Memória Espacial',
        icon: '📐',
        score: scores.spatial || 40,
        barClass: 'bar-calc',
        description: 'Codificação e lembrança de posições relativas em grade.',
        recommendation: 'Visualize a disposição dos blocos iluminados como uma figura geométrica unificada.'
      },
      {
        key: 'flexibility',
        name: 'Flexibilidade Lógica',
        icon: '🔄',
        score: scores.flexibility || 40,
        barClass: 'bar-mem',
        description: 'Alternância de regras, ordenação e dedução de sequências lógicas.',
        recommendation: 'Pratique inversão rápida e identificação de regras de progressão (somas e Fibonacci).'
      }
    ];

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

      return {
        ...d,
        tier,
        tierClass
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

    let foxAdvice = 'Você está construindo suas conexões neurais. O treino diário trará consistência.';
    if (overallScore >= 80) {
      foxAdvice = 'Seu perfil cognitivo demonstra altíssimo rendimento e equilíbrio em todas as áreas!';
    } else if (overallScore >= 60) {
      foxAdvice = `Seus reflexos e memória estão firmes. O maior salto agora virá de focar em ${weakest.name}.`;
    }

    return {
      overallScore,
      overallTier,
      overallTierClass,
      strongestSkill: strongest,
      weakestSkill: weakest,
      foxAdvice
    };
  });

  async ngOnInit(): Promise<void> {
    const sessions = await this.storage.getRecentSessions(7);
    this.recentSessions.set(sessions);
    const records = await this.storage.getRecords();
    this.personalRecords.set(records);
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
