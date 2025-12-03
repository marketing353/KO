import { GameStats, Achievement, DailyChallenge, PowerUp } from './types';

const STORAGE_KEYS = {
  STATS: 'aura_game_stats',
  ACHIEVEMENTS: 'aura_achievements',
  DAILY_CHALLENGES: 'aura_daily_challenges',
  POWERUPS: 'aura_powerups',
  LAST_LOGIN: 'aura_last_login',
};

// Default stats
export const getDefaultStats = (): GameStats => ({
  totalAuraGained: 0,
  totalAuraLost: 0,
  totalDecisions: 0,
  risksTaken: 0,
  risksWon: 0,
  wildChoices: 0,
  safeChoices: 0,
  timeouts: 0,
  highestStreak: 0,
  totalGamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  totalPlayTime: 0,
  achievements: [],
  consecutiveDays: 0,
  lastPlayedDate: '',
});

// Achievement definitions - psychological hooks for Gen Z
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedDate'>[] = [
  {
    id: 'first_blood',
    title: 'FIRST BLOOD',
    description: 'Complete your first scenario',
    icon: '🎯',
    condition: (stats) => stats.totalDecisions >= 1,
  },
  {
    id: 'main_character',
    title: 'MAIN CHARACTER UNLOCKED',
    description: 'Reach Main Character rank',
    icon: '⭐',
    condition: (stats) => stats.totalAuraGained >= 5000,
  },
  {
    id: 'risk_taker',
    title: 'RISK TAKER',
    description: 'Choose RISK 10 times',
    icon: '⚠️',
    condition: (stats) => stats.risksTaken >= 10,
  },
  {
    id: 'gambling_addiction',
    title: 'GAMBLING ADDICTION',
    description: 'Choose RISK 50 times',
    icon: '🎰',
    condition: (stats) => stats.risksTaken >= 50,
  },
  {
    id: 'lucky_charm',
    title: 'LUCKY CHARM',
    description: 'Win 5 RISK choices in a row',
    icon: '🍀',
    condition: (stats) => stats.risksWon >= 5,
  },
  {
    id: 'chaos_agent',
    title: 'CHAOS AGENT',
    description: 'Choose WILD 20 times',
    icon: '✨',
    condition: (stats) => stats.wildChoices >= 20,
  },
  {
    id: 'speedrunner',
    title: 'SPEEDRUNNER',
    description: 'Complete 10 scenarios without timeout',
    icon: '⚡',
    condition: (stats) => stats.totalDecisions >= 10 && stats.timeouts === 0,
  },
  {
    id: 'streak_god',
    title: 'STREAK GOD',
    description: 'Reach a 10 streak',
    icon: '🔥',
    condition: (stats) => stats.highestStreak >= 10,
  },
  {
    id: 'grinder',
    title: 'GRINDER',
    description: 'Play 10 games',
    icon: '💪',
    condition: (stats) => stats.totalGamesPlayed >= 10,
  },
  {
    id: 'no_life',
    title: 'NO LIFE',
    description: 'Play 50 games',
    icon: '🎮',
    condition: (stats) => stats.totalGamesPlayed >= 50,
  },
  {
    id: 'dedication',
    title: 'DEDICATION',
    description: 'Play 3 days in a row',
    icon: '📅',
    condition: (stats) => stats.consecutiveDays >= 3,
  },
  {
    id: 'addiction',
    title: 'ADDICTION',
    description: 'Play 7 days in a row',
    icon: '🔗',
    condition: (stats) => stats.consecutiveDays >= 7,
  },
  {
    id: 'sigma_grindset',
    title: 'SIGMA GRINDSET',
    description: 'Reach SIGMA rank',
    icon: '🗿',
    condition: (stats) => stats.totalAuraGained >= 20000,
  },
  {
    id: 'gigachad',
    title: 'GIGACHAD',
    description: 'Reach GIGACHAD rank',
    icon: '💎',
    condition: (stats) => stats.totalAuraGained >= 50000,
  },
  {
    id: 'eldritch',
    title: 'ELDRITCH ASCENSION',
    description: 'Reach ELDRITCH GOD rank',
    icon: '👁️',
    condition: (stats) => stats.totalAuraGained >= 100000,
  },
  {
    id: 'safe_player',
    title: 'PLAY IT SAFE',
    description: 'Choose SAFE 30 times',
    icon: '🛡️',
    condition: (stats) => stats.safeChoices >= 30,
  },
  {
    id: 'survivor',
    title: 'SURVIVOR',
    description: 'Complete a game without going negative',
    icon: '🏆',
    condition: (stats) => stats.totalAuraLost === 0 && stats.totalDecisions >= 10,
  },
];

