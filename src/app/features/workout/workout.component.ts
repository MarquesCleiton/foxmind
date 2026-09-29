import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { ActiveExerciseComponent } from './active-exercise/active-exercise.component';

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

  ngOnInit(): void {
    // Continua de onde parou após refresh, com teste atual refeito (Item 3)
    if (this.workout.hasSavedActiveSession()) {
      this.workout.restoreSessionWithRegeneratedCurrent();
    } else if (this.workout.state() === 'IDLE') {
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
