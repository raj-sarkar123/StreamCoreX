import React from 'react';
import { Download } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 mb-6">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20">
          <Download className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Video Downloader
        </h1>
      </div>
      <p className="text-zinc-400 text-sm sm:text-base max-w-md">
        Download your authorized videos quickly and easily.
      </p>
    </div>
  );
};
