'use client';

import React, { useState, useRef, useEffect } from 'react';

interface HeaderDropdownProps {
  trigger: React.ReactNode;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  width?: string;
}

export function HeaderDropdown({ trigger, headerContent, children, footerContent, width = 'w-80' }: HeaderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-full hover:bg-canvas transition-colors focus:outline-none"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 bg-paper border border-line rounded-lg shadow-stitch z-50 ${width}`}>
          {/* Optional Header */}
          {headerContent && (
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              {headerContent}
            </div>
          )}

          {/* Body */}
          <div className="py-2">
            {children}
          </div>

          {/* Optional Footer */}
          {footerContent && (
            <div className="border-t border-line">
              {footerContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
