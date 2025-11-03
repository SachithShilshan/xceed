// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import datasets from "../data/datasets.json";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const LS_KEY = "xceed_sidebar_expanded_v1";

function slug(s) {
  return encodeURIComponent(s);
}

function buildStructure(manifest) {
  const out = [];
  const company = manifest?.company || {};
  Object.keys(company).forEach((deptName) => {
    const dept = company[deptName];
    const sections = Object.keys(dept || {}).map((sectionName) => {
      const dashNames = Object.keys(dept[sectionName] || {});
      const dashboards = dashNames.map((dashName) => {
        const dashObj = dept[sectionName][dashName];
        const fileCount = (dashObj?.dataset?.files || []).length;
        const id = dashObj?.dashId || dashName;
        return {
          id,
          name: dashName,
          route: `/dash/${slug(id)}`,
          fileCount
        };
      });
      return { sectionName, dashboards, dashCount: dashboards.length };
    });
    const totalDash = sections.reduce((s, x) => s + x.dashCount, 0);
    out.push({ deptName, sections, totalDash });
  });

  return out;
}

export default function Sidebar({ compact = false }) {
  const location = useLocation();
  const structure = useMemo(() => buildStructure(datasets), [datasets]);

  // Load expanded state from localStorage
  const [expanded, setExpanded] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [query, setQuery] = useState("");

  // === Handle HashRouter vs BrowserRouter ===
  // If using HashRouter the path lives in location.hash (e.g. "#/dash/xxx")
  // Otherwise use location.pathname (e.g. "/dash/xxx")
  const currentPath = useMemo(() => {
    if (location.hash && location.hash.startsWith("#")) {
      return location.hash.replace(/^#/, "");
    }
    return location.pathname || "/";
  }, [location.pathname, location.hash]);

  // determine active dash id from route (supports both hash and pathname)
  const activeDashId = useMemo(() => {
    const m = currentPath.match(/^\/dash\/(.+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }, [currentPath]);

  // auto-expand parents of activeDash on first load
  useEffect(() => {
    if (!activeDashId) return;
    for (const dept of structure) {
      for (const section of dept.sections) {
        for (const dash of section.dashboards) {
          if (dash.id === activeDashId || dash.route === currentPath) {
            setExpanded((prev) => {
              const next = { ...prev };
              next[dept.deptName] = true;
              next[`${dept.deptName}::${section.sectionName}`] = true;
              try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
              return next;
            });
            return;
          }
        }
      }
    }
  }, [activeDashId, structure, currentPath]);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(expanded)); } catch {}
  }, [expanded]);

  function toggleDept(deptName) {
    setExpanded((prev) => ({ ...prev, [deptName]: !prev[deptName] }));
  }
  function toggleSection(deptName, sectionName) {
    const key = `${deptName}::${sectionName}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function matches(q, text) {
    return text.toLowerCase().includes(q.toLowerCase());
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return structure;
    const q = query.trim().toLowerCase();
    return structure
      .map((dept) => {
        const sections = dept.sections
          .map((section) => {
            const dashboards = section.dashboards.filter((d) => matches(q, d.name) || matches(q, section.sectionName) || matches(q, dept.deptName));
            if (dashboards.length === 0) return null;
            return { ...section, dashboards };
          })
          .filter(Boolean);
        if (sections.length === 0 && matches(q, dept.deptName)) {
          return dept;
        }
        if (sections.length === 0) return null;
        return { ...dept, sections };
      })
      .filter(Boolean);
  }, [structure, query]);

  const Badge = ({ children }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      {children}
    </span>
  );

  return (
    <aside className={`sticky top-20 ${compact ? "w-48" : "w-full"}`}>
      <div className="card p-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BuildingLibraryIcon className="w-5 h-5 text-xceed-600" />
            <div>
              <div className="text-sm font-semibold">Company</div>
              <div className="text-xs text-slate-400">Departments & dashboards</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link to="/data-manager" className="px-2 py-1 rounded-md border text-xs">Data</Link>
            <Link to="/docs" className="px-2 py-1 rounded-md border text-xs">Docs</Link>
          </div>
        </div>

        <div className="mt-3">
          <label className="relative block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dashboards, sections..."
              className="placeholder:text-slate-400 block w-full bg-white border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-xceed-300"
            />
          </label>
        </div>
      </div>

      <nav aria-label="Company navigation" className="space-y-3 px-1">
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-500 px-3">No results</div>
        ) : (
          filtered.map((dept) => {
            const deptKey = dept.deptName;
            const deptOpen = !!expanded[deptKey];

            return (
              <div key={deptKey} className="group">
                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={() => toggleDept(deptKey)}
                    className="flex items-center gap-2 w-full text-left py-2 px-2 rounded-md hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{deptKey}</div>
                        <div className="text-xs text-slate-400">{dept.sections.length} sections • {dept.totalDash} dashboards</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge>{dept.totalDash}</Badge>
                      {deptOpen ? <ChevronDownIcon className="w-4 h-4 text-slate-500" /> : <ChevronRightIcon className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>
                </div>

                {deptOpen && (
                  <div className="mt-2 pl-4 space-y-2">
                    {dept.sections.map((sec) => {
                      const secKey = `${deptKey}::${sec.sectionName}`;
                      const secOpen = !!expanded[secKey];
                      return (
                        <div key={secKey} className="group">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleSection(deptKey, sec.sectionName)}
                              className="flex items-center gap-2 w-full text-left py-1 px-1 rounded-md hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-2">
                                <Squares2X2Icon className="w-4 h-4 text-slate-500" />
                                <div>
                                  <div className="text-sm text-slate-700">{sec.sectionName}</div>
                                  <div className="text-xs text-slate-400">{sec.dashCount} dashboards</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge>{sec.dashCount}</Badge>
                                {secOpen ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                              </div>
                            </button>
                          </div>

                          {secOpen && (
                            <div className="mt-1 ml-6 space-y-1">
                              {sec.dashboards.map((dash) => {
                                const isActive = activeDashId === dash.id || currentPath === dash.route;
                                return (
                                  <Link
                                    key={dash.id}
                                    to={dash.route}
                                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm ${
                                      isActive ? "bg-xceed-500/10 border-l-2 border-xceed-500 text-xceed-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="truncate">
                                      <div className="truncate">{dash.name}</div>
                                      <div className="text-xs text-slate-400">{dash.fileCount} file{dash.fileCount !== 1 ? "s" : ""}</div>
                                    </div>
                                    <div className="text-xs text-slate-400"></div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      <div className="mt-4 px-2">
        <div className="text-xs text-slate-400">Quick</div>
        <div className="mt-2 flex gap-2">
          <Link to="/data-manager" className="flex-1 text-center px-2 py-2 rounded-md border text-xs">Data Manager</Link>
          <Link to="/docs" className="flex-1 text-center px-2 py-2 rounded-md border text-xs">Docs</Link>
        </div>
      </div>
    </aside>
  );
}
