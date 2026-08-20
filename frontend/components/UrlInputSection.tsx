import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Link2 } from 'lucide-react';
import { Platform } from './PlatformSelector';
import { cn } from '@/lib/utils';

interface UrlInputSectionProps {
  platform: Platform;
  url: string;
  onChangeUrl: (val: string) => void;
  onClear: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  isValid: boolean;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  platform,
  url,
  onChangeUrl,
  onClear,
  onDownload,
  isDownloading,
  isValid,
}) => {
  const platformLabel = platform === 'youtube' ? 'YouTube' : 'Instagram';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && !isDownloading) {
      onDownload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-4 w-full"
    >
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-zinc-300 flex items-center space-x-2">
          <Link2 className="w-4 h-4 text-indigo-400" />
          <span>Paste your {platformLabel} video URL</span>
        </label>
        
        <div className="relative flex items-center w-full">
          <input
            type="url"
            value={url}
            onChange={(e) => onChangeUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDownloading}
            placeholder="Paste video URL here..."
            className={cn(
              'w-full px-4 py-3.5 pr-12 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none transition-all duration-200',
              'focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20',
              isDownloading && 'opacity-60 cursor-not-allowed'
            )}
          />
          
          {url && !isDownloading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <motion.button
        type="button"
        disabled={!isValid || isDownloading}
        whileHover={{ scale: isValid && !isDownloading ? 1.01 : 1 }}
        whileTap={{ scale: isValid && !isDownloading ? 0.99 : 1 }}
        onClick={onDownload}
        className={cn(
          'w-full py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg transition-all duration-300 outline-none',
          isValid && !isDownloading
            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white shadow-indigo-500/25 cursor-pointer'
            : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-800'
        )}
      >
        <Download className="w-5 h-5" />
        <span>Download Video</span>
      </motion.button>
    </motion.div>
  );
};
