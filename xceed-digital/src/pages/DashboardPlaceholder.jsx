// src/pages/DashboardPlaceholder.jsx
import React from "react";
import { useParams } from "react-router-dom";
import PowerBIEmbed from "../components/PowerBIEmbed";
import Sidebar from "../components/Sidebar";

export default function DashboardPlaceholder({ embedUrl, title }) {
  // If you prefer route params: const { dashId } = useParams();
  const dashTitle = title || "Dashboard";
  const url = embedUrl || "https://app.powerbi.com/reportEmbed?reportId=4ce8262e-8c41-42bc-93ee-d80be922ad50&autoAuth=true";

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <Sidebar compact />
        </aside>

        <main className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{dashTitle}</h1>
              <div className="text-sm text-slate-500 mt-1">Interactive dashboard</div>
            </div>
          </div>

          <PowerBIEmbed title={dashTitle} src={url} />
        </main>
      </div>
    </div>
  );
}
