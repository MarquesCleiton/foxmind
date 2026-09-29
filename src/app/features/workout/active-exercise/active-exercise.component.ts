import { Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseQuestion } from '../../../core/models/cognitive.models';

@Component({
  selector: 'app-active-exercise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-exercise.component.html',
  styleUrls: ['./active-exercise.component.css']
})
export class ActiveExerciseComponent implements OnDestroy {
  public question = input.required<ExerciseQuestion>();
  public isReviewMode = input<boolean>(false);
  public autoShowHint = input<boolean>(false);
  public onAnswer = output<{ answer: any; isTimeout?: boolean }>();

  // Estados Locais para Sequência e Grade
  public memoryRevealed = signal<boolean>(true);
  public userSequenceInput = signal<string>('');
  public selectedGridCells = signal<number[]>([]);
  public orderedSelected = signal<number[]>([]);
  public remainingOrderingNumbers = signal<number[]>([]);
  public geniusUserSteps = signal<string[]>([]);
  public activeGeniusColor = signal<string | null>(null);
  public geniusCanInput = signal<boolean>(false);

  // Barra de Tempo
  public hasTimer = signal<boolean>(false);
  public timeRemaining = signal<number>(15);
  public timePercent = signal<number>(100);

  // Ajuda Natural da Raposa
  public hintVisible = signal<boolean>(false);
  public disabledOptions = signal<any[]>([]);

  private timeoutIds: any[] = [];
  private timerInterval: any = null;

  constructor() {
    effect(() => {
      const q = this.question();
      const autoHint = this.autoShowHint();
      this.resetExerciseState(q, autoHint);
    });
  }

  private resetExerciseState(q: ExerciseQuestion, autoHint: boolean): void {
    this.clearAllTimers();
    this.userSequenceInput.set('');
    this.selectedGridCells.set([]);
    this.geniusUserSteps.set([]);
    this.geniusCanInput.set(false);
    this.activeGeniusColor.set(null);
    this.disabledOptions.set([]);
    this.hintVisible.set(autoHint);

    // Configurar Barra de Tempo
    if (q.hasTimerBar && q.timeLimitSeconds && !this.isReviewMode()) {
      this.startCountdownTimer(q.timeLimitSeconds);
    } else {
      this.hasTimer.set(false);
    }

    if (q.type === 'NUMBER_SEQUENCE') {
      this.memoryRevealed.set(true);
      const displayTime = q.data?.displayTimeMs || 2500;
      const t = setTimeout(() => {
        this.memoryRevealed.set(false);
      }, displayTime);
      this.timeoutIds.push(t);
    } else if (q.type === 'SPATIAL_GRID') {
      this.memoryRevealed.set(true);
      const flashTime = q.data?.flashTimeMs || 2000;
      const t = setTimeout(() => {
        this.memoryRevealed.set(false);
      }, flashTime);
      this.timeoutIds.push(t);
    } else if (q.type === 'NUMBER_ORDERING') {
      this.orderedSelected.set([]);
      this.remainingOrderingNumbers.set([...(q.data?.numbers || [])]);
    } else if (q.type === 'GENIUS_COLORS') {
      this.runGeniusSequence(q.data?.sequence || [], q.data?.speedMs || 500);
    }
  }

