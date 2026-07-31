'use client';

import { useState } from 'react';
import { Volume2, X, Globe, Copy, Check } from 'lucide-react';

interface AudioTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperTitle?: string;
}

export function AudioTranscriptModal({ isOpen, onClose, paperTitle = 'Attention Is All You Need' }: AudioTranscriptModalProps) {
  const [lang, setLang] = useState<'en' | 'es' | 'fr' | 'de'>('en');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const transcripts: Record<string, string> = {
    en: `Welcome to ResearchHub AI Podcast Overview. In this paper titled "${paperTitle}", the authors propose the Transformer model architecture based entirely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on machine translation show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.`,
    es: `Bienvenido al resumen del podcast AI de ResearchHub. En este artículo titulado "${paperTitle}", los autores proponen la arquitectura del modelo Transformer basada enteramente en mecanismos de atención, prescindiendo por completo de la recurrencia y las convoluciones.`,
    fr: `Bienvenue dans l'aperçu du podcast AI de ResearchHub. Dans cet article intitulé "${paperTitle}", les auteurs proposent l'architecture du modèle Transformer entièrement basée sur des mécanismes d'attention, se passant totalement de récurrence et de convolutions.`,
    de: `Willkommen zum ResearchHub AI Podcast-Überblick. In dieser Arbeit mit dem Titel "${paperTitle}" schlagen die Autoren die Transformer-Modellarchitektur vor, die vollständig auf Aufmerksamkeitsmechanismen basiert und auf Rekurrenz und Faltungen verzichtet.`
  };

  function copyTranscript() {
    navigator.clipboard.writeText(transcripts[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-darkCard rounded-lg border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">AI Audio Overview Full Transcript & Translation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe size={14} className="text-primary" /> Select Audio Language:
            </label>
            <div className="flex gap-1.5">
              {[
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Spanish' },
                { code: 'fr', label: 'French' },
                { code: 'de', label: 'German' }
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition ${lang === item.code ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-darkPanel text-slate-700 dark:text-slate-300'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-darkPanel rounded border border-line dark:border-darkLine">
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {transcripts[lang]}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-darkPanel border-t border-line dark:border-darkLine flex justify-between items-center">
          <button
            onClick={copyTranscript}
            className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-xs font-bold hover:bg-slate-300 transition flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied Transcript' : 'Copy Transcript'}
          </button>
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primaryDark">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
