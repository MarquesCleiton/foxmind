import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { StorageService } from './core/services/storage.service';
import { ProgressionEngineService } from './core/services/progression-engine.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public router = inject(Router);
  public storage = inject(StorageService);
  private progression = inject(ProgressionEngineService);

  async ngOnInit(): Promise<void> {
    // Inicializa o motor de progressão no startup para que os níveis
    // estejam disponíveis ao montar a fila do treino diário
    await this.progression.init();
  }

  public isWorkoutScreen(): boolean {
    return this.router.url.includes('/workout');
  }
}
