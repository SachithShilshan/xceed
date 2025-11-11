// src/pages/DataManager.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * DataManager - minimal page that embeds a single Power BI visual (full page).
 * Replace POWER_BI_URL with your actual visual/report URL (the one you pasted).
 *
 * This page intentionally contains almost no other UI.
 */

const POWER_BI_URL = "https://app.powerbi.com/reportEmbed?reportId=9733564b-24a9-40dc-bcf7-113803fbe529&autoAuth=true&ctid=c1e2da04-87a7-4c79-90a9-0a2a54d6db05";

export default function DataManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If you want, you can read dept/dash query params and use them to decide which visual to show.
  // const dept = searchParams.get("dept");
  // const dash = searchParams.get("dash");

  // build full absolute URL in case you open in new window
  const openUrl = POWER_BI_URL;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* small top bar — remove or simplify if you want nothing at all */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 rounded-md border text-sm"
            title="Back"
          >
            Back
          </button>
          <div className="text-sm font-semibold">Data Manager — Power BI Visual</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(openUrl, "_blank", "noopener,noreferrer,width=1600,height=900")}
            className="px-3 py-1 rounded-md border text-sm"
          >
            Open in new window
          </button>
        </div>
      </div>

      {/* iframe fills remaining viewport */}
      <div style={{ height: "calc(100vh - 56px)" /* adjust if your header is larger */ }}>
        <iframe
          title="Data Manager Visual"
          src={POWER_BI_URL}
          style={{ width: "100%", height: "100%", border: 0 }}
          allowFullScreen
        />
      </div>
    </div>
  );
}
