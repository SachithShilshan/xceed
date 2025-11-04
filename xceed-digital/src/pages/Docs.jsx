// src/pages/Docs.jsx
import React from "react";
import Sidebar from "../components/Sidebar";

export default function Docs() {
  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 lg:col-span-3">
              <Sidebar />
            </aside>
    
            <main className="col-span-12 lg:col-span-9 space-y-6">
          <h1 className="text-2xl font-semibold">Documentation & Help</h1>

          <div className="card p-4">
            <h2 className="font-semibold">How to add datasets</h2>
            <p className="text-sm text-slate-600 mt-2">
              Use the manifest Excel (manifest.xlsx) and run <code>node scripts/manifest-to-datasets.cjs manifest.xlsx</code> to update <code>src/data/datasets.json</code>.
              Use <strong>Data Manager</strong> for quick edits and to export the manifest.
            </p>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold">Embedding Power BI</h2>
            <p className="text-sm text-slate-600 mt-2">
              Add the Power BI embed URL to the DB entry's <code>EmbedURL</code> column in the Databases sheet — the dashboard pages will auto-load it.
            </p>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold">OneDrive Excel embedding</h2>
            <p className="text-sm text-slate-600 mt-2">Use OneDrive share links (1drv.ms) for workbook embeds. If editing is required, ensure users have Microsoft 365 edit permissions.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
