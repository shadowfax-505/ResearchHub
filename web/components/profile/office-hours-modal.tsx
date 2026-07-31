'use client';

import { useState } from 'react';
import { Calendar, Clock, Video, Check, X, User } from 'lucide-react';

interface OfficeHoursModalProps {
  scholarName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficeHoursModal({ scholarName, isOpen, onClose }: OfficeHoursModalProps) {
  const [date, setDate] = useState('2026-08-05');
  const [slot, setSlot] = useState('14:00 - 14:15 EST');
  const [booked, setBooked] = useState(false);

  if (!isOpen) return null;

  function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setBooked(true);
    setTimeout(() => {
      onClose();
      setBooked(false);
      alert(`Virtual Office Hours appointment confirmed with ${scholarName}! Invitation sent to calendar.`);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-line dark:border-darkLine pb-3">
          <div className="flex items-center gap-2">
            <Video className="text-primary" size={20} />
            <h3 className="font-bold text-base text-ink dark:text-white">
              Schedule 15-Min Virtual Office Hours
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleBooking} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Scholar</label>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-100 dark:bg-darkPanel font-bold text-ink dark:text-white">
              <User size={14} className="text-primary" /> {scholarName}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded border border-line bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Available 15-Min Time Slots</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full p-2.5 rounded border border-line bg-slate-50 dark:bg-darkPanel dark:border-darkLine dark:text-white outline-none"
            >
              <option value="10:00 - 10:15 EST">10:00 - 10:15 EST (Open)</option>
              <option value="14:00 - 14:15 EST">14:00 - 14:15 EST (Open)</option>
              <option value="16:30 - 16:45 EST">16:30 - 16:45 EST (Open)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line dark:border-darkLine">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={booked}
              className="px-4 py-1.5 bg-primary text-white font-bold rounded-md hover:bg-primaryDark transition flex items-center gap-1.5"
            >
              {booked ? <Check size={14} /> : <Calendar size={14} />}
              {booked ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
