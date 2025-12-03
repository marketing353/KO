import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Award } from 'lucide-react';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-black border-2 border-aura-gold p-4 shadow-2xl shadow-aura-gold/50 min-w-[300px] animate-pulse">
        <div className="flex items-center gap-3">
          <Award size={24} className="text-aura-gold" />
          <div>
            <p className="text-xs text-aura-gold font-mono uppercase tracking-wider">Achievement Unlocked!</p>
            <p className="text-lg font-display font-bold text-aura-light">{achievement.title}</p>
            <p className="text-sm text-aura-gray font-mono">{achievement.icon} {achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
