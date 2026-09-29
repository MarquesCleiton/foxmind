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
  public hasSuggestedHint = input<boolean>(false);
  public onAnswer = output<{ answer: any; isTimeout?: boolean }>();

  // Estados Locais para Sequência e Grade
  public memoryStage = signal<'PRE_START' | 'COUNTDOWN' | 'MEMORIZE' | 'INPUT'>('INPUT');
  public countdownNumber = signal<number>(3);
  public memoryRevealed = signal<boolean>(false);
  public userSequenceInput = signal<string>('');
  public selectedGridCells = signal<number[]>([]);
  public orderedSelected = signal<number[]>([]);
  public allOrderingNumbers = signal<number[]>([]);
  public geniusUserSteps = signal<string[]>([]);
  public activeGeniusColor = signal<string | null>(null);
  public geniusCanInput = signal<boolean>(false);
  public geniusReplayRemaining = signal<number>(1);

  // Barra de Tempo Geral e de Memorização (Item 1)
  public hasTimer = signal<boolean>(false);
  public timeRemaining = signal<number>(15);
  public timePercent = signal<number>(100);
  public memorizeTimePercent = signal<number>(100);
  public memorizeSecondsRemaining = signal<number>(3);

  // Ajuda Natural da Raposa
  public hintVisible = signal<boolean>(false);
  public disabledOptions = signal<any[]>([]);

  private timeoutIds: any[] = [];
  private timerInterval: any = null;
  private countdownTimer: any = null;
  private memorizeTimerInterval: any = null;

  constructor() {
    effect(() => {
      const q = this.question();
      this.resetExerciseState(q);
    });
  }

  public isMemorySequenceTest(type: string): boolean {
    return type === 'NUMBER_SEQUENCE' || type === 'SPATIAL_GRID' || type === 'GENIUS_COLORS';
  }

  public isReverseSequence(): boolean {
    const q = this.question();
    if (q?.data?.isReverse) return true;
    if (q?.prompt && (q.prompt.includes('CONTRÁRIO') || q.prompt.includes('INVERSA') || q.prompt.includes('inversa'))) {
      return true;
    }
    return false;
  }

  public sequenceLength(): number {
    return this.question()?.data?.sequence?.length || 0;
  }

  public spatialTargetsCount(): number {
    return this.question()?.data?.targets?.length || 0;
  }

  private resetExerciseState(q: ExerciseQuestion): void {
    this.clearAllTimers();
    this.userSequenceInput.set('');
    this.selectedGridCells.set([]);
    this.geniusUserSteps.set([]);
    this.geniusCanInput.set(false);
    this.geniusReplayRemaining.set(1);
    this.activeGeniusColor.set(null);
    this.disabledOptions.set([]);
    this.hintVisible.set(false);
    this.hasTimer.set(false);

    if (q.type === 'NUMBER_ORDERING') {
      this.orderedSelected.set([]);
      this.allOrderingNumbers.set([...(q.data?.numbers || [])]);
    }

    // Para testes de memorização (Item 2): Inicia em PRE_START com botão explícito tanto no treino quanto na revisão
    if (this.isMemorySequenceTest(q.type)) {
      this.memoryStage.set('PRE_START');
      this.memoryRevealed.set(false);
    } else {
      this.memoryStage.set('INPUT');
      this.memoryRevealed.set(false);

      // Configurar Barra de Tempo imediata para testes que não são de memorização prévia (apenas fora da revisão)
      if (q.hasTimerBar && q.timeLimitSeconds && !this.isReviewMode()) {
        this.startCountdownTimer(q.timeLimitSeconds);
      }
    }
  }

  // Contador de 3 Segundos antes de Exibir a Sequência para Memorizar (Item 2)
  public startMemoryCountdown(): void {
    const q = this.question();
    this.clearAllTimers();
    this.memoryStage.set('COUNTDOWN');
    this.countdownNumber.set(3);

    let count = 3;
    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNumber.set(count);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.launchMemoryDisplay(q);
      }
    }, 1000);
  }

  private startMemorizeTimer(displayTimeMs: number): void {
    if (this.memorizeTimerInterval) {
      clearInterval(this.memorizeTimerInterval);
      this.memorizeTimerInterval = null;
    }
    this.memorizeTimePercent.set(100);
    this.memorizeSecondsRemaining.set(Math.max(1, Math.ceil(displayTimeMs / 1000)));
    const startTime = Date.now();

    this.memorizeTimerInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(0, displayTimeMs - elapsedMs);
      const percent = (remainingMs / displayTimeMs) * 100;
      const secs = Math.max(1, Math.ceil(remainingMs / 1000));

      this.memorizeTimePercent.set(percent);
      this.memorizeSecondsRemaining.set(secs);

      if (remainingMs <= 0) {
        clearInterval(this.memorizeTimerInterval);
        this.memorizeTimerInterval = null;
      }
    }, 40);
  }

  private launchMemoryDisplay(q: ExerciseQuestion): void {
    if (q.type === 'NUMBER_SEQUENCE') {
      this.memoryStage.set('MEMORIZE');
      this.memoryRevealed.set(true);
      const displayTime = q.data?.displayTimeMs || 3000;
      this.startMemorizeTimer(displayTime);

      const t = setTimeout(() => {
        if (this.memorizeTimerInterval) {
          clearInterval(this.memorizeTimerInterval);
          this.memorizeTimerInterval = null;
        }
        this.memoryRevealed.set(false);
        this.memoryStage.set('INPUT');
        // Agora inicia a contagem do tempo limite para responder (Item 1)
        const limitSecs = q.timeLimitSeconds || 16;
        if (!this.isReviewMode()) {
          this.startCountdownTimer(limitSecs);
        }
      }, displayTime);
      this.timeoutIds.push(t);
    } else if (q.type === 'SPATIAL_GRID') {
      this.memoryStage.set('MEMORIZE');
      this.memoryRevealed.set(true);
      const flashTime = q.data?.flashTimeMs || 2500;
      this.startMemorizeTimer(flashTime);

      const t = setTimeout(() => {
        if (this.memorizeTimerInterval) {
          clearInterval(this.memorizeTimerInterval);
          this.memorizeTimerInterval = null;
        }
        this.memoryRevealed.set(false);
        this.memoryStage.set('INPUT');
        const limitSecs = q.timeLimitSeconds || 16;
        if (!this.isReviewMode()) {
          this.startCountdownTimer(limitSecs);
        }
      }, flashTime);
      this.timeoutIds.push(t);
    } else if (q.type === 'GENIUS_COLORS') {
      this.memoryStage.set('INPUT');
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
          const limitSecs = this.question()?.timeLimitSeconds || 16;
          if (!this.isReviewMode()) {
            this.startCountdownTimer(limitSecs);
          }
        }
      }, (i + 1) * speedMs + (speedMs * 0.6));
      this.timeoutIds.push(t1, t2);
    });
  }

  public replayGeniusSequence(): void {
    if (this.geniusReplayRemaining() <= 0 || !this.geniusCanInput()) return;
    this.geniusReplayRemaining.set(0);
    this.geniusUserSteps.set([]);
    const q = this.question();
    this.runGeniusSequence(q.data?.sequence || [], q.data?.speedMs || 500);
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

  // Ordenação Numérica (Item 3: Botões ficam bloqueados sem sumir nem reorganizar)
  public isNumberOrdered(num: number): boolean {
    return this.orderedSelected().includes(num);
  }

  public pickOrderingNumber(num: number): void {
    if (this.isNumberOrdered(num)) return;

    const expected = this.question().expectedAnswer as number[];
    const currentPickIndex = this.orderedSelected().length;

    const newOrdered = [...this.orderedSelected(), num];
    this.orderedSelected.set(newOrdered);

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

  public showsEqualsSign(): boolean {
    const eq = this.question()?.data?.equation || '';
    return !eq.includes('=') && !eq.includes('?') && !eq.includes(':') && !eq.includes('≈');
  }

  public isLongEquation(): boolean {
    const eq = this.question()?.data?.equation || '';
    return eq.length > 12;
  }

  private clearAllTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.memorizeTimerInterval) {
      clearInterval(this.memorizeTimerInterval);
      this.memorizeTimerInterval = null;
    }
    this.timeoutIds.forEach(t => clearTimeout(t));
    this.timeoutIds = [];
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
  }
}
