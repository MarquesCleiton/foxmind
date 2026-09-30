import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { WorkoutService } from '../../core/services/workout.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';
import { ProgressionEngineService } from '../../core/services/progression-engine.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public storage = inject(StorageService);
  public pwa = inject(PwaInstallService);
  public progression = inject(ProgressionEngineService);
  private workout = inject(WorkoutService);
  private router = inject(Router);

  public async startWorkout(): Promise<void> {
    await this.workout.startDailyWorkout();
    this.router.navigate(['/workout']);
  }
}
