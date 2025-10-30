// src/pages/DataManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import originalManifest from "../data/datasets.json";

/**
 * DataManager page
 * - shows company tree on left (Sidebar)
 * - shows selected dashboard dataset files on the right
 * - supports adding files (client-side only) and exporting manifest
 *
 * Expected manifest shape (examples):
 * {
 *   "company": {
 *     "Executive / Management": {
 *       "Strategy": {
 *         "Company KPI Dashboard": {
 *           "dashId": "company-kpi",
 *           "dataset": { "files": [ { id, name, type, url, description } ] }
 *         }
 *       }
 *     },
 *     "Finance & Accounting": { ... }
 *   }
 * }
 */

function findDashboard(manifest, deptKey, dashId) {
  // deptKey maps to top-level key names in manifest.company (we'll try to find by dashId)
  // return { sectionKey, areaKey, dashboardKey, dashboardObj } if found
  if (!manifest || !manifest.company) return null;
  const company = manifest.company;

  for (const sectionKey of Object.keys(company)) {
    const section = company[sectionKey];
    for (const areaKey of Object.keys(section)) {
      const area = section[areaKey];
      for (const dashboardKey of Object.keys(area)) {
        const dashObj = area[dashboardKey];
        if (!dashObj) continue;
        if (dashObj.dashId === dashId || dashboardKey === dashId) {
          return { sectionKey, areaKey, dashboardKey, dashObj };
        }
      }
    }
  }
  // fallback: try to find by deptKey mapping to sectionKey (approx)
  if (deptKey) {
    const matchSection = Object.keys(company).find(k => k.toLowerCase().includes(deptKey.toLowerCase()));
    if (matchSection) {
      const section = company[matchSection];
      // pick first dashboard in section
      for (const areaKey of Object.keys(section)) {
        const area = section[areaKey];
        const firstDashKey = Object.keys(area)[0];
        if (firstDashKey) {
          return { sectionKey: matchSection, areaKey, dashboardKey: firstDashKey, dashObj: area[firstDashKey] };
        }
      }
    }
  }
  return null;
}

export default function DataManager() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // working manifest (client-side copy)
  const [manifest, setManifest] = useState(originalManifest);

  // UI form state
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("external"); // external | local
  const [fileDesc, setFileDesc] = useState("");
  const [notice, setNotice] = useState("");

  // query params: dept (optional), dash (optional)
  const deptQuery = searchParams.get("dept") || "";
  const dashQuery = searchParams.get("dash") || "";

  // derive selected dashboard node
  const selectedNode = useMemo(() => findDashboard(manifest, deptQuery, dashQuery), [manifest, deptQuery, dashQuery]);

  useEffect(() => {
    // clear notice after 3s
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  function exportManifest() {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datasets-manifest.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Manifest exported");
  }

  function addFileToDashboard() {
    if (!selectedNode) {
      setNotice("Select a dashboard first (via sidebar or query parameters)");
      return;
    }
    if (!fileName.trim() || !fileUrl.trim()) {
      setNotice("File name and URL are required");
      return;
    }

    const newFile = {
      id: `file-${Date.now()}`,
      name: fileName.trim(),
      type: fileType,
      url: fileUrl.trim(),
      description: fileDesc.trim()
    };

    // update manifest immutably
    setManifest(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const dashObj = copy.company[selectedNode.sectionKey][selectedNode.areaKey][selectedNode.dashboardKey];
      if (!dashObj.dataset) dashObj.dataset = { files: [] };
      dashObj.dataset.files = [newFile, ...(dashObj.dataset.files || [])];
      return copy;
    });

    // reset form
    setFileName("");
    setFileUrl("");
    setFileDesc("");
    setNotice("File added (client-only)");
  }

  function openInViewer(url) {
    const encoded = encodeURIComponent(url);
    navigate(`/data-viewer?url=${encoded}`);
  }

  // help compute a friendly title / path for the right pane
  const rightPaneTitle = selectedNode
    ? `${selectedNode.sectionKey} / ${selectedNode.areaKey} / ${selectedNode.dashboardKey}`
    : "Select a dashboard to view its datasets";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Sidebar tree */}
        <aside className="col-span-12 lg:col-span-3">
          <Sidebar />
        </aside>

        {/* Right: content */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Data Manager</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage datasets for dashboards. Add local copies under /public/data/ for direct download links.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={exportManifest} className="px-3 py-2 rounded-md bg-xceed-500 text-white">Export manifest</button>
              <button onClick={() => { setManifest(originalManifest); setNotice("Manifest reset to original"); }} className="px-3 py-2 rounded-md border">Reset</button>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Selected</div>
                <div className="font-medium">{rightPaneTitle}</div>
              </div>

              <div className="text-sm text-slate-500">Tip: click a dashboard in the left tree to load its datasets</div>
            </div>

            <div className="mt-4 space-y-4">
              {!selectedNode && (
                <div className="text-sm text-slate-500">
                  No dashboard selected. Use the sidebar (left) or pass query params `dept` and `dash` (e.g. <code>?dept=executive&dash=company-kpi</code>).
                </div>
              )}

              {selectedNode && (
                <>
                  {/* files list */}
                  <div>
                    <div className="font-semibold mb-2">Files</div>
                    <div className="space-y-2">
                      {(selectedNode.dashObj.dataset?.files || []).length === 0 && (
                        <div className="text-sm text-slate-500">No files registered for this dashboard yet.</div>
                      )}

                      {(selectedNode.dashObj.dataset?.files || []).map(f => (
                        <div key={f.id} className="flex items-center justify-between gap-3 p-3 rounded-md border">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{f.name}</div>
                            <div className="text-xs text-slate-500 truncate">{f.description || f.type}</div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => openInViewer(f.url)} className="px-3 py-1 rounded-md border text-sm">Open in Xceed</button>
                            <a href={f.url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md border text-sm">Open</a>
                            <button onClick={() => navigator.clipboard?.writeText(f.url)} className="px-3 py-1 rounded-md border text-sm">Copy</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* add file form */}
                  <div className="mt-4 border-t pt-4">
                    <div className="font-semibold mb-2">Add file to this dashboard</div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input className="p-2 border rounded-md col-span-2" placeholder="File display name" value={fileName} onChange={e=>setFileName(e.target.value)} />
                      <select className="p-2 border rounded-md" value={fileType} onChange={e=>setFileType(e.target.value)}>
                        <option value="external">External (URL)</option>
                        <option value="local">Local (/public/data/...)</option>
                      </select>
                      <input className="p-2 border rounded-md col-span-3" placeholder="File URL or local path (e.g. /data/finance/foo.xlsx or https://...)" value={fileUrl} onChange={e=>setFileUrl(e.target.value)} />
                      <input className="p-2 border rounded-md col-span-3" placeholder="Description (optional)" value={fileDesc} onChange={e=>setFileDesc(e.target.value)} />
                      <div className="col-span-3 flex gap-2">
                        <button onClick={addFileToDashboard} className="px-3 py-2 rounded-md bg-xceed-500 text-white">Add file</button>
                        <button onClick={() => { setFileName(""); setFileUrl(""); setFileDesc(""); }} className="px-3 py-2 rounded-md border">Clear</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* small footer notice area */}
          {notice && <div className="text-sm text-emerald-600">{notice}</div>}
        </main>
      </div>
    </div>
  );
}
