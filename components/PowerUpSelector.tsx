import React from 'react';
import { PowerUp } from '../types';
import { Sparkles } from 'lucide-react';

interface PowerUpSelectorProps {
  powerups: PowerUp[];
  onUsePowerUp: (powerup: PowerUp) => void;
  disabled?: boolean;
}

const PowerUpSelector: React.FC<PowerUpSelectorProps> = ({ powerups, onUsePowerUp, disabled = false }) => {
  const availablePowerUps = powerups.filter(p => p.count > 0);

  if (availablePowerUps.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-30 space-y-2">
      <p className="text-xs text-aura-gray font-mono uppercase tracking-wider flex items-center gap-1">
        <Sparkles size={12} /> Power-Ups
      </p>
      {availablePowerUps.map(powerup => (
        <button
          key={powerup.id}
          onClick={() => onUsePowerUp(powerup)}
          disabled={disabled || powerup.count === 0}
          className="group relative block w-full bg-black/80 border border-aura-gold p-3 backdrop-blur-sm hover:bg-aura-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title={powerup.description}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{powerup.icon}</span>
            <div className="text-left">
              <p className="text-xs font-mono font-bold text-aura-gold">{powerup.name}</p>
              <p className="text-xs text-aura-gray">x{powerup.count}</p>
            </div>
          </div>
          <div className="absolute left-full ml-2 bottom-0 bg-black border border-aura-gray p-2 text-xs font-mono text-aura-light whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
            {powerup.description}
          </div>
        </button>
      ))}
    </div>
  );
};

export default PowerUpSelector;
