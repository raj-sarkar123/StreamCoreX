import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Platform = 'youtube' | 'instagram';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onSelect: (platform: Platform) => void;
  disabled?: boolean;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
      {/* YouTube Card */}
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => onSelect('youtube')}
        className={cn(
          'relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 outline-none',
          selectedPlatform === 'youtube'
            ? 'bg-zinc-900/90 border-red-500/80 shadow-glow-red ring-1 ring-red-500/50'
            : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {selectedPlatform === 'youtube' && (
          <div className="absolute top-3.5 right-3.5 text-red-500">
            <CheckCircle2 className="w-5 h-5 fill-red-500/20" />
          </div>
        )}
        <div className="p-3 rounded-xl bg-red-500/10 text-red-500 mb-3">
          <Youtube className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">YouTube</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Download videos you own or have permission to use.
        </p>
      </motion.button>

      {/* Instagram Card */}
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => onSelect('instagram')}
        className={cn(
          'relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 outline-none',
          selectedPlatform === 'instagram'
            ? 'bg-zinc-900/90 border-pink-500/80 shadow-glow-pink ring-1 ring-pink-500/50'
            : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {selectedPlatform === 'instagram' && (
          <div className="absolute top-3.5 right-3.5 text-pink-500">
            <CheckCircle2 className="w-5 h-5 fill-pink-500/20" />
          </div>
        )}
        <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500/10 via-pink-500/10 to-purple-500/10 text-pink-400 mb-3">
          <Instagram className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">Instagram</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Download authorized Instagram media.
        </p>
      </motion.button>
    </div>
  );
};
