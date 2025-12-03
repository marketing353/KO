import React from 'react';
import { GameStats, Achievement } from '../types';
import { Trophy, Target, Zap, Flame, TrendingUp, Calendar, Award, Share2, Home } from 'lucide-react';
import { getRank } from '../utils';

interface StatsScreenProps {
  stats: GameStats;
  achievements: Achievement[];
  onBack: () => void;
  onShare: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, achievements, onBack, onShare }) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const winRate = stats.totalGamesPlayed > 0
    ? ((stats.gamesWon / stats.totalGamesPlayed) * 100).toFixed(1)
    : 0;
  const riskSuccessRate = stats.risksTaken > 0
    ? ((stats.risksWon / stats.risksTaken) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen flex flex-col p-4 text-white animate-fadeIn relative z-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 text-aura-gray hover:text-aura-green transition-colors"
        >
          <Home size={24} />
        </button>
        <h1 className="text-3xl font-display font-black text-aura-green">STATS</h1>
        <button
          onClick={onShare}
          className="p-2 text-aura-gray hover:text-aura-gold transition-colors"
        >
          <Share2 size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/50 border border-aura-green p-4 backdrop-blur-sm">
            <p className="text-aura-gray text-xs uppercase tracking-wider mb-1">Games Played</p>
            <p className="text-3xl font-mono font-bold text-aura-green">{stats.totalGamesPlayed}</p>
          </div>
          <div className="bg-black/50 border border-aura-gold p-4 backdrop-blur-sm">
            <p className="text-aura-gray text-xs uppercase tracking-wider mb-1">Win Rate</p>
            <p className="text-3xl font-mono font-bold text-aura-gold">{winRate}%</p>
          </div>
          <div className="bg-black/50 border border-aura-red p-4 backdrop-blur-sm">
            <p className="text-aura-gray text-xs uppercase tracking-wider mb-1">Highest Streak</p>
            <p className="text-3xl font-mono font-bold text-aura-red">{stats.highestStreak}</p>
          </div>
          <div className="bg-black/50 border border-aura-light p-4 backdrop-blur-sm">
            <p className="text-aura-gray text-xs uppercase tracking-wider mb-1">Daily Streak</p>
            <p className="text-3xl font-mono font-bold text-aura-light">{stats.consecutiveDays}</p>
          </div>
        </div>

        {/* Decision Breakdown */}
        <div className="bg-black/50 border border-aura-gray p-6 backdrop-blur-sm">
          <h2 className="text-xl font-display font-bold text-aura-light mb-4 flex items-center gap-2">
            <Target size={20} /> DECISION ANALYSIS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
            <div>
              <p className="text-aura-gray mb-1">Safe Choices</p>
              <p className="text-2xl text-aura-green">🛡️ {stats.safeChoices}</p>
            </div>
            <div>
              <p className="text-aura-gray mb-1">Risks Taken</p>
              <p className="text-2xl text-aura-red">⚠️ {stats.risksTaken}</p>
              <p className="text-xs text-aura-gray mt-1">Success Rate: {riskSuccessRate}%</p>
            </div>
            <div>
              <p className="text-aura-gray mb-1">Wild Choices</p>
              <p className="text-2xl text-aura-gold">✨ {stats.wildChoices}</p>
            </div>
          </div>
        </div>

        {/* Aura Stats */}
        <div className="bg-black/50 border border-aura-gray p-6 backdrop-blur-sm">
          <h2 className="text-xl font-display font-bold text-aura-light mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> AURA BREAKDOWN
          </h2>
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <p className="text-aura-gray mb-1">Total Gained</p>
              <p className="text-2xl text-aura-green">+{stats.totalAuraGained.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-aura-gray mb-1">Total Lost</p>
              <p className="text-2xl text-aura-red">{stats.totalAuraLost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-black/50 border border-aura-gold p-6 backdrop-blur-sm">
          <h2 className="text-xl font-display font-bold text-aura-light mb-4 flex items-center gap-2">
            <Award size={20} /> ACHIEVEMENTS ({unlockedAchievements.length}/{achievements.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-3 border ${
                  achievement.unlocked
                    ? 'border-aura-gold bg-aura-gold/10'
                    : 'border-aura-gray/30 bg-black/30 opacity-50'
                } backdrop-blur-sm transition-all hover:scale-105`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <p className={`text-xs font-mono font-bold ${
                  achievement.unlocked ? 'text-aura-gold' : 'text-aura-gray'
                }`}>
                  {achievement.title}
                </p>
                <p className="text-xs text-aura-gray mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Other Stats */}
        <div className="bg-black/50 border border-aura-gray p-6 backdrop-blur-sm">
          <h2 className="text-xl font-display font-bold text-aura-light mb-4 flex items-center gap-2">
            <Zap size={20} /> MISCELLANEOUS
          </h2>
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <p className="text-aura-gray mb-1">Total Decisions</p>
              <p className="text-xl text-aura-light">{stats.totalDecisions}</p>
            </div>
            <div>
              <p className="text-aura-gray mb-1">Timeouts</p>
              <p className="text-xl text-aura-red">{stats.timeouts}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsScreen;
