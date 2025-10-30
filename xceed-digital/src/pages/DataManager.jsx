import React, { useEffect, useState } from "react";
import datasetManifest from "../data/datasets.json";
import { useSearchParams, Link } from "react-router-dom";


/**
 * DataManager page
 * - shows department folders + files from datasets.json
 * - allows adding new folder or file (client-side only)
 * - allows exporting current manifest as JSON
 */

function FileRow({ file }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-md hover:bg-slate-50">
      <div>
        <div className="font-medium text-sm">{file.name}</div>
        <div className="text-xs text-slate-500">{file.description || file.type}</div>
      </div>

      <div className="flex gap-2 items-center">
        {file.type === "external" && (
          <Link to={`/data-viewer?url=${encodeURIComponent(file.url)}`} className="text-xceed-500 text-sm underline">Open</Link>
        )}

        {file.type === "local" && (
          <a href={file.url} target="_blank" rel="noreferrer" className="text-xceed-500 text-sm underline">Download</a>
        )}

        <button className="text-xs text-slate-600 px-2 py-1 border rounded-md" onClick={() => navigator.clipboard?.writeText(file.url)}>Copy link</button>
      </div>
    </div>
  );
}

export default function DataManager() {
  const [manifest, setManifest] = useState(datasetManifest);
  const [searchParams] = useSearchParams();
  const deptFromQuery = searchParams.get("dept") || "";

  // state for create folder/file forms
  const [selectedDept, setSelectedDept] = useState(deptFromQuery || Object.keys(manifest.departments)[0]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileType, setNewFileType] = useState("external"); // or local
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (deptFromQuery) setSelectedDept(deptFromQuery);
  }, [deptFromQuery]);

  function addFolder() {
    if (!newFolderName.trim()) return setNotification("Folder name required");
    const dept = manifest.departments[selectedDept];
    const newFolder = {
      id: `f-${selectedDept}-${Date.now()}`,
      name: newFolderName.trim(),
      files: []
    };
    const newManifest = { ...manifest };
    newManifest.departments[selectedDept].folders = [newFolder, ...dept.folders];
    setManifest(newManifest);
    setNewFolderName("");
    setNotification("Folder added (client-only)");
  }

  function addFile(folderId) {
    if (!newFileName.trim() || !newFileUrl.trim()) return setNotification("File name and URL required");
    const newFile = {
      id: `file-${selectedDept}-${Date.now()}`,
      name: newFileName.trim(),
      type: newFileType,
      url: newFileUrl.trim(),
      description: ""
    };
    const newManifest = { ...manifest };
    const dept = newManifest.departments[selectedDept];
    dept.folders = dept.folders.map(f => {
      if (f.id === folderId) return { ...f, files: [newFile, ...f.files] };
      return f;
    });
    setManifest(newManifest);
    setNewFileName("");
    setNewFileUrl("");
    setNotification("File added (client-only)");
  }

  function exportManifest() {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datasets-manifest.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const deptKeys = Object.keys(manifest.departments);
  const dept = manifest.departments[selectedDept];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Data Manager</h2>
          <div className="text-sm text-slate-500">Manage department datasets, folders and files (prototype UI — client-side).</div>
        </div>
        <div className="flex gap-3">
          <button onClick={exportManifest} className="px-3 py-2 bg-xceed-500 text-white rounded-md">Export manifest</button>
          <Link to="/departments" className="px-3 py-2 border rounded-md">Back to Departments</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <div className="text-sm font-medium mb-2">Departments</div>
            <div className="space-y-2">
              {deptKeys.map(k => (
                <button key={k} className={`w-full text-left px-3 py-2 rounded-md ${k === selectedDept ? "bg-xceed-50" : "hover:bg-slate-50"}`} onClick={() => { setSelectedDept(k); }}>
                  <div className="font-medium">{manifest.departments[k].name}</div>
                  <div className="text-xs text-slate-500">{manifest.departments[k].description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-medium mb-2">Create Folder</div>
            <input className="w-full px-3 py-2 border rounded-md mb-2" placeholder="folder name" value={newFolderName} onChange={(e)=>setNewFolderName(e.target.value)} />
            <button onClick={addFolder} className="px-3 py-2 bg-xceed-500 text-white rounded-md w-full">Create</button>
          </div>

          <div className="card p-4">
            <div className="text-sm font-medium mb-2">Quick tips</div>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>Add 'local' file entries and place the real file under <code>/public/data/&lt;dept&gt;/</code>.</li>
              <li>External files open in new tab (SharePoint / external storage).</li>
              <li>Export the manifest to persist or hand to a backend dev.</li>
            </ul>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-4">
          <div className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">{dept.name}</div>
                <div className="text-sm text-slate-500">{dept.description}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Sample dataset for this department</div>
                <div className="mt-2">
                  {/* quick direct open button (navigates to the first file in the first folder that matches finance earnings) */}
                  {selectedDept === "finance" && (
                    <a href={manifest.departments.finance.folders[0].files[0].url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-xceed-500 text-white rounded-md">Open finance dataset (SharePoint)</a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {dept.folders.map(folder => (
            <div className="card p-4" key={folder.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{folder.name}</div>
                  <div className="text-xs text-slate-500">Files: {folder.files.length}</div>
                </div>

                <div className="w-96">
                  <div className="flex gap-2">
                    <input className="flex-1 px-3 py-2 border rounded-md" placeholder="file name (display)" value={newFileName} onChange={(e)=>setNewFileName(e.target.value)} />
                    <select className="px-2 py-2 border rounded-md" value={newFileType} onChange={(e)=>setNewFileType(e.target.value)}>
                      <option value="external">External (URL)</option>
                      <option value="local">Local (put file in /public/data/)</option>
                    </select>
                  </div>
                  <input className="mt-2 w-full px-3 py-2 border rounded-md" placeholder="file URL or local path (e.g. /data/finance/foo.xlsx or https://...)" value={newFileUrl} onChange={(e)=>setNewFileUrl(e.target.value)} />
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-2 bg-slate-50 rounded-md" onClick={()=>addFile(folder.id)}>Add file to folder</button>
                    <button className="px-3 py-2 text-sm text-slate-600 border rounded-md" onClick={()=>{ setNewFileName(""); setNewFileUrl(""); }}>Clear</button>
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t pt-3 space-y-2">
                {folder.files.length === 0 && <div className="text-sm text-slate-500">No files yet</div>}
                {folder.files.map(f => <FileRow key={f.id} file={f} />)}
              </div>
            </div>
          ))}

          {notification && <div className="text-sm text-green-600">{notification}</div>}
        </main>
      </div>
    </div>
  );
}
