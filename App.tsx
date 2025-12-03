import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ScenarioCard from './components/ScenarioCard';
import OptionButton from './components/OptionButton';
import Feedback from './components/Feedback';
import StatsScreen from './components/StatsScreen';
import DailyChallenges from './components/DailyChallenges';
import AchievementPopup from './components/AchievementPopup';
import PowerUpSelector from './components/PowerUpSelector';
import { GameState, Option, Scenario, GameStats, Achievement, DailyChallenge, PowerUp } from './types';
import { SCENARIOS, INITIAL_TIME, TIMER_DECAY, TIMER_TICK_MS } from './constants';
import { getRandomScenario, getRank } from './utils';
import {
  loadStats,
  saveStats,
  loadAchievements,
  saveAchievements,
  checkAchievements,
  loadDailyChallenges,
  saveDailyChallenges,
  loadPowerUps,
  savePowerUps,
  updateConsecutiveDays,
  getDefaultStats
} from './storage';
import { Play, RotateCcw, Pause, Home, HelpCircle, X, TrendingUp, Flame } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'MENU',
    aura: 0,
    maxAura: 0,
    streak: 0,
    history: [],
    scenariosPlayed: 0,
    totalGamesPlayed: 0,
    bestRun: 0,
    lastPlayedDate: '',
    consecutiveDays: 0
  });

  const [currentScenario, setCurrentScenario] = useState<Scenario>(SCENARIOS[0]);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [feedback, setFeedback] = useState<{ msg: string, type: 'good' | 'bad' | 'neutral' } | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // New state for engagement features
  const [stats, setStats] = useState<GameStats>(getDefaultStats());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [powerups, setPowerups] = useState<PowerUp[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  const timerRef = useRef<number | null>(null);

  // Load persisted data on mount
  useEffect(() => {
    const loadedStats = loadStats();
    const loadedAchievements = loadAchievements();
    const loadedChallenges = loadDailyChallenges();
    const loadedPowerUps = loadPowerUps();

    setStats(loadedStats);
    setAchievements(loadedAchievements);
    setDailyChallenges(loadedChallenges);
    setPowerups(loadedPowerUps);

    // Update consecutive days
    const newConsecutiveDays = updateConsecutiveDays(loadedStats.lastPlayedDate);
    const today = new Date().toISOString().split('T')[0];

    if (newConsecutiveDays !== loadedStats.consecutiveDays) {
      const updatedStats = { ...loadedStats, consecutiveDays: newConsecutiveDays, lastPlayedDate: today };
      setStats(updatedStats);
      saveStats(updatedStats);
    }
  }, []);

  // Sound effects logic (simplified for React)
  const playSound = (type: 'good' | 'bad') => {
    // In a real app, we'd add audio objects here
    // But for now, we just rely on visuals
  };

  const startGame = () => {
    setGameState({
      status: 'PLAYING',
      aura: 0,
      maxAura: 0,
      streak: 0,
      history: [],
      scenariosPlayed: 0,
      totalGamesPlayed: gameState.totalGamesPlayed + 1,
      bestRun: gameState.bestRun,
      lastPlayedDate: new Date().toISOString().split('T')[0],
      consecutiveDays: gameState.consecutiveDays
    });
    setIsPaused(false);
    setShowHelp(false);
    setActivePowerUp(null);
    setSessionStartTime(Date.now());

    // Update total games played in stats
    const updatedStats = { ...stats, totalGamesPlayed: stats.totalGamesPlayed + 1 };
    setStats(updatedStats);
    saveStats(updatedStats);

    nextScenario();
  };

  const returnToMenu = () => {
    stopTimer();
    setGameState(prev => ({
      ...prev,
      status: 'MENU',
      aura: 0,
      maxAura: 0,
      streak: 0,
      history: []
    }));
    setIsPaused(false);
    setShowHelp(false);
  };

  const showStats = () => {
    setGameState(prev => ({ ...prev, status: 'STATS' }));
  };

  const hideStats = () => {
    setGameState(prev => ({ ...prev, status: 'MENU' }));
  };

  const togglePause = () => {
    if (isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
    setIsPaused(!isPaused);
  };

  const endGame = (reason: string) => {
    stopTimer();

    // Update final stats
    const playTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    const isWin = gameState.aura >= 5000; // Reached Main Character or higher

    const updatedStats: GameStats = {
      ...stats,
      totalPlayTime: stats.totalPlayTime + playTime,
      highestStreak: Math.max(stats.highestStreak, gameState.streak),
      gamesWon: isWin ? stats.gamesWon + 1 : stats.gamesWon,
      gamesLost: !isWin ? stats.gamesLost + 1 : stats.gamesLost,
    };

    setStats(updatedStats);
    saveStats(updatedStats);

    // Check for new achievements
    const updatedAchievements = checkAchievements(updatedStats, achievements);
    const newUnlocked = updatedAchievements.filter((a, i) => a.unlocked && !achievements[i]?.unlocked);

    if (newUnlocked.length > 0) {
      setAchievements(updatedAchievements);
      saveAchievements(updatedAchievements);
      // Show first new achievement
      setNewAchievement(newUnlocked[0]);
    }

    setGameState(prev => ({
      ...prev,
      status: 'GAMEOVER',
      history: [...prev.history, reason],
      bestRun: Math.max(prev.bestRun, prev.aura)
    }));
  };

  const nextScenario = useCallback(() => {
    // Clear active power-up if it was scenario-based
    if (activePowerUp === 'reroll_scenario') {
      setActivePowerUp(null);
    }

    const randomScenario = getRandomScenario(SCENARIOS);
    setCurrentScenario(randomScenario);
    setTimeLeft(INITIAL_TIME);
    setGameState(prev => ({ ...prev, scenariosPlayed: prev.scenariosPlayed + 1 }));

    // Update daily challenge for scenarios completed
    updateDailyChallengeProgress('daily_scenarios', 1);

    startTimer();
  }, [activePowerUp]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          handleTimeout();
          return 0;
        }
        return prev - TIMER_DECAY;
      });
    }, TIMER_TICK_MS);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeout = () => {
    stopTimer();

    // Track timeout in stats
    const updatedStats = { ...stats, timeouts: stats.timeouts + 1 };
    setStats(updatedStats);
    saveStats(updatedStats);

    triggerFeedback("-1000 Aura (SLOW)", 'bad');
    updateAura(-1000, 'timeout');
    shakeScreen();
    setTimeout(nextScenario, 1000);
  };

  const triggerFeedback = (msg: string, type: 'good' | 'bad' | 'neutral') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 800);
  };

  const shakeScreen = () => {
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  const updateAura = (amount: number, source: string = 'decision') => {
    setGameState(prev => {
      let finalAmount = amount;

      // Apply power-ups
      if (activePowerUp === 'double_gain' && amount > 0) {
        finalAmount = amount * 2;
        setActivePowerUp(null);
        triggerFeedback(`2X MULTIPLIER! +${finalAmount}`, 'good');
      } else if (activePowerUp === 'negate_loss' && amount < 0) {
        finalAmount = 0;
        setActivePowerUp(null);
        triggerFeedback(`SHIELD BLOCKED ${amount}!`, 'neutral');
      }

      // Apply streak multiplier (starts at streak 5)
      if (prev.streak >= 5 && amount > 0 && source !== 'timeout') {
        const multiplier = 1 + (Math.min(prev.streak, 20) * 0.05); // Up to 2x at streak 20
        finalAmount = Math.floor(finalAmount * multiplier);
      }

      const newAura = prev.aura + finalAmount;

      let newStreak = prev.streak;
      if (finalAmount > 0) {
        newStreak += 1;
      } else if (finalAmount < 0) {
        newStreak = 0;
      }

      // Update stats
      const updatedStats = { ...stats };
      if (finalAmount > 0) {
        updatedStats.totalAuraGained += finalAmount;
        // Update daily challenge for total aura
        updateDailyChallengeProgress('daily_aura', finalAmount);
      } else if (finalAmount < 0) {
        updatedStats.totalAuraLost += Math.abs(finalAmount);
      }
      setStats(updatedStats);
      saveStats(updatedStats);

      // Check Loss Conditions
      if (newAura <= -20000) {
        setTimeout(() => endGame("CANCELED FOR BEING CRINGE"), 500);
      }

      // Update streak challenge
      if (newStreak >= 5) {
        updateDailyChallengeProgress('daily_streak', newStreak, true);
      }

      return {
        ...prev,
        aura: newAura,
        streak: newStreak,
        maxAura: Math.max(prev.maxAura, newAura)
      };
    });
  };

  const handleOptionClick = (option: Option) => {
    stopTimer();
    let change = 0;
    let type: 'good' | 'bad' | 'neutral' = 'neutral';
    let msg = "";
    let isRiskWin = false;

    // Track decision stats
    const updatedStats = {
      ...stats,
      totalDecisions: stats.totalDecisions + 1,
      safeChoices: option.type === 'safe' ? stats.safeChoices + 1 : stats.safeChoices,
      risksTaken: option.type === 'risk' ? stats.risksTaken + 1 : stats.risksTaken,
      wildChoices: option.type === 'wild' ? stats.wildChoices + 1 : stats.wildChoices,
    };

    if (option.type === 'safe' || option.type === 'wild') {
      change = option.baseChange || 0;
      type = change >= 0 ? 'good' : 'bad';
      msg = change > 0 ? `+${change}` : `${change}`;
    } else if (option.type === 'risk') {
      const roll = Math.random();
      if (roll < (option.successRate || 0)) {
        change = option.winAmount || 0;
        type = 'good';
        msg = `W (+${change})`;
        isRiskWin = true;
        updatedStats.risksWon = stats.risksWon + 1;
        // Update daily challenge for risk wins
        updateDailyChallengeProgress('daily_risks', 1);
      } else {
        change = option.lossAmount || 0;
        type = 'bad';
        msg = `COOKED (${change})`;
      }
    }

    setStats(updatedStats);
    saveStats(updatedStats);

    // Check for new achievements
    const updatedAchievements = checkAchievements(updatedStats, achievements);
    const newUnlocked = updatedAchievements.filter((a, i) => a.unlocked && !achievements[i]?.unlocked);

    if (newUnlocked.length > 0) {
      setAchievements(updatedAchievements);
      saveAchievements(updatedAchievements);
      setTimeout(() => setNewAchievement(newUnlocked[0]), 1000);
    }

    updateAura(change);
    triggerFeedback(msg, type);

    if (change < 0) shakeScreen();

    setTimeout(nextScenario, 800);
  };

  // Helper functions
  const updateDailyChallengeProgress = (challengeType: string, amount: number, isMaxValue: boolean = false) => {
    const updated = dailyChallenges.map(challenge => {
      if (challenge.id.startsWith(challengeType) && !challenge.completed) {
        const newProgress = isMaxValue ? Math.max(challenge.progress, amount) : challenge.progress + amount;
        const completed = newProgress >= challenge.target;

        if (completed && !challenge.completed) {
          // Award bonus aura
          setTimeout(() => {
            updateAura(challenge.reward);
            triggerFeedback(`Daily Challenge! +${challenge.reward} Aura`, 'good');
          }, 1000);
        }

        return {
          ...challenge,
          progress: Math.min(newProgress, challenge.target),
          completed,
        };
      }
      return challenge;
    });

    setDailyChallenges(updated);
    saveDailyChallenges(updated);
  };

  const handleUsePowerUp = (powerup: PowerUp) => {
    if (powerup.count === 0) return;

    if (powerup.effect === 'reroll_scenario') {
      // Immediately reroll scenario
      setActivePowerUp(powerup.effect);
      nextScenario();
    } else {
      // Activate power-up for next decision
      setActivePowerUp(powerup.effect);
      triggerFeedback(`${powerup.name} ACTIVATED!`, 'good');
    }

    // Decrease power-up count
    const updated = powerups.map(p =>
      p.id === powerup.id ? { ...p, count: p.count - 1 } : p
    );
    setPowerups(updated);
    savePowerUps(updated);
  };

  const handleShare = () => {
    const completedChallenges = dailyChallenges.filter(c => c.completed).length;
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const winRate = stats.totalGamesPlayed > 0
      ? ((stats.gamesWon / stats.totalGamesPlayed) * 100).toFixed(1)
      : 0;

    const shareText = `±AURA STATS\n━━━━━━━━━━━━━━\n🎮 Games: ${stats.totalGamesPlayed}\n🏆 Win Rate: ${winRate}%\n🔥 Best Streak: ${stats.highestStreak}\n📅 Daily Streak: ${stats.consecutiveDays} days\n⚠️ Risk Success: ${stats.risksTaken > 0 ? ((stats.risksWon / stats.risksTaken) * 100).toFixed(1) : 0}%\n🏅 Achievements: ${unlockedAchievements}/${achievements.length}\n✅ Daily Challenges: ${completedChallenges}/${dailyChallenges.length}\n\nCurrent Rank: ${getRank(stats.totalAuraGained)}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      triggerFeedback('STATS COPIED!', 'good');
    }).catch(() => {
      triggerFeedback('COPY FAILED', 'bad');
    });
  };

  // Stats Screen
  if (gameState.status === 'STATS') {
    return (
      <StatsScreen
        stats={stats}
        achievements={achievements}
        onBack={hideStats}
        onShare={handleShare}
      />
    );
  }

  // Menu Screen
  if (gameState.status === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center z-20 relative animate-fadeIn">
        <h1 className="text-6xl sm:text-9xl font-display font-black text-white mb-2 tracking-tighter mix-blend-difference animate-glitch">
          ±AURA
        </h1>
        <p className="font-mono text-aura-green mb-12 text-lg sm:text-xl tracking-widest animate-pulse">
          SOCIAL CREDIT SIMULATOR
        </p>

        {/* Stats Summary */}
        {stats.totalGamesPlayed > 0 && (
          <div className="border border-aura-gray bg-black/50 p-4 max-w-md w-full text-left font-mono text-xs sm:text-sm text-aura-light mb-4 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-aura-gray uppercase">Games</p>
                <p className="text-aura-green font-bold">{stats.totalGamesPlayed}</p>
              </div>
              <div>
                <p className="text-aura-gray uppercase flex items-center justify-center gap-1">
                  <Flame size={12} /> Streak
                </p>
                <p className="text-aura-gold font-bold">{stats.consecutiveDays} days</p>
              </div>
              <div>
                <p className="text-aura-gray uppercase">Best Rank</p>
                <p className="text-aura-light font-bold text-xs">{getRank(stats.totalAuraGained)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Challenges */}
        <div className="max-w-md w-full mb-4">
          <DailyChallenges challenges={dailyChallenges} compact={true} />
        </div>

        <div className="border border-aura-gray bg-black/50 p-6 max-w-md w-full text-left font-mono text-sm sm:text-base text-aura-light mb-8 space-y-2 backdrop-blur-sm">
          <p className="text-aura-gold">{`> OBJECTIVE: ASCEND TO MAIN CHARACTER`}</p>
          <p className="text-aura-red">{`> CAUTION: AVOID "CRINGE" STATUS`}</p>
          <p className="text-aura-gray">{`> CURRENT RANK: ${getRank(stats.totalAuraGained)}`}</p>
          <p className="text-aura-green mt-4">{`> TIP: STREAKS GRANT BONUS AURA`}</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={startGame}
            className="group relative px-8 py-4 bg-aura-green text-black font-bold font-mono text-xl uppercase hover:bg-aura-light hover:scale-105 transition-all duration-200 shadow-lg shadow-aura-green/50"
          >
            <span className="flex items-center justify-center gap-2">
              <Play fill="currentColor" size={24} /> Start Game
            </span>
            <div className="absolute inset-0 border-2 border-white translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform -z-10"></div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={showStats}
              className="group px-4 py-3 bg-transparent border-2 border-aura-gold text-aura-gold font-bold font-mono text-base uppercase hover:bg-aura-gold/10 transition-all duration-200"
            >
              <span className="flex items-center justify-center gap-2">
                <TrendingUp size={18} /> Stats
              </span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="group px-4 py-3 bg-transparent border-2 border-aura-gray text-aura-light font-bold font-mono text-base uppercase hover:border-aura-gold hover:text-aura-gold transition-all duration-200"
            >
              <span className="flex items-center justify-center gap-2">
                <HelpCircle size={18} /> Help
              </span>
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-aura-bg border-2 border-aura-green max-w-2xl w-full p-8 relative shadow-2xl shadow-aura-green/30">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-aura-gray hover:text-aura-red transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-display font-black text-aura-green mb-6">HOW TO PLAY</h2>

              <div className="font-mono text-sm sm:text-base text-aura-light space-y-4">
                <div className="border-l-4 border-aura-green pl-4">
                  <p className="text-aura-gold font-bold mb-1">OBJECTIVE</p>
                  <p>Navigate social scenarios to gain AURA and rise through the ranks from NPC to ELDRITCH GOD.</p>
                </div>

                <div className="border-l-4 border-aura-gold pl-4">
                  <p className="text-aura-gold font-bold mb-1">DECISION TYPES</p>
                  <p className="mb-2"><span className="text-aura-green">🛡 SAFE:</span> Guaranteed outcome, usually moderate gain or loss.</p>
                  <p className="mb-2"><span className="text-aura-red">⚠️ RISK:</span> Gamble with high reward or severe punishment.</p>
                  <p><span className="text-aura-gold">✨ WILD:</span> Unpredictable chaos. Use at your own risk.</p>
                </div>

                <div className="border-l-4 border-aura-red pl-4">
                  <p className="text-aura-gold font-bold mb-1">GAME OVER</p>
                  <p>If your AURA drops to -20,000 or below, you'll be CANCELED for being cringe.</p>
                </div>

                <div className="border-l-4 border-aura-gray pl-4">
                  <p className="text-aura-gold font-bold mb-1">TIME PRESSURE</p>
                  <p>Each scenario has a timer. If you're too slow (-1000 AURA penalty), you'll be judged.</p>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full px-6 py-3 bg-aura-green text-black font-bold font-mono text-lg uppercase hover:bg-aura-light transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Game Over Screen
  if (gameState.status === 'GAMEOVER') {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const completedChallenges = dailyChallenges.filter(c => c.completed).length;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center z-20 relative bg-red-900/10 animate-fadeIn">
        <h1 className="text-5xl sm:text-8xl font-display font-black text-aura-red mb-4 tracking-tighter animate-pulse">
          CANCELED
        </h1>
        <p className="font-mono text-aura-light text-xl mb-8">
          REASON: {gameState.history[gameState.history.length - 1] || "You fell off."}
        </p>

        <div className="bg-black border-2 border-aura-gray p-8 mb-6 backdrop-blur-sm shadow-2xl">
          <p className="text-aura-gray text-xs uppercase tracking-widest mb-2">Final Aura</p>
          <p className={`text-4xl font-mono font-bold ${gameState.aura >= 0 ? 'text-aura-green' : 'text-aura-red'}`}>
            {gameState.aura}
          </p>
          <p className="text-aura-gray text-xs uppercase tracking-widest mt-4 mb-2">Peak Rank</p>
          <p className="text-xl font-mono text-aura-gold">
            {getRank(gameState.maxAura)}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-aura-gray">
            <div>
              <p className="text-aura-gray text-xs uppercase">Scenarios</p>
              <p className="text-lg font-mono text-aura-light">{gameState.scenariosPlayed}</p>
            </div>
            <div>
              <p className="text-aura-gray text-xs uppercase">Best Streak</p>
              <p className="text-lg font-mono text-aura-gold">{gameState.streak}</p>
            </div>
          </div>
        </div>

        {/* Session Summary */}
        <div className="bg-black/50 border border-aura-gray p-4 mb-6 max-w-md w-full backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="text-left">
              <p className="text-aura-gray">Achievements: {unlockedCount}/{achievements.length}</p>
              <p className="text-aura-gray">Daily Challenges: {completedChallenges}/{dailyChallenges.length}</p>
            </div>
            <div className="text-right">
              <p className="text-aura-gold">Streak: {stats.consecutiveDays} days</p>
              <p className="text-aura-light">Games: {stats.totalGamesPlayed}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={startGame}
            className="group flex-1 px-6 py-4 bg-aura-green text-black font-bold font-mono text-lg uppercase hover:bg-aura-light hover:scale-105 transition-all shadow-lg shadow-aura-green/50"
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw size={20} /> Try Again
            </span>
          </button>

          <button
            onClick={returnToMenu}
            className="group flex-1 px-6 py-4 bg-transparent border-2 border-aura-gray text-aura-light font-bold font-mono text-lg uppercase hover:border-aura-light hover:bg-aura-light/10 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <Home size={20} /> Main Menu
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Main Game Loop
  return (
    <div className={`min-h-screen flex flex-col relative z-10 transition-transform duration-75 ${isShake ? 'animate-shake' : ''}`}>
      <Header aura={gameState.aura} streak={gameState.streak} />

      {/* Pause Button */}
      <button
        onClick={togglePause}
        className="fixed top-4 right-4 z-30 p-3 bg-aura-bg/80 backdrop-blur-sm border border-aura-gray rounded-sm text-aura-light hover:text-aura-green hover:border-aura-green transition-all"
      >
        <Pause size={20} />
      </button>

      {/* Achievement Notification */}
      <AchievementPopup achievement={newAchievement} onClose={() => setNewAchievement(null)} />

      {/* Power-Ups */}
      <PowerUpSelector
        powerups={powerups}
        onUsePowerUp={handleUsePowerUp}
        disabled={!!feedback || isPaused}
      />

      {/* Streak Multiplier Indicator */}
      {gameState.streak >= 5 && (
        <div className="fixed top-20 left-4 z-30 bg-black/80 border border-aura-gold p-3 backdrop-blur-sm animate-pulse">
          <p className="text-xs text-aura-gray font-mono uppercase">Streak Bonus</p>
          <p className="text-2xl font-mono font-bold text-aura-gold">
            {(1 + (Math.min(gameState.streak, 20) * 0.05)).toFixed(2)}x
          </p>
        </div>
      )}

      {/* Active Power-Up Indicator */}
      {activePowerUp && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 bg-aura-gold text-black px-4 py-2 font-mono font-bold animate-pulse">
          {activePowerUp === 'double_gain' && '2X MULTIPLIER ACTIVE'}
          {activePowerUp === 'negate_loss' && 'SHIELD ACTIVE'}
        </div>
      )}

      {feedback && <Feedback message={feedback.msg} type={feedback.type} />}

      <main className={`flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col justify-center transition-all duration-300 ${isPaused ? 'blur-sm opacity-50' : ''}`}>
        <ScenarioCard
          text={currentScenario.text}
          timeLeft={timeLeft}
        />

        <div className="grid grid-cols-1 gap-4 w-full max-w-xl mx-auto">
          {currentScenario.options.map((opt) => (
            <OptionButton
              key={opt.id}
              option={opt}
              onClick={handleOptionClick}
              disabled={!!feedback || isPaused}
            />
          ))}
        </div>
      </main>

      {/* Pause Menu */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-aura-bg border-2 border-aura-gray max-w-md w-full p-8 relative shadow-2xl">
            <h2 className="text-4xl font-display font-black text-aura-light mb-8 text-center">PAUSED</h2>

            <div className="space-y-4">
              <button
                onClick={togglePause}
                className="w-full px-6 py-4 bg-aura-green text-black font-bold font-mono text-lg uppercase hover:bg-aura-light transition-all shadow-lg shadow-aura-green/50"
              >
                <span className="flex items-center justify-center gap-2">
                  <Play size={20} /> Resume Game
                </span>
              </button>

              <button
                onClick={returnToMenu}
                className="w-full px-6 py-4 bg-transparent border-2 border-aura-red text-aura-red font-bold font-mono text-lg uppercase hover:bg-aura-red hover:text-black transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <Home size={20} /> Exit to Menu
                </span>
              </button>
            </div>

            <p className="text-aura-gray text-xs font-mono text-center mt-6">
              Your progress will be lost if you exit
            </p>
          </div>
        </div>
      )}

      <footer className="p-4 text-center text-aura-gray text-xs font-mono uppercase tracking-widest opacity-50">
        System Ver. 2.0.4 // Aura_OS
      </footer>
    </div>
  );
};

export default App;