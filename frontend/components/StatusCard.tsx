import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, RotateCcw, FileVideo, HardDrive, Gauge, Clock, Download } from 'lucide-react';
import { ProgressResponse } from '@/lib/api';

export type AppStateStatus = 'idle' | 'validating' | 'processing' | 'downloading' | 'completed' | 'error';

interface StatusCardProps {
  status: AppStateStatus;
  progressInfo: ProgressResponse | null;
  errorMessage: string;
  onReset: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  progressInfo,
  errorMessage,
  onReset,
}) => {
  if (status === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.25 }}
        className="w-full mt-5 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md"
      >
        {/* Validating State */}
        {status === 'validating' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <h3 className="text-base font-medium text-white">Validating URL...</h3>
            <p className="text-xs text-zinc-400">Verifying link accessibility and format</p>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <h3 className="text-base font-medium text-white">Processing your video...</h3>
            <p className="text-xs text-zinc-400">Fetching media metadata and format streams</p>
          </div>
        )}

        {/* Downloading State */}
        {status === 'downloading' && (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <h3 className="text-sm font-semibold text-white">Downloading...</h3>
              </div>
              <span className="text-sm font-bold text-indigo-400">
                {progressInfo?.progress ? `${Math.round(progressInfo.progress)}%` : '0%'}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progressInfo?.progress || 0}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-zinc-400">
              <div className="flex items-center space-x-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800">
                <HardDrive className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span className="truncate">{progressInfo?.downloaded_size_str || '0 B'}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800">
                <Gauge className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span className="truncate">{progressInfo?.speed_str || '0 B/s'}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                <span className="truncate">
                  {progressInfo?.eta !== null && progressInfo?.eta !== undefined
                    ? `${progressInfo.eta}s ETA`
                    : 'Calculating...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'completed' && (
          <div className="flex flex-col items-center space-y-4 text-center py-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              <CheckCircle className="w-8 h-8" />
            </motion.div>

            <div>
              <h3 className="text-lg font-bold text-white">Download completed!</h3>
              <p className="text-xs text-zinc-400 mt-1">Check your browser&apos;s Downloads for the saved file</p>
            </div>

            {/* File Info Box */}
            <div className="w-full p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-left space-y-1.5">
              <div className="flex items-start space-x-2.5">
                <FileVideo className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {progressInfo?.file_name || progressInfo?.title || 'Downloaded Video'}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    File Size: {progressInfo?.file_size_str || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={onReset}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Another</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 text-center py-2">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Unable to process this URL</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                {errorMessage || 'Please verify that the video is public, accessible, and matches the selected platform.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors border border-zinc-700 mt-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
