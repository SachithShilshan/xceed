// src/pages/DataManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import datasetsManifest from "../data/datasets.json";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";

/**
 * DataManager (compact tree-only view)
 *
 * - No Sidebar, no right details panel (per your request)
 * - Search (prunes tree), Sort (A→Z / Z→A), Expand All / Collapse All (visible tree)
 * - Export manifest
 * - File rows: Open (anchor), Copy, Remove
 *
 * Notes:
 * - client-only changes (use Export manifest to persist)
 * - for 'local' files we compute a best-effort public URL if `publicUrl` missing
 */

// helpers
function cleanNameForPath(s = "") {
  return s.toString().replace(/[^\w-]/g, "_").toLowerCase();
}
function joinPosix(...parts) {
  return parts.map(p => p.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/");
}
function buildPublicUrl({ deptName, sectionName, dashObj, file }) {
  if (file.publicUrl) return file.publicUrl;
  // if file.url is absolute, prefer it
  if (file.url && (file.url.startsWith("http://") || file.url.startsWith("https://"))) return file.url;
  const cleanDept = cleanNameForPath(deptName);
  const cleanSection = cleanNameForPath(sectionName);
  const cleanDb = cleanNameForPath((dashObj.dashId || dashObj.name || "db").toString());
  const relParts = (file.relativePath || "").split("/").filter(Boolean);
  const fileName = (file.url || file.name || "").split("/").pop();
  const path = joinPosix("data", cleanDept, cleanSection, cleanDb, ...relParts, fileName);
  return `${window.location.origin}/${path}`;
}

// build tree from manifest
function buildTreeFromManifest(manifest) {
  const tree = [];
  const company = manifest?.company || {};
  Object.keys(company).forEach((deptName) => {
    const dept = company[deptName];
    const sections = Object.keys(dept || {}).map((sectionName) => {
      const section = dept[sectionName];
      const dashboards = Object.keys(section || {}).map((dashName) => {
        const dashObj = section[dashName] || {};
        const files = (dashObj.dataset?.files || []).map(f => ({ ...f }));
        const folderMap = {};
        files.forEach((f) => {
          const rel = (f.relativePath || "").trim();
          const key = rel ? rel.split("/").filter(Boolean).join("/") : "";
          if (!folderMap[key]) folderMap[key] = { files: [], folders: new Set() };
          folderMap[key].files.push(f);
          if (key) {
            const parts = key.split("/");
            for (let i = 0; i < parts.length; i++) {
              const parent = parts.slice(0, i).join("/");
              const child = parts.slice(0, i + 1).join("/");
              if (!folderMap[parent]) folderMap[parent] = { files: [], folders: new Set() };
              folderMap[parent].folders.add(child);
            }
          }
        });
        if (!folderMap[""]) folderMap[""] = folderMap[""] || { files: [], folders: new Set() };
        return { dashName, dashObj, files, folderMap };
      });
      return { sectionName, dashboards };
    });
    tree.push({ deptName, sections });
  });
  return tree;
}

// convert folderMap -> nested node
function folderMapToTree(folderMap) {
  function buildNode(pathKey) {
    const entry = folderMap[pathKey] || { files: [], folders: new Set() };
    return {
      key: pathKey,
      name: pathKey === "" ? "(root)" : pathKey.split("/").slice(-1)[0],
      files: (entry.files || []).slice().sort((a,b) => (a.name || "").localeCompare(b.name || "")),
      children: Array.from(entry.folders || []).sort().map(k => buildNode(k))
    };
  }
  return buildNode("");
}

export default function DataManager() {
  const [manifest, setManifest] = useState(() => JSON.parse(JSON.stringify(datasetsManifest)));
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc"); // name-asc | name-desc
  const [expanded, setExpanded] = useState({});
  const [notice, setNotice] = useState("");

  const rawTree = useMemo(() => buildTreeFromManifest(manifest), [manifest]);

  // visible tree (pruned by query)
  const visibleTree = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return rawTree;

    function fileMatches(file, dept, section, dash) {
      const name = (file.name || file.url || "").toString().toLowerCase();
      const path = (file.relativePath || "").toString().toLowerCase();
      const meta = `${dept} ${section} ${dash}`.toLowerCase();
      return name.includes(q) || path.includes(q) || meta.includes(q);
    }

    const out = [];
    for (const dept of rawTree) {
      const deptCopy = { deptName: dept.deptName, sections: [] };
      for (const sec of dept.sections) {
        const secCopy = { sectionName: sec.sectionName, dashboards: [] };
        for (const dash of sec.dashboards) {
          const fm = dash.folderMap || {};
          const filteredFolderMap = {};
          Object.keys(fm).forEach(key => {
            const files = (fm[key].files || []).filter(f => fileMatches(f, dept.deptName, sec.sectionName, dash.dashName));
            if (files.length > 0) {
              filteredFolderMap[key] = { files: files.slice(), folders: new Set([...fm[key].folders]) };
            }
          });
          // include intermediate parents
          Object.keys(filteredFolderMap).forEach(k => {
            const parts = k ? k.split("/") : [];
            for (let i=0;i<parts.length;i++){
              const parent = parts.slice(0,i).join("/");
              if (!filteredFolderMap[parent]) filteredFolderMap[parent] = { files: [], folders: new Set() };
              filteredFolderMap[parent].folders.add(parts.slice(0,i+1).join("/"));
            }
          });

          const hasFiles = Object.keys(filteredFolderMap).length > 0;
          if (hasFiles) {
            if (!filteredFolderMap[""]) filteredFolderMap[""] = filteredFolderMap[""] || { files: [], folders: new Set() };
            secCopy.dashboards.push({ dashName: dash.dashName, dashObj: dash.dashObj, files: dash.files, folderMap: filteredFolderMap });
          } else {
            const meta = `${dash.dashName} ${sec.sectionName} ${dept.deptName}`.toLowerCase();
            if (meta.includes(q)) {
              secCopy.dashboards.push({ dashName: dash.dashName, dashObj: dash.dashObj, files: dash.files, folderMap: dash.folderMap });
            }
          }
        }
        if (secCopy.dashboards.length > 0 || sec.sectionName.toLowerCase().includes(q)) {
          deptCopy.sections.push(secCopy);
        }
      }
      if (deptCopy.sections.length > 0 || dept.deptName.toLowerCase().includes(q)) {
        out.push(deptCopy);
      }
    }
    return out;
  }, [rawTree, query]);

  // collect visible keys
  function collectVisibleKeys(treeSrc) {
    const keys = [];
    treeSrc.forEach(dept => {
      const deptKey = `dept:${dept.deptName}`; keys.push(deptKey);
      dept.sections.forEach(sec => {
        const secKey = `${deptKey}|sec:${sec.sectionName}`; keys.push(secKey);
        sec.dashboards.forEach(dash => {
          const dashKey = `${secKey}|dash:${dash.dashName}`; keys.push(dashKey);
          Object.keys(dash.folderMap || {}).forEach(pathKey => {
            keys.push(`${dashKey}|path:${pathKey}`);
          });
        });
      });
    });
    return keys;
  }

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  function expandAllVisible() {
    const keys = collectVisibleKeys(visibleTree);
    const obj = {};
    keys.forEach(k => obj[k] = true);
    setExpanded(obj);
    setNotice("Expanded all visible");
  }
  function collapseAll() {
    setExpanded({});
    setNotice("Collapsed all");
  }

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

  // remove file (client-only)
  function removeFileClient(deptName, sectionName, dashName, fileId) {
    const dashObj = manifest.company?.[deptName]?.[sectionName]?.[dashName];
    if (!dashObj) return;
    dashObj.dataset.files = (dashObj.dataset.files || []).filter(f => f.id !== fileId);
    setManifest({ ...manifest });
    setNotice("Removed (client-only)");
  }

  // copy a link
  function copyLink(file, deptName, sectionName, dashName) {
    const dashObj = manifest.company?.[deptName]?.[sectionName]?.[dashName] || {};
    const url = file.publicUrl || buildPublicUrl({ deptName, sectionName, dashObj, file });
    navigator.clipboard?.writeText(url);
    setNotice("Link copied");
  }

  // sort helper
  function sortFiles(arr) {
    const a = arr.slice();
    if (sortBy === "name-asc") a.sort((x,y)=> (x.name||"").localeCompare(y.name||""));
    if (sortBy === "name-desc") a.sort((x,y)=> (y.name||"").localeCompare(x.name||""));
    return a;
  }

  // recursive folder node render
  function RenderFolderNode({ node, deptName, sectionName, dashName, dashKey }) {
    const nodeKey = `${dashKey}|path:${node.key}`;
    const isExpanded = !!expanded[nodeKey];

    const visibleFiles = (node.files || []).filter(f => {
      if (!query) return true;
      const q = query.toLowerCase();
      const name = (f.name || f.url || "").toLowerCase();
      const path = (f.relativePath || "").toLowerCase();
      const meta = `${deptName} ${sectionName} ${dashName}`.toLowerCase();
      return name.includes(q) || path.includes(q) || meta.includes(q);
    });

    const filesSorted = sortFiles(visibleFiles);

    return (
      <div key={node.key} className="mb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }))}
            className="flex items-center gap-2 text-xs text-slate-700 px-2 py-1 rounded-md hover:bg-slate-50"
          >
            {isExpanded ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
            <div className="text-xs font-medium">{node.name === "(root)" ? "Root" : node.name}</div>
            <div className="text-[11px] text-slate-400 ml-1">({node.files.length})</div>
          </button>
        </div>

        {isExpanded && (
          <div className="pl-4 mt-2 space-y-2">
            {filesSorted.length === 0 && <div className="text-xs text-slate-400">No files</div>}

            {filesSorted.map(f => {
              const fileHref = f.publicUrl || buildPublicUrl({ deptName, sectionName, dashObj: manifest.company?.[deptName]?.[sectionName]?.[dashName] || {}, file: f });
              return (
                <div key={f.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{f.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{f.relativePath || "(root)"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={fileHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs px-2 py-1 rounded-md border"
                      onClick={(e)=>e.stopPropagation()}
                    >
                      Open
                    </a>

                    <button
                      title="Copy link"
                      onClick={() => copyLink(f, deptName, sectionName, dashName)}
                      className="px-2 py-1 rounded-md border text-[11px]"
                    >
                      Copy
                    </button>

                    <button
                      title="Remove"
                      onClick={() => removeFileClient(deptName, sectionName, dashName, f.id)}
                      className="px-2 py-1 rounded-md border text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {node.children.map(child => (
              <RenderFolderNode key={child.key} node={child} deptName={deptName} sectionName={sectionName} dashName={dashName} dashKey={dashKey} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // main render
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-semibold">Data Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Search datasets — tree view (compact)</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border rounded-md px-2 py-1">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search dept / dash / path / file"
              className="ml-2 text-sm placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="px-2 py-1 border rounded-md text-sm">
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
          </select>

          <button onClick={expandAllVisible} className="px-2 py-1 rounded-md border text-sm flex items-center gap-2">
            <ArrowUpOnSquareIcon className="w-4 h-4" /> Expand all
          </button>

          <button onClick={collapseAll} className="px-2 py-1 rounded-md border text-sm">Collapse all</button>

          <button onClick={exportManifest} className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">Export manifest</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 shadow-sm">
        <div className="text-sm font-semibold mb-3">Datasets tree</div>

        <div className="space-y-3">
          {visibleTree.length === 0 && <div className="text-xs text-slate-500">No matches</div>}

          {visibleTree.map(dept => (
            <div key={dept.deptName}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [`dept:${dept.deptName}`]: !prev[`dept:${dept.deptName}`] }))}
                  className="flex items-center gap-2 w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                >
                  {expanded[`dept:${dept.deptName}`] ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                  <div className="text-sm font-medium">{dept.deptName}</div>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">{dept.sections.length} sections</span>
                </button>
              </div>

              {expanded[`dept:${dept.deptName}`] && (
                <div className="pl-4 mt-2 space-y-2">
                  {dept.sections.map(sec => (
                    <div key={sec.sectionName}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setExpanded(prev => ({ ...prev, [`dept:${dept.deptName}|sec:${sec.sectionName}`]: !prev[`dept:${dept.deptName}|sec:${sec.sectionName}`] }))}
                          className="flex items-center gap-2 w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                        >
                          {expanded[`dept:${dept.deptName}|sec:${sec.sectionName}`] ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                          <div className="text-xs font-semibold text-slate-700">{sec.sectionName}</div>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">{sec.dashboards.length} dashboards</span>
                        </button>
                      </div>

                      {expanded[`dept:${dept.deptName}|sec:${sec.sectionName}`] && (
                        <div className="pl-4 mt-1 space-y-1">
                          {sec.dashboards.map(dash => {
                            const dashKey = `dept:${dept.deptName}|sec:${sec.sectionName}|dash:${dash.dashName}`;
                            return (
                              <div key={dash.dashName} className="mb-1">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => setExpanded(prev => ({ ...prev, [dashKey]: !prev[dashKey] }))}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 rounded-md hover:bg-slate-50"
                                  >
                                    {expanded[dashKey] ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                                    <div className="text-xs font-medium text-slate-700">{dash.dashName}</div>
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">{(dash.dashObj.dataset?.files || []).length} files</span>
                                  </button>
                                </div>

                                {expanded[dashKey] && (
                                  <div className="pl-4 mt-2">
                                    {(() => {
                                      const folderMap = dash.folderMap || {};
                                      const rootNode = folderMapToTree(folderMap);
                                      function annotate(node, key) {
                                        node.key = key;
                                        node.children.forEach(c => {
                                          const childKey = key ? `${key}/${c.name}` : c.name;
                                          annotate(c, childKey);
                                        });
                                      }
                                      annotate(rootNode, "");
                                      function renderNode(node) {
                                        return <RenderFolderNode key={node.key} node={node} deptName={dept.deptName} sectionName={sec.sectionName} dashName={dash.dashName} dashKey={dashKey} />;
                                      }
                                      return renderNode(rootNode);
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
