import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { WorkoutService } from '../../core/services/workout.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public storage = inject(StorageService);
  private workout = inject(WorkoutService);
  private router = inject(Router);

  // Tempo dinâmico baseado no perfil do usuário
  public currentMinutes = computed(() => {
    return this.storage.profileSignal().targetMinutes || 8;
  });

  // Cálculo proporcional do tempo por habilidade
  public skillTime = computed(() => {
    const mins = this.currentMinutes();
    if (mins <= 3) return '0:45';
    if (mins <= 8) return '2:00';
    return '3:45';
  });

  public async selectDuration(mins: number): Promise<void> {
    await this.storage.updateProfile({ targetMinutes: mins });
  }

  public startWorkout(targetMinutes?: number): void {
    const mins = targetMinutes ?? this.currentMinutes();
    this.workout.startDailyWorkout(mins);
    this.router.navigate(['/workout']);
  }
}
