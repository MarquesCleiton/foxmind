import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { ActiveExerciseComponent } from './active-exercise/active-exercise.component';
import { ALL_FOCUS_UNITS, FOCUS_SESSIONS } from '../../core/services/progression-engine.service';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, ActiveExerciseComponent],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {
  public workout = inject(WorkoutService);
  private router = inject(Router);

  // Modal de Confirmação de Saída (Item 4)
  public showExitConfirm = signal<boolean>(false);

  // Indicador visual da unidade e nível da questão ativa
  public currentUnitIndicator = computed(() => {
    const q = this.workout.currentQuestion();
    if (!q) return null;
    const unitId = q.unitId;
    if (unitId) {
      const meta = ALL_FOCUS_UNITS.find(u => u.unitId === unitId);
      if (meta) {
        return `${meta.icon} ${meta.name} • Nível ${q.level || 1}`;
      }
    }
    return null;
  });

  // Título e resumo do foco no aquecimento
  public focalTitle = computed(() => {
    const config = this.workout.focalWorkoutConfig();
    if (!config) return null;
    if (config.unitIds.length === 1) {
      const meta = ALL_FOCUS_UNITS.find(u => u.unitId === config.unitIds[0]);
      return meta ? `${meta.icon} Foco: ${meta.name}` : 'Treino Focal';
    }
    if (config.sessionId) {
      const session = FOCUS_SESSIONS.find(s => s.id === config.sessionId);
      return session ? `${session.icon} Sessão: ${session.name}` : 'Treino de Sessão';
    }
    return 'Treino Focal';
  });

  ngOnInit(): void {
    // Se a sessão já foi iniciada na memória (ex: acabou de clicar em Iniciar no Foco ou Home), NÃO recria!
    if (this.workout.state() !== 'IDLE') {
      return;
    }

    // Se o usuário recarregou a página (F5) no navegador, restaura a sessão salva
    if (this.workout.hasSavedActiveSession()) {
      this.workout.restoreSessionWithRegeneratedCurrent();
    } else {
      this.workout.startDailyWorkout();
    }
  }

  public onWarmupComplete(): void {
    this.workout.endWarmup();
  }

  // Ação criativa: "Ainda não / Treinar mais tarde" (Item 5)
  public cancelWarmupAndReturn(): void {
    this.workout.clearSavedSession();
    this.workout.exitToHome();
    this.router.navigate(['/']);
  }

  public onAnswerSubmitted(event: { answer: any; isTimeout?: boolean }): void {
    this.workout.submitAnswer(event.answer, event.isTimeout);
  }

  // Intercepta clique no X para confirmar (Item 4)
  public onExitClicked(): void {
    if (this.workout.state() === 'SUMMARY') {
      this.exitWorkout();
      return;
    }
    this.showExitConfirm.set(true);
  }

  public dismissExitConfirm(): void {
    this.showExitConfirm.set(false);
  }

  public confirmExit(): void {
    this.showExitConfirm.set(false);
    this.workout.clearSavedSession();
    this.exitWorkout();
  }

  public exitWorkout(): void {
    this.workout.exitToHome();
    this.router.navigate(['/']);
  }

  public startAnotherSession(): void {
    const config = this.workout.focalWorkoutConfig();
    if (config) {
      this.workout.startFocalWorkout(config);
      return;
    }
    const domain = this.workout.activeMathDomain();
    if (domain) {
      this.workout.startMathDomainWorkout(domain, 3);
    } else {
      this.workout.startDailyWorkout(8);
    }
  }

  public getMathDomainLabel(domain: string): string {
    switch (domain) {
      case 'ADDITION': return '➕ Adição';
      case 'SUBTRACTION': return '➖ Subtração';
      case 'MULTIPLICATION': return '✖️ Multiplicação';
      case 'DIVISION': return '➗ Divisão';
      case 'PERCENTAGE': return '% Porcentagem';
      case 'MIXED': return '⚡ Desafio Misto';
      default: return domain;
    }
  }
}