  // Barra de Tempo Regressiva
  private startCountdownTimer(seconds: number): void {
    this.hasTimer.set(true);
    this.timeRemaining.set(seconds);
    this.timePercent.set(100);

    const totalMs = seconds * 1000;
    const startTime = Date.now();

    this.timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const percent = (remainingMs / totalMs) * 100;
      const secs = Math.ceil(remainingMs / 1000);

      this.timePercent.set(percent);
      this.timeRemaining.set(secs);

      if (remainingMs <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.onAnswer.emit({ answer: null, isTimeout: true });
      }
    }, 100);
  }

  // Ativação da Dica Natural da Raposa
  public toggleFoxHint(): void {
    this.hintVisible.set(!this.hintVisible());

    // Se a questão possui alternativas e o usuário pediu ajuda, elimina 2 opções erradas
    const q = this.question();
    if (this.hintVisible() && q.options && q.options.length >= 4) {
      const wrong = q.options.filter(opt => {
        const val = typeof opt === 'object' && opt.id ? opt.id : opt;
        return val !== q.expectedAnswer;
      });
      // Desativa 2 erradas para reduzir o estresse cognitivo
      this.disabledOptions.set(wrong.slice(0, 2).map(o => (typeof o === 'object' && o.id ? o.id : o)));
    }
  }

  // Genius / Simon
  private runGeniusSequence(seq: string[], speedMs: number): void {
    this.geniusCanInput.set(false);
    seq.forEach((color, i) => {
      const t1 = setTimeout(() => {
        this.activeGeniusColor.set(color);
      }, (i + 1) * speedMs);
      const t2 = setTimeout(() => {
        this.activeGeniusColor.set(null);
        if (i === seq.length - 1) {
          this.geniusCanInput.set(true);
        }
      }, (i + 1) * speedMs + (speedMs * 0.6));
      this.timeoutIds.push(t1, t2);
    });
  }

  public onGeniusTap(color: string): void {
    if (!this.geniusCanInput()) return;
    this.activeGeniusColor.set(color);
    setTimeout(() => this.activeGeniusColor.set(null), 200);

    const nextSteps = [...this.geniusUserSteps(), color];
    this.geniusUserSteps.set(nextSteps);

    const expectedSeq = this.question().expectedAnswer as string[];
    const currentStepIndex = nextSteps.length - 1;

    if (nextSteps[currentStepIndex] !== expectedSeq[currentStepIndex]) {
      this.geniusCanInput.set(false);
      this.onAnswer.emit({ answer: nextSteps, isTimeout: false });
      return;
    }

    if (nextSteps.length === expectedSeq.length) {
      this.geniusCanInput.set(false);
      this.onAnswer.emit({ answer: nextSteps, isTimeout: false });
    }
  }

  // Teclado Numérico para Sequência
  public appendDigit(digit: number): void {
    const maxLen = (this.question().data?.sequence?.length) || 8;
    if (this.userSequenceInput().length < maxLen) {
      this.userSequenceInput.set(this.userSequenceInput() + digit);
    }
  }

  public backspaceDigit(): void {
    const cur = this.userSequenceInput();
    if (cur.length > 0) {
      this.userSequenceInput.set(cur.slice(0, -1));
    }
  }

  public submitSequence(): void {
    this.onAnswer.emit({ answer: this.userSequenceInput(), isTimeout: false });
  }

  // Memória Espacial
  public toggleGridCell(idx: number): void {
    if (this.memoryRevealed()) return;
    const current = this.selectedGridCells();
    if (current.includes(idx)) {
      this.selectedGridCells.set(current.filter(i => i !== idx));
    } else {
      this.selectedGridCells.set([...current, idx]);
    }
  }

  public submitSpatial(): void {
    const sorted = [...this.selectedGridCells()].sort((a, b) => a - b);
    this.onAnswer.emit({ answer: sorted, isTimeout: false });
  }

  // Ordenação Numérica
  public pickOrderingNumber(num: number): void {
    const expected = this.question().expectedAnswer as number[];
    const currentPickIndex = this.orderedSelected().length;

    const newOrdered = [...this.orderedSelected(), num];
    this.orderedSelected.set(newOrdered);
    this.remainingOrderingNumbers.set(this.remainingOrderingNumbers().filter(n => n !== num));

    if (num !== expected[currentPickIndex]) {
      this.onAnswer.emit({ answer: newOrdered, isTimeout: false });
      return;
    }

    if (newOrdered.length === expected.length) {
      this.onAnswer.emit({ answer: newOrdered, isTimeout: false });
    }
  }

  // Seleção de Alternativa (Cálculo, Problema Contextual, Stroop, Padrões Lógicos)
  public selectOption(ans: any): void {
    this.onAnswer.emit({ answer: ans, isTimeout: false });
  }

  public isOptionDisabled(opt: any): boolean {
    const val = typeof opt === 'object' && opt.id ? opt.id : opt;
    return this.disabledOptions().includes(val);
  }

  private clearAllTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timeoutIds.forEach(t => clearTimeout(t));
    this.timeoutIds = [];
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
  }
}
