// src/pages/DataManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import manifestOriginal from "../data/datasets.json";

/**
 * DataManager (full page)
 * - fixed-width sidebar (w-64) so sidebar size does NOT change between pages
 * - main content is flex-1 and responsive
 * - reads dept & dash from query params (?dept=...&dash=...)
 * - supports adding files (client-only), exporting manifest, resetting to original
 *
 * Expect manifest shape: { company: { "<Department>": { "<Section>": { "<DashboardName>": { dashId, embedUrl, dataset: { files: [...] }}}}}}
 */

function findNode(manifestObj, deptKey, dashId) {
  if (!manifestObj || !manifestObj.company) return null;
  const company = manifestObj.company;

  // find by dashId or dashboard key
  for (const deptName of Object.keys(company)) {
    const dept = company[deptName];
    for (const sectionName of Object.keys(dept)) {
      const section = dept[sectionName];
      for (const dashName of Object.keys(section)) {
        const dashObj = section[dashName];
        if (!dashObj) continue;
        if ((dashObj.dashId && dashObj.dashId === dashId) || dashName === dashId) {
          return { deptName, sectionName, dashName, dashObj };
        }
      }
    }
  }

  // fallback: if deptKey provided, return first dashboard under that dept
  if (deptKey && company[deptKey]) {
    const dept = company[deptKey];
    const firstSection = Object.keys(dept)[0];
    if (firstSection) {
      const firstDash = Object.keys(dept[firstSection])[0];
      if (firstDash) {
        return { deptName: deptKey, sectionName: firstSection, dashName: firstDash, dashObj: dept[firstSection][firstDash] };
      }
    }
  }

  return null;
}

export default function DataManager() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // query params (decode)
  const deptQ = searchParams.get("dept") ? decodeURIComponent(searchParams.get("dept")) : "";
  const dashQ = searchParams.get("dash") ? decodeURIComponent(searchParams.get("dash")) : "";

  // working manifest stored in state (client-side edits)
  const [manifest, setManifest] = useState(manifestOriginal);

  // form state
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("external");
  const [fileDesc, setFileDesc] = useState("");
  const [notice, setNotice] = useState("");

  // selected dashboard node derived from manifest + query
  const selected = useMemo(() => findNode(manifest, deptQ, dashQ), [manifest, deptQ, dashQ]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  // export current manifest (download JSON)
  function exportManifest() {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datasets.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Manifest exported");
  }

  // reset to original manifest
  function resetManifest() {
    setManifest(manifestOriginal);
    setNotice("Manifest reset to original");
  }

  // add file (client-side only)
  function addFileToDashboard() {
    if (!selected) {
      setNotice("Select a dashboard first (via sidebar or query params)");
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

    setManifest((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const node = copy.company[selected.deptName][selected.sectionName][selected.dashName];
      if (!node.dataset) node.dataset = { files: [] };
      node.dataset.files = [newFile, ...(node.dataset.files || [])];
      return copy;
    });

    setFileName("");
    setFileUrl("");
    setFileType("external");
    setFileDesc("");
    setNotice("File added (client-only)");
  }

  // open file inside the in-app viewer route
  function openInViewer(url) {
    navigate(`/data-viewer?url=${encodeURIComponent(url)}`);
  }

  const selectedTitle = selected ? `${selected.deptName} / ${selected.sectionName} / ${selected.dashName}` : "No dashboard selected";

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* FLEX layout: fixed sidebar width + main content flex-1 */}
      <div className="flex gap-6">
        {/* fixed-width sidebar (desktop). Use compact sidebar for smaller screens if needed */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Data Manager</h1>
              <p className="text-sm text-slate-500 mt-1">Manage datasets for dashboards across the company</p>
            </div>

            <div className="flex gap-2">
              <button onClick={exportManifest} className="px-3 py-2 rounded-md bg-xceed-500 text-white">Export manifest</button>
              <button onClick={resetManifest} className="px-3 py-2 rounded-md border">Reset</button>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Selected</div>
                <div className="font-medium">{selectedTitle}</div>
              </div>

              <div className="text-sm text-slate-500">Tip: click a dashboard in the left tree or use <code>?dept=...&amp;dash=...</code></div>
            </div>

            <div className="mt-4 space-y-4">
              {!selected && (
                <div className="text-sm text-slate-500">
                  No dashboard selected. Use the sidebar (left) to pick a dashboard.
                </div>
              )}

              {selected && (
                <>
                  {/* Files list */}
                  <div>
                    <div className="font-semibold mb-2">Files</div>

                    <div className="space-y-2">
                      {(selected.dashObj.dataset?.files || []).length === 0 && (
                        <div className="text-sm text-slate-500">No files registered for this dashboard yet.</div>
                      )}

                      {(selected.dashObj.dataset?.files || []).map((f) => (
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

                  {/* Add file form */}
                  <div className="mt-4 border-t pt-4">
                    <div className="font-semibold mb-2">Add file to this dashboard</div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        className="p-2 border rounded-md col-span-2"
                        placeholder="File display name"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                      />

                      <select className="p-2 border rounded-md" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                        <option value="external">External (URL)</option>
                        <option value="local">Local (/public/data/...)</option>
                      </select>

                      <input
                        className="p-2 border rounded-md col-span-3"
                        placeholder="File URL or local path (e.g. /data/finance/foo.xlsx or https://...)"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                      />

                      <input
                        className="p-2 border rounded-md col-span-3"
                        placeholder="Description (optional)"
                        value={fileDesc}
                        onChange={(e) => setFileDesc(e.target.value)}
                      />

                      <div className="col-span-3 flex gap-2">
                        <button onClick={addFileToDashboard} className="px-3 py-2 rounded-md bg-xceed-500 text-white">Add file</button>
                        <button onClick={() => { setFileName(""); setFileUrl(""); setFileType("external"); setFileDesc(""); }} className="px-3 py-2 rounded-md border">Clear</button>
                        <button onClick={() => navigate(`/data-viewer?url=${encodeURIComponent(selected.dashObj.embedUrl || "")}`)} className="px-3 py-2 rounded-md border">Open dashboard data</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {notice && <div className="text-sm text-emerald-600">{notice}</div>}
        </main>
      </div>
    </div>
  );
}
