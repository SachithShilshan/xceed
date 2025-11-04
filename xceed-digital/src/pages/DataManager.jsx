// src/pages/DataManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import manifest from "../data/datasets.json";

/**
 * DataManager reads dept & dash from query and shows files for that dashboard.
 * Supports adding files client-side and exporting the manifest JSON.
 */

function findNode(manifestObj, deptKey, dashId) {
  if (!manifestObj || !manifestObj.company) return null;
  const company = manifestObj.company;

  // find by dashId
  for (const deptName of Object.keys(company)) {
    const dept = company[deptName];
    for (const sectionName of Object.keys(dept)) {
      const section = dept[sectionName];
      for (const dashName of Object.keys(section)) {
        const dashObj = section[dashName];
        if ((dashObj.dashId && dashObj.dashId === dashId) || dashName === dashId) {
          return { deptName, sectionName, dashName, dashObj };
        }
      }
    }
  }

  // fallback: find first dashboard under deptKey
  if (deptKey && company[deptKey]) {
    const dept = company[deptKey];
    const firstSection = Object.keys(dept)[0];
    const firstDash = Object.keys(dept[firstSection])[0];
    return { deptName: deptKey, sectionName: firstSection, dashName: firstDash, dashObj: dept[firstSection][firstDash] };
  }

  return null;
}

export default function DataManager() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const deptQ = searchParams.get("dept") ? decodeURIComponent(searchParams.get("dept")) : "";
  const dashQ = searchParams.get("dash") ? decodeURIComponent(searchParams.get("dash")) : "";

  const [dataManifest, setDataManifest] = useState(manifest); // local copy for in-memory edits
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("external");
  const [notice, setNotice] = useState("");

  const selected = useMemo(() => findNode(dataManifest, deptQ, dashQ), [dataManifest, deptQ, dashQ]);

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  function exportManifest() {
    const blob = new Blob([JSON.stringify(dataManifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datasets.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Manifest exported");
  }

  function addFile() {
    if (!selected) {
      setNotice("Select a dashboard first");
      return;
    }
    if (!fileName || !fileUrl) {
      setNotice("File name and URL required");
      return;
    }

    const newFile = { id: `file-${Date.now()}`, name: fileName, type: fileType, url: fileUrl, description: "" };

    // deep clone and update
    setDataManifest((prev) => {
      const p = JSON.parse(JSON.stringify(prev));
      const node = p.company[selected.deptName][selected.sectionName][selected.dashName];
      if (!node.dataset) node.dataset = { files: [] };
      node.dataset.files = [newFile, ...(node.dataset.files || [])];
      return p;
    });

    setFileName("");
    setFileUrl("");
    setFileType("external");
    setNotice("File added (client-only)");
  }

  function openInViewer(url) {
    navigate(`/data-viewer?url=${encodeURIComponent(url)}`);
  }

  const title = selected ? `${selected.deptName} / ${selected.sectionName} / ${selected.dashName}` : "Select a dashboard";

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 lg:col-span-3">
              <Sidebar />
            </aside>
    
            <main className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Data Manager</h1>
              <p className="text-sm text-slate-500 mt-1">Manage datasets for dashboards</p>
            </div>

            <div className="flex gap-2">
              <button onClick={exportManifest} className="px-3 py-2 rounded-md bg-xceed-500 text-white">Export manifest</button>
              <button onClick={() => { setDataManifest(manifest); setNotice("Manifest reset"); }} className="px-3 py-2 rounded-md border">Reset</button>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Selected</div>
                <div className="font-medium">{title}</div>
              </div>
              <div className="text-sm text-slate-500">Tip: pick a dashboard on left or use query params `?dept=...&dash=...`</div>
            </div>

            <div className="mt-4 space-y-4">
              {!selected && <div className="text-sm text-slate-500">No dashboard selected.</div>}

              {selected && (
                <>
                  <div>
                    <div className="font-semibold mb-2">Files</div>
                    <div className="space-y-2">
                      {(selected.dashObj.dataset?.files || []).length === 0 && <div className="text-sm text-slate-500">No files registered.</div>}
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

                  <div className="mt-4 border-t pt-4">
                    <div className="font-semibold mb-2">Add file</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input className="p-2 border rounded-md col-span-2" placeholder="File display name" value={fileName} onChange={(e)=>setFileName(e.target.value)} />
                      <select className="p-2 border rounded-md" value={fileType} onChange={(e)=>setFileType(e.target.value)}>
                        <option value="external">External (URL)</option>
                        <option value="local">Local (/public/data/...)</option>
                      </select>
                      <input className="p-2 border rounded-md col-span-3" placeholder="File URL or local path" value={fileUrl} onChange={(e)=>setFileUrl(e.target.value)} />
                      <div className="col-span-3 flex gap-2">
                        <button onClick={addFile} className="px-3 py-2 rounded-md bg-xceed-500 text-white">Add file</button>
                        <button onClick={()=>{ setFileName(""); setFileUrl(""); setFileType("external"); }} className="px-3 py-2 rounded-md border">Clear</button>
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
