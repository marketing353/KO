export type OptionType = 'safe' | 'risk' | 'wild';

export interface Option {
  id: string;
  text: string;
  type: OptionType;
  baseChange?: number; // For safe/wild
  successRate?: number; // 0.0 to 1.0, for risk
  winAmount?: number; // For risk
  lossAmount?: number; // For risk
}

export interface Scenario {
  id: string;
  text: string;
  options: Option[];
}

export type Rank = 
  | "NPC"
  | "SIDE CHARACTER"
  | "MAIN CHARACTER"
  | "SIGMA"
  | "GIGACHAD"
  | "ELDRITCH GOD"
  | "L MAN"
  | "CRINGE LORD"
  | "CANCELED";

export interface GameState {
  status: 'MENU' | 'PLAYING' | 'GAMEOVER' | 'STATS';
  aura: number;
  maxAura: number;
  streak: number;
  history: string[]; // Log of last few actions
  scenariosPlayed: number;
  totalGamesPlayed: number;
  bestRun: number;
  lastPlayedDate: string;
  consecutiveDays: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface DailyChallenge {
  id: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  date: string;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  effect: string;
}

export interface GameStats {
  totalAuraGained: number;
  totalAuraLost: number;
  totalDecisions: number;
  risksTaken: number;
  risksWon: number;
  wildChoices: number;
  safeChoices: number;
  timeouts: number;
  highestStreak: number;
  totalGamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalPlayTime: number;
  achievements: Achievement[];
  consecutiveDays: number;
  lastPlayedDate: string;
}
