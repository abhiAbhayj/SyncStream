import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export default function SolidSelect({
  value,
  onChange,
  options = [],
  icon: Icon,
  iconClassName = 'text-accentCyan',
  prefixLabel = '',
  align = 'right',
  searchable = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  title,
  ariaLabel
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)) || options[0] || null,
    [options, value]
  );

  const showSearch = searchable || options.length > 10;

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase().trim();
    return options.filter((opt) => String(opt.label).toLowerCase().includes(q));
  }, [options, searchTerm]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      return;
    }
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    document.addEventListener('keydown', handleEscape);
    const focusTimer = showSearch ? setTimeout(() => searchInputRef.current?.focus(), 40) : null;
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [open, showSearch]);

  const handleSelect = (nextVal) => {
    onChange(nextVal);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${open ? 'z-50' : 'z-20'} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={title}
        aria-label={ariaLabel || prefixLabel || 'Select option'}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border-2 text-xs font-bold transition-colors duration-150 cursor-pointer focus:outline-none ${
          open
            ? 'bg-[#121c38] border-accentCyan text-white shadow-lg'
            : 'bg-[#0d1428] border-slate-600 text-white hover:border-accentCyan hover:bg-[#121c38]'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${iconClassName}`} />}
          {prefixLabel && (
            <span className="text-[11px] font-bold text-slate-300 hidden md:inline shrink-0">
              {prefixLabel}
            </span>
          )}
          <span className="truncate text-white font-extrabold">
            {selectedOption ? selectedOption.label : 'Select'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180 text-accentCyan' : 'text-slate-300'
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute top-full mt-2 min-w-[200px] w-max max-w-[calc(100vw-2rem)] rounded-xl bg-[#0c1224] border-2 border-accentCyan shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden z-50 ${
            align === 'left' ? 'left-0' : 'right-0'
          } ${menuClassName}`}
        >
          {showSearch && (
            <div className="p-2 border-b border-slate-700 bg-[#090e1d]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-300 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#141d38] border border-slate-500 focus:border-accentCyan rounded-lg pl-8 pr-7 py-1.5 text-xs font-medium text-white placeholder-slate-400 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 bg-[#0c1224]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-accentCyan text-black font-extrabold'
                        : 'bg-[#0c1224] text-white font-semibold hover:bg-[#1a2648]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-300 font-medium">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
