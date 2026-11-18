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
      {/* Trigger Pill */}
      <div
        className={`group flex items-center justify-between gap-2 w-full rounded-xl border transition-all duration-200 backdrop-blur-md ${
          open
            ? 'bg-[#0e1630] border-accentCyan shadow-[0_0_20px_rgba(var(--accent-cyan),0.35)]'
            : isActive
            ? 'bg-accentCyan/12 border-accentCyan/70 shadow-[0_0_14px_rgba(var(--accent-cyan),0.22)] hover:border-accentCyan'
            : 'bg-[#0b1024]/90 border-white/15 hover:border-accentCyan/60 hover:bg-[#0f1630]'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center justify-between gap-2 flex-1 min-w-0 px-3 py-2 sm:px-3.5 sm:py-2.5 text-left cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <Icon
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isActive || open ? 'text-accentCyan' : 'text-gray-400 group-hover:text-accentCyan'
                }`}
              />
            )}
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">
                {label}
              </span>
              <span
                className={`text-xs sm:text-[13px] font-bold truncate ${
                  isActive ? 'text-accentCyan' : 'text-white'
                }`}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              open ? 'rotate-180 text-accentCyan' : 'text-gray-400 group-hover:text-white'
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
            className="mr-2 p-1 rounded-lg bg-white/10 hover:bg-accentPink/25 text-gray-300 hover:text-accentPink transition cursor-pointer shrink-0"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Floating Glass Popover */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 sm:right-auto sm:min-w-[230px] mt-2 rounded-2xl bg-[#0a0f22]/98 border border-accentCyan/40 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_24px_rgba(var(--accent-cyan),0.18)] backdrop-blur-2xl overflow-hidden animate-fade-in z-50"
        >
          {/* Optional Built-in Search for Long Lists */}
          {showSearch && (
            <div className="p-2 border-b border-white/10 bg-white/[0.02]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Filter ${label.toLowerCase()}...`}
                  className="w-full bg-[#060916] border border-white/10 focus:border-accentCyan/70 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-gray-400 hover:text-white cursor-pointer"
                    aria-label="Clear filter search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable Option List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {!searchTerm.trim() && (
              <button
                type="button"
                role="option"
                aria-selected={!isActive}
                onClick={() => handleSelect('')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  !isActive
                    ? 'bg-accentCyan/20 text-accentCyan border border-accentCyan/40'
                    : 'text-gray-300 hover:bg-white/[0.07] hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate">{placeholder}</span>
                {!isActive && <Check className="w-3.5 h-3.5 text-accentCyan shrink-0" />}
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
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-accentCyan/20 text-accentCyan font-bold border border-accentCyan/40'
                        : 'text-gray-200 hover:bg-white/[0.07] hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accentCyan shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-5 text-center text-xs text-gray-500 font-medium">
                No matching {label.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
