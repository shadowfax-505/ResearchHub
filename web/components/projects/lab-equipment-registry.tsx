'use client';

import { Microscope, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export function LabEquipmentRegistry() {
  const items = [
    { name: 'Titan Krios G4 Cryo-EM', institution: 'Stanford University (Bio-X)', location: 'Building 3, Room 102', status: 'Available', cost: '$120 / hr' },
    { name: 'Illumina NovaSeq X Plus', institution: 'MIT Broad Institute', location: 'Lab 4B', status: 'Booked until Aug 5', cost: '$85 / run' },
    { name: 'Nvidia H100 8-GPU Node', institution: 'ETH Zürich AI Center', location: 'Server Hall B', status: 'Available', cost: '$4.50 / node-hr' }
  ];

  return (
    <div className="my-6 p-5 border border-line rounded-sm bg-white dark:bg-darkCard dark:border-darkLine shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
        <div className="flex items-center gap-2">
          <Microscope size={20} className="text-primary" />
          <h3 className="font-bold text-sm text-ink dark:text-white">
            Inter-Institutional Shared Laboratory Equipment Registry
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">3 Shared Devices Open</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 rounded border border-slate-200 bg-slate-50 dark:border-darkLine dark:bg-darkPanel space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-xs text-ink dark:text-white">{item.name}</h4>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                item.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {item.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">{item.institution}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={11} /> {item.location}</p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-bold text-primary font-mono">{item.cost}</span>
              <button
                onClick={() => alert(`Booking request initiated for ${item.name}`)}
                className="px-2.5 py-1 bg-primary text-white rounded text-[11px] font-bold hover:bg-primaryDark transition"
              >
                Book Device Slot
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
