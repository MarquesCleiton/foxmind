import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { ProgressionEngineService } from '../../core/services/progression-engine.service';
import { FocusUnitId, ExerciseLevel } from '../../core/models/cognitive.models';
import { GUIDE_TOPICS } from './guide-data';

export type GuideCategoryFilter = 'ALL' | 'CALCULATION' | 'MEMORY' | 'ATTENTION' | 'LOGIC';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent {
  private router = inject(Router);
  private workout = inject(WorkoutService);
  private progression = inject(ProgressionEngineService);

  public readonly allTopics = GUIDE_TOPICS;
  public selectedCategory = signal<GuideCategoryFilter>('ALL');
  public searchQuery = signal<string>('');
  
  // Controle de expansão de detalhes extras por tópico
  public expandedTopicIds = signal<Set<string>>(new Set<string>());

  public filteredTopics = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.allTopics.filter(t => {
      // Filtro de categoria
      if (cat !== 'ALL' && t.category !== cat) {
        return false;
      }

      // Filtro de busca textual
      if (query) {
        const inTitle = t.title.toLowerCase().includes(query);
        const inRule = t.ruleText.toLowerCase().includes(query) || t.ruleHighlight.toLowerCase().includes(query);
        const inFox = t.foxTip.toLowerCase().includes(query);
        const inBadge = t.badgeLabel.toLowerCase().includes(query);
        const inHacks = t.speedHacks.some(h => 
          h.title.toLowerCase().includes(query) || h.description.toLowerCase().includes(query)
        );
        return inTitle || inRule || inFox || inBadge || inHacks;
      }

      return true;
    });
  });

  public selectCategory(cat: GuideCategoryFilter): void {
    this.selectedCategory.set(cat);
  }

  public clearSearch(): void {
    this.searchQuery.set('');
  }

  public toggleExpand(id: string): void {
    const current = new Set(this.expandedTopicIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.expandedTopicIds.set(current);
  }

  public isExpanded(id: string): boolean {
    return this.expandedTopicIds().has(id);
  }

  public expandAll(): void {
    const allIds = new Set(this.filteredTopics().map(t => t.id));
    this.expandedTopicIds.set(allIds);
  }

  public collapseAll(): void {
    this.expandedTopicIds.set(new Set());
  }

  public async startTraining(unitId: FocusUnitId): Promise<void> {
    const state = this.progression.getState(unitId);
    const level = (state?.currentLevel ?? 1) as ExerciseLevel;
    const targetQ = this.progression.questionsForUnit(unitId, level);
    await this.workout.startFocalWorkout({
      unitIds: [unitId],
      questionCount: targetQ,
      level
    });
    this.router.navigate(['/workout']);
  }

  public getUnitQuestionsLabel(unitId: FocusUnitId): string {
    const state = this.progression.getState(unitId);
    const level = (state?.currentLevel ?? 1) as ExerciseLevel;
    const qCount = this.progression.questionsForUnit(unitId, level);
    return `${qCount}Q`;
  }
}
