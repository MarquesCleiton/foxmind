import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  public storage = inject(StorageService);

  public async toggleSound(): Promise<void> {
    const current = this.storage.profileSignal();
    await this.storage.updateProfile({ soundEnabled: !current.soundEnabled });
  }

  public async toggleHaptic(): Promise<void> {
    const current = this.storage.profileSignal();
    await this.storage.updateProfile({ hapticEnabled: !current.hapticEnabled });
  }

  public async toggleTheme(): Promise<void> {
    const current = this.storage.profileSignal();
    const newTheme = current.theme === 'dark' ? 'light' : 'dark';
    await this.storage.updateProfile({ theme: newTheme });
    if (newTheme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }

  public async setTargetMinutes(mins: number): Promise<void> {
    await this.storage.updateProfile({ targetMinutes: mins });
  }

  public async exportBackup(): Promise<void> {
    const json = await this.storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foxmind-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const content = e.target.result;
      const success = await this.storage.importData(content);
      if (success) {
        alert('Backup restaurado com sucesso!');
      } else {
        alert('Falha ao restaurar arquivo de backup.');
      }
    };
    reader.readAsText(file);
  }

  public async resetData(): Promise<void> {
    if (confirm('Tem certeza de que deseja redefinir todo o seu progresso? Esta ação não pode ser desfeita.')) {
      await this.storage.resetAllData();
      alert('Dados redefinidos com sucesso.');
    }
  }
}
