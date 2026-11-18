import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export default function FilterDropdown({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder = 'All',
  searchable = false,
  className = ''
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.key) === String(value)) || null,
    [options, value]
  );

  const isActive = Boolean(value);
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
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    const focusTimer = showSearch ? setTimeout(() => searchInputRef.current?.focus(), 40) : null;
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [open, showSearch]);

  const handleSelect = (nextVal) => {
    onChange(nextVal);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${open ? 'z-50' : 'z-10'} ${className}`}>
      {/* Solid High-Contrast Trigger Button */}
      <div
        className={`flex items-center justify-between gap-2 w-full rounded-xl border-2 transition-colors duration-150 ${
          open
            ? 'bg-[#121c38] border-accentCyan shadow-lg'
            : isActive
            ? 'bg-[#111b36] border-accentCyan'
            : 'bg-[#0d1428] border-slate-600 hover:border-accentCyan hover:bg-[#121c38]'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center justify-between gap-2 flex-1 min-w-0 px-3.5 py-2.5 text-left cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive || open ? 'text-accentCyan' : 'text-cyan-400'
                }`}
              />
            )}
            <div className="flex flex-col min-w-0 leading-snug">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {label}
              </span>
              <span
                className={`text-sm font-bold truncate ${
                  isActive ? 'text-accentCyan' : 'text-white'
                }`}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
              open ? 'rotate-180 text-accentCyan' : 'text-slate-200'
            }`}
          />
        </button>

        {isActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('');
            }}
            title={`Clear ${label}`}
            aria-label={`Clear ${label}`}
            className="mr-2 p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* 100% Solid Opaque High-Contrast Dropdown Menu (Zero Glass Bleed-Through) */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 sm:right-auto sm:min-w-[240px] mt-2 rounded-xl bg-[#0c1224] border-2 border-accentCyan shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden z-50"
        >
          {/* Solid Built-in Search Input for Long Lists */}
          {showSearch && (
            <div className="p-2.5 border-b border-slate-700 bg-[#090e1d]">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-300 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full bg-[#141d38] border border-slate-500 focus:border-accentCyan rounded-lg pl-9 pr-8 py-2 text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Clear filter search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable High-Contrast Option List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 bg-[#0c1224]">
            {!searchTerm.trim() && (
              <button
                type="button"
                role="option"
                aria-selected={!isActive}
                onClick={() => handleSelect('')}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  !isActive
                    ? 'bg-accentCyan text-black font-extrabold'
                    : 'bg-[#0c1224] text-white font-semibold hover:bg-[#1a2648]'
                }`}
              >
                <span className="truncate">{placeholder}</span>
                {!isActive && <Check className="w-4 h-4 text-black stroke-[2.5] shrink-0" />}
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.key) === String(value);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(String(opt.key))}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-accentCyan text-black font-extrabold'
                        : 'bg-[#0c1224] text-white font-semibold hover:bg-[#1a2648]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-black stroke-[2.5] shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-sm text-slate-300 font-medium">
                No matching {label.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
