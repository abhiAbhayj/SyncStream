import React from 'react';
import { Server, ChevronDown, ChevronUp } from 'lucide-react';

export default function ServerSelector({
  servers = [],
  activeServer,
  onSelectServer,
  showAllServers,
  onToggleAllServers,
  isParty = false
}) {
  const primaryServers = servers.slice(0, 5);
  const remainingCount = Math.max(0, servers.length - 5);
  const visibleServers = showAllServers ? servers : primaryServers;
  const activeObj = servers.find((s) => s.key === activeServer);

  return (
    <div className="rounded-xl border border-white/10 bg-darkCard/85 px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-lg space-y-2">
      {/* Compact Header Row */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Server className="w-3.5 h-3.5 text-accentCyan shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider shrink-0">
            Servers
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] sm:text-[10px] font-mono font-semibold text-emerald-400 shrink-0">
            {servers.length}
          </span>
          <span className="text-[10px] sm:text-[11px] text-gray-400 truncate">
            {activeObj ? `#${activeObj.num} ${activeObj.name}` : activeServer}
          </span>
          {isParty && (
            <span className="hidden md:inline-block text-[10px] text-accentPurple/90 font-mono shrink-0">
              • Party Sync
            </span>
          )}
        </div>

        {remainingCount > 0 && (
          <button
            type="button"
            onClick={onToggleAllServers}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-accentCyan/40 text-[10px] sm:text-[11px] font-semibold text-gray-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <span>{showAllServers ? 'Less' : `All ${servers.length}`}</span>
            {showAllServers ? (
              <ChevronUp className="w-3 h-3 text-accentPurple" />
            ) : (
              <ChevronDown className="w-3 h-3 text-accentCyan" />
            )}
          </button>
        )}
      </div>

      {/* Compact Responsive Grid: Mobile 3 cols | Tablet/Laptop 5-6 cols */}
      <div
        className={`grid gap-1.5 ${
          showAllServers
            ? 'grid-cols-3 sm:grid-cols-5'
            : 'grid-cols-3 md:grid-cols-6'
        }`}
      >
        {visibleServers.map((server, idx) => {
          const isActive = activeServer === server.key;
          const isExtended = idx >= 5;
          const activeClass = isExtended
            ? 'border-accentPurple bg-accentPurple/15 text-white ring-1 ring-accentPurple/35'
            : 'border-accentCyan bg-accentCyan/15 text-white ring-1 ring-accentCyan/35';

          return (
            <button
              key={server.key}
              type="button"
              onClick={() => onSelectServer(server.key)}
              title={`${server.label} — ${server.description || server.badge}`}
              className={`group text-left px-2 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-center gap-0.5 min-w-0 active:scale-[0.98] ${
                isActive
                  ? activeClass
                  : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span
                  className={`text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ${
                    isActive
                      ? isExtended
                        ? 'text-accentPurple'
                        : 'text-accentCyan'
                      : 'text-gray-500'
                  }`}
                >
                  #{server.num}
                </span>
                <span
                  className={`text-[8px] sm:text-[9px] font-medium truncate ${
                    isActive
                      ? isExtended
                        ? 'text-purple-200'
                        : 'text-cyan-200'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                >
                  {server.badge}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold leading-tight truncate w-full">
                {server.name}
              </div>
            </button>
          );
        })}

        {!showAllServers && remainingCount > 0 && (
          <button
            type="button"
            onClick={onToggleAllServers}
            className="text-left px-2 py-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.06] hover:border-accentCyan/40 text-gray-300 hover:text-accentCyan transition cursor-pointer flex flex-col justify-center gap-0.5 min-w-0 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-accentCyan">
                +{remainingCount}
              </span>
              <ChevronDown className="w-3 h-3 text-accentCyan shrink-0" />
            </div>
            <div className="text-[11px] sm:text-xs font-semibold leading-tight truncate w-full">
              More Servers
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
