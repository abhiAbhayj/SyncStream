import React, { useState } from 'react';
import { Loader2, MonitorOff, HelpCircle } from 'lucide-react';

export default function EmbedPlayer({ embedUrl, title }) {
  const [loading, setLoading] = useState(true);

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl bg-darkCard border border-darkBorder text-center p-6 gap-3">
        <MonitorOff className="w-12 h-12 text-gray-500" />
        <h4 className="text-lg font-bold text-gray-300">No Streaming URL Provided</h4>
        <p className="text-sm text-gray-500 max-w-sm">No streaming configuration is available for this content type.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-darkBorder shadow-2xl">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-darkBg flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-sm text-gray-400">Connecting to streaming wrapper...</p>
        </div>
      )}

      {/* Embed IFrame */}
      <iframe
        src={embedUrl}
        title={title || 'Media Streaming Embed'}
        className="w-full h-full border-0"
        allowFullScreen
        scrolling="no"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer"

        onLoad={() => setLoading(false)}
      />

      {/* Info popover */}
      <div className="absolute top-4 right-4 z-20 group">
        <div className="bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white p-2 rounded-full cursor-help backdrop-blur-md border border-white/5 transition">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="absolute right-0 mt-2 w-64 bg-darkCard border border-darkBorder rounded-xl p-3 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-30 font-medium">
          Note: This player loads content from third-party streaming wrappers. If it fails to load, refresh the page or configure custom media sync links.
        </div>
      </div>
    </div>
  );
}
