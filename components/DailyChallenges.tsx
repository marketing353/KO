import React from 'react';
import { DailyChallenge } from '../types';
import { Calendar, CheckCircle, Circle } from 'lucide-react';

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  compact?: boolean;
}

const DailyChallenges: React.FC<DailyChallengesProps> = ({ challenges, compact = false }) => {
  const allCompleted = challenges.every(c => c.completed);

  if (compact) {
    const completedCount = challenges.filter(c => c.completed).length;
    return (
      <div className="bg-black/50 border border-aura-gold p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-aura-gold" />
            <span className="text-sm font-mono text-aura-light">Daily Challenges</span>
          </div>
          <span className="text-xs font-mono text-aura-gold">
            {completedCount}/{challenges.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 border-2 border-aura-gold p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={24} className="text-aura-gold" />
        <h2 className="text-2xl font-display font-black text-aura-gold">DAILY CHALLENGES</h2>
        {allCompleted && <span className="text-xs bg-aura-gold text-black px-2 py-1 font-mono">COMPLETED</span>}
      </div>

      <div className="space-y-3">
        {challenges.map(challenge => (
          <div
            key={challenge.id}
            className={`p-4 border ${
              challenge.completed
                ? 'border-aura-green bg-aura-green/10'
                : 'border-aura-gray bg-black/30'
            } backdrop-blur-sm transition-all`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {challenge.completed ? (
                    <CheckCircle size={16} className="text-aura-green" />
                  ) : (
                    <Circle size={16} className="text-aura-gray" />
                  )}
                  <p className={`text-sm font-mono ${
                    challenge.completed ? 'text-aura-green' : 'text-aura-light'
                  }`}>
                    {challenge.description}
                  </p>
                </div>
                <div className="ml-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-black border border-aura-gray overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          challenge.completed ? 'bg-aura-green' : 'bg-aura-gold'
                        }`}
                        style={{
                          width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-aura-gray whitespace-nowrap">
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                  {!challenge.completed && (
                    <p className="text-xs text-aura-gold font-mono">
                      Reward: +{challenge.reward} Aura
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!allCompleted && (
        <p className="mt-4 text-xs text-aura-gray font-mono text-center">
          Challenges reset daily at midnight
        </p>
      )}
    </div>
  );
};

export default DailyChallenges;
