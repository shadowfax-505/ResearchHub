'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, FastForward, Headphones } from 'lucide-react';

interface PaperAudioPlayerProps {
  paperTitle: string;
}

export function PaperAudioPlayer({ paperTitle }: PaperAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');
  const [progress, setProgress] = useState(35);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSpeed = () => {
    setSpeed(prev => (prev === '1x' ? '1.25x' : prev === '1.25x' ? '1.5x' : '1x'));
  };

  return (
    <div className="my-4 p-4 border border-primary/20 bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-slate-50 rounded-md dark:from-darkPanel dark:to-darkCard dark:border-primary/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primaryDark transition shadow"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div>
          <h4 className="font-bold text-xs text-ink dark:text-white flex items-center gap-1.5">
            <Headphones size={14} className="text-primary" /> 3-Minute AI Audio Podcast Overview
          </h4>
          <p className="text-[11px] text-slate-500 line-clamp-1">{paperTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {/* Waveform Bar Simulation */}
        <div className="flex items-center gap-0.5 h-6 cursor-pointer" onClick={() => setProgress((progress + 15) % 100)}>
          {[40, 75, 30, 90, 60, 100, 45, 80, 55, 35, 70, 95, 50, 65, 30, 85].map((h, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all ${
                idx * 6.25 <= progress ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSpeed}
          className="px-2 py-1 bg-white border border-slate-200 dark:bg-darkCard dark:border-darkLine rounded text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary shrink-0"
        >
          {speed}
        </button>
      </div>
    </div>
  );
}