// Daily challenges generator
export const generateDailyChallenges = (date: string): DailyChallenge[] => {
  const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const challenges = [
    {
      id: 'daily_scenarios',
      description: 'Complete 10 scenarios',
      target: 10,
      reward: 500,
    },
    {
      id: 'daily_streak',
      description: 'Reach a 5 streak',
      target: 5,
      reward: 1000,
    },
    {
      id: 'daily_aura',
      description: 'Gain 2000 total Aura',
      target: 2000,
      reward: 800,
    },
    {
      id: 'daily_risks',
      description: 'Win 3 RISK choices',
      target: 3,
      reward: 1500,
    },
  ];

  // Rotate challenges based on day
  const selectedChallenges = challenges.slice(0, 3).map((c, i) => ({
    ...c,
    id: `${c.id}_${date}`,
    progress: 0,
    completed: false,
    date,
  }));

  return selectedChallenges;
};

// Power-up definitions
export const DEFAULT_POWERUPS: PowerUp[] = [
  {
    id: 'shield',
    name: 'SHIELD',
    description: 'Protect from next negative outcome',
    icon: '🛡️',
    count: 1,
    effect: 'negate_loss',
  },
  {
    id: 'multiplier',
    name: '2X MULTIPLIER',
    description: 'Double next Aura gain',
    icon: '✨',
    count: 1,
    effect: 'double_gain',
  },
  {
    id: 'reroll',
    name: 'REROLL',
    description: 'Get a new scenario',
    icon: '🔄',
    count: 1,
    effect: 'reroll_scenario',
  },
];

// Storage helpers
export const saveStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
};

export const loadStats = (): GameStats => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : getDefaultStats();
  } catch (e) {
    console.error('Failed to load stats:', e);
    return getDefaultStats();
  }
};

export const saveAchievements = (achievements: Achievement[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
};

export const loadAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize with all achievements locked
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: false,
    }));
  } catch (e) {
    console.error('Failed to load achievements:', e);
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: false,
    }));
  }
};

export const checkAchievements = (stats: GameStats, currentAchievements: Achievement[]): Achievement[] => {
  const updated = currentAchievements.map(achievement => {
    if (!achievement.unlocked) {
      const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === achievement.id);
      if (def && def.condition(stats)) {
        return {
          ...achievement,
          unlocked: true,
          unlockedDate: new Date().toISOString(),
        };
      }
    }
    return achievement;
  });
  return updated;
};

export const saveDailyChallenges = (challenges: DailyChallenge[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGES, JSON.stringify(challenges));
  } catch (e) {
    console.error('Failed to save daily challenges:', e);
  }
};

export const loadDailyChallenges = (): DailyChallenge[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES);
    const today = new Date().toISOString().split('T')[0];

    if (saved) {
      const challenges = JSON.parse(saved);
      // Check if challenges are for today
      if (challenges.length > 0 && challenges[0].date === today) {
        return challenges;
      }
    }

    // Generate new challenges for today
    return generateDailyChallenges(today);
  } catch (e) {
    console.error('Failed to load daily challenges:', e);
    const today = new Date().toISOString().split('T')[0];
    return generateDailyChallenges(today);
  }
};

export const savePowerUps = (powerups: PowerUp[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.POWERUPS, JSON.stringify(powerups));
  } catch (e) {
    console.error('Failed to save power-ups:', e);
  }
};

export const loadPowerUps = (): PowerUp[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.POWERUPS);
    return saved ? JSON.parse(saved) : DEFAULT_POWERUPS;
  } catch (e) {
    console.error('Failed to load power-ups:', e);
    return DEFAULT_POWERUPS;
  }
};

export const updateConsecutiveDays = (lastDate: string): number => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastDate === today) {
    // Same day, don't increment
    const stats = loadStats();
    return stats.consecutiveDays;
  } else if (lastDate === yesterday) {
    // Consecutive day
    const stats = loadStats();
    return stats.consecutiveDays + 1;
  } else {
    // Streak broken
    return 1;
  }
};
