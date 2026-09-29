import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { DailyWorkoutSession, PersonalRecord } from '../../core/models/cognitive.models';

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

  async ngOnInit(): Promise<void> {
    const sessions = await this.storage.getRecentSessions(7);
    this.recentSessions.set(sessions);
    const records = await this.storage.getRecords();
    this.personalRecords.set(records);
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
