import { Injectable, signal } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { 
  CognitiveProfile, 
  DailyWorkoutSession, 
  ExerciseAttempt, 
  PersonalRecord, 
  PendingReviewError,
  CognitiveCategory
} from '../models/cognitive.models';

export class FoxMindDatabase extends Dexie {
  profile!: Table<CognitiveProfile, number>;
  sessions!: Table<DailyWorkoutSession, string>;
  attempts!: Table<ExerciseAttempt, number>;
  records!: Table<PersonalRecord, string>;
  errorBank!: Table<PendingReviewError, number>;

  constructor() {
    super('FoxMindDB');
    this.version(1).stores({
      profile: 'id',
      sessions: 'id, date, completed, createdAt',
      attempts: '++id, sessionId, category, type, isCorrect, timestamp',
      records: 'category, lastUpdated',
      errorBank: '++id, sessionId, resolved, createdAt'
    });
  }
}

const DEFAULT_PROFILE: CognitiveProfile = {
  id: 1,
  streakCurrent: 0,
  streakBest: 0,
  lastActiveDate: '',
  streakShieldCount: 1,
  totalXp: 0,
  level: 1,
  totalSessionsCompleted: 0,
  targetMinutes: 8,
  soundEnabled: true,
  hapticEnabled: true,
  theme: 'dark',
  cognitiveScores: {
    calculation: 50,
    memory: 50,
    attention: 50,
    speed: 50,
    spatial: 50,
    flexibility: 50
  }
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private db: FoxMindDatabase;

  // Signals Reativos para UI instantânea
  public profileSignal = signal<CognitiveProfile>(DEFAULT_PROFILE);
  public isReady = signal<boolean>(false);

  constructor() {
    this.db = new FoxMindDatabase();
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      let profile = await this.db.profile.get(1);
      if (!profile) {
        profile = { ...DEFAULT_PROFILE };
        await this.db.profile.add(profile);
      }
      this.profileSignal.set(profile);
      this.isReady.set(true);
    } catch (err) {
      console.error('Erro ao inicializar FoxMindDB:', err);
    }
  }

  public async getProfile(): Promise<CognitiveProfile> {
    const profile = await this.db.profile.get(1);
    return profile || DEFAULT_PROFILE;
  }

  public async updateProfile(changes: Partial<CognitiveProfile>): Promise<void> {
    const current = await this.getProfile();
    const updated = { ...current, ...changes };
    await this.db.profile.put(updated);
    this.profileSignal.set(updated);
  }

  public async recordSessionComplete(session: DailyWorkoutSession): Promise<void> {
    await this.db.sessions.put(session);
    
    // Atualizar Streak e XP
    const profile = await this.getProfile();
    const today = new Date().toISOString().split('T')[0];
    
    let newStreak = profile.streakCurrent;
    if (profile.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (profile.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else if (!profile.lastActiveDate) {
        newStreak = 1;
      } else {
        // Se perdeu um dia, verifica se tinha proteção
        if (profile.streakShieldCount > 0) {
          // Usou a proteção de sequência
          newStreak += 1;
          profile.streakShieldCount -= 1;
        } else {
          newStreak = 1;
        }
      }
    }

    const newBestStreak = Math.max(newStreak, profile.streakBest);
    const newXp = profile.totalXp + session.xpEarned;
    // Cada 200 XP = 1 Nível
    const newLevel = Math.max(1, Math.floor(newXp / 200) + 1);

    // Atualização leve dos escores cognitivos baseada na acurácia da sessão
    const newScores = { ...profile.cognitiveScores };
    session.categoriesTrained.forEach(cat => {
      const field = this.categoryToScoreField(cat);
      if (field) {
        const delta = session.accuracyPercentage >= 80 ? 2 : (session.accuracyPercentage >= 60 ? 1 : -1);
        newScores[field] = Math.min(100, Math.max(10, newScores[field] + delta));
      }
    });

    await this.updateProfile({
      streakCurrent: newStreak,
      streakBest: newBestStreak,
      lastActiveDate: today,
      totalXp: newXp,
      level: newLevel,
      totalSessionsCompleted: profile.totalSessionsCompleted + 1,
      cognitiveScores: newScores
    });
  }

  private categoryToScoreField(cat: CognitiveCategory): keyof CognitiveProfile['cognitiveScores'] | null {
    switch (cat) {
      case 'CALCULATION': return 'calculation';
      case 'MEMORY': return 'memory';
      case 'ATTENTION': return 'attention';
      case 'SPEED': return 'speed';
      case 'SPATIAL': return 'spatial';
      case 'ORDERING': return 'flexibility';
      default: return null;
    }
  }

  public async saveAttempt(attempt: ExerciseAttempt): Promise<number> {
    return await this.db.attempts.add(attempt);
  }

  public async saveErrorForReview(err: PendingReviewError): Promise<number> {
    return await this.db.errorBank.add(err);
  }

  public async getPendingErrors(sessionId?: string): Promise<PendingReviewError[]> {
    if (sessionId) {
      return await this.db.errorBank.where({ sessionId, resolved: false }).toArray();
    }
    return await this.db.errorBank.where('resolved').equals(0 as any).toArray();
  }

  public async markErrorResolved(id: number): Promise<void> {
    await this.db.errorBank.update(id, { resolved: true });
  }

  public async getRecentSessions(limit = 10): Promise<DailyWorkoutSession[]> {
    return await this.db.sessions.orderBy('createdAt').reverse().limit(limit).toArray();
  }

  public async getRecords(): Promise<PersonalRecord[]> {
    return await this.db.records.toArray();
  }

  public async updatePersonalRecord(record: PersonalRecord): Promise<void> {
    const existing = await this.db.records.get(record.category);
    if (!existing) {
      await this.db.records.put(record);
      return;
    }
    const updated: PersonalRecord = {
      category: record.category,
      bestAccuracy: Math.max(existing.bestAccuracy, record.bestAccuracy),
      bestTimeMs: existing.bestTimeMs === 0 ? record.bestTimeMs : Math.min(existing.bestTimeMs, record.bestTimeMs),
      maxDifficulty: Math.max(existing.maxDifficulty, record.maxDifficulty),
      bestStreakInSession: Math.max(existing.bestStreakInSession, record.bestStreakInSession),
      lastUpdated: Date.now()
    };
    await this.db.records.put(updated);
  }

  // Backup e Restauração 100% Client-side
  public async exportAllData(): Promise<string> {
    const profile = await this.getProfile();
    const sessions = await this.db.sessions.toArray();
    const records = await this.db.records.toArray();
    const exportObject = {
      foxmind_version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      sessions,
      records
    };
    return JSON.stringify(exportObject, null, 2);
  }

  public async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) {
        await this.db.profile.put(data.profile);
        this.profileSignal.set(data.profile);
      }
      if (data.sessions && Array.isArray(data.sessions)) {
        await this.db.sessions.bulkPut(data.sessions);
      }
      if (data.records && Array.isArray(data.records)) {
        await this.db.records.bulkPut(data.records);
      }
      return true;
    } catch (e) {
      console.error('Falha ao importar dados:', e);
      return false;
    }
  }

  public async resetAllData(): Promise<void> {
    await this.db.sessions.clear();
    await this.db.attempts.clear();
    await this.db.records.clear();
    await this.db.errorBank.clear();
    await this.db.profile.put(DEFAULT_PROFILE);
    this.profileSignal.set(DEFAULT_PROFILE);
  }
}
