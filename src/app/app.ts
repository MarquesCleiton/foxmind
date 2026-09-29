import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { StorageService } from './core/services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public router = inject(Router);
  public storage = inject(StorageService);

  public isWorkoutScreen(): boolean {
    return this.router.url.includes('/workout');
  }
}
