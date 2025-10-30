import React, { useState, useRef } from "react";

export default function PowerBIEmbed({ src, title = "Power BI Report" }){
  const [loading, setLoading] = useState(true);
  const frameRef = useRef();

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500">Interactive Power BI dashboard</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            if(frameRef.current) { frameRef.current.contentWindow.location.reload(); setLoading(true); }
          }} className="px-3 py-2 text-sm bg-slate-50 rounded-md border">Refresh</button>

          <button onClick={() => {
            const el = frameRef.current;
            if(!el) return;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
          }} className="px-3 py-2 text-sm bg-slate-50 rounded-md border">Full</button>
        </div>
      </div>

      <div className="relative" style={{minHeight: 480}}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/80 to-transparent z-10">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-xceed-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <div className="mt-3 text-sm text-slate-600">Loading report… If prompted, sign-in to Power BI.</div>
            </div>
          </div>
        )}

        <iframe
          ref={frameRef}
          title={title}
          src={src}
          onLoad={() => setLoading(false)}
          style={{width: '100%', height: 560, border: 0}}
        />
      </div>
    </div>
  );
}
