import React, { useState, useRef } from "react";

export default function PowerBIEmbed({ src, title = "PowerBI Report" }){
  const [loading, setLoading] = useState(true);
  const frameRef = useRef();

  return (
    <div className="card">
      <div className="h-card" style={{marginBottom:12}}>
        <div>
          <div style={{fontWeight:700}}>{title}</div>
          <div className="small">Interactive Power BI report</div>
        </div>

        <div style={{display:"flex", gap:8}}>
          <button className="btn" onClick={() => {
            if(frameRef.current) {
              frameRef.current.contentWindow.location.reload();
              setLoading(true);
            }
          }}>Refresh</button>

          <button className="btn" onClick={() => {
            const el = frameRef.current;
            if(!el) return;
            if (el.requestFullscreen) el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
          }}>Fullscreen</button>
        </div>
      </div>

      <div className="embed-frame card" style={{padding:0}}>
        {loading && (
          <div style={{
            position:"absolute", left:0, right:0, top:0, bottom:0,
            display:"grid", placeItems:"center", zIndex:2, background:"linear-gradient(180deg, rgba(255,255,255,0.6), rgba(247,249,252,0.6))"
          }}>
            <div>
              <div style={{fontWeight:700, marginBottom:6}}>Loading report…</div>
              <div className="small">If you need to sign-in, Power BI will prompt you in the embed.</div>
            </div>
          </div>
        )}

        <iframe
          ref={frameRef}
          title={title}
          src={src}
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
