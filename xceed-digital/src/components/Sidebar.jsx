// src/components/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import datasets from "../data/datasets.json";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  BuildingLibraryIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const LS_KEY = "xceed_sidebar_expanded_v4";

/**
 * Sidebar — when clicking a Section:
 *  - navigates to /departments/:dept?section=:sectionName
 *  - collapses other sections and ensures clicked section is open
 *  - still supports chevron toggles and searching
 */

function buildStructure(manifest) {
  const out = [];
  const company = manifest?.company || {};
  Object.keys(company).forEach((deptName) => {
    const dept = company[deptName];
    const sections = Object.keys(dept || {}).map((sectionName) => {
      const dashNames = Object.keys(dept[sectionName] || {});
      const dashboards = dashNames.map((dashName) => {
        const dashObj = dept[sectionName][dashName];
        return {
          id: dashObj?.dashId || dashName,
          name: dashName,
          route: `/dash/${encodeURIComponent(dashObj?.dashId || dashName)}`,
          fileCount: (dashObj?.dataset?.files || []).length,
        };
      });
      return { sectionName, dashboards, dashCount: dashboards.length };
    });
    out.push({ deptName, sections });
  });
  return out;
}

export default function Sidebar({ compact = false }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sectionQuery = searchParams.get("section") ? decodeURIComponent(searchParams.get("section")) : null;
  const activeDeptFromPath = useMemo(() => {
    const m = location.pathname.match(/^\/departments\/(.+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }, [location.pathname]);

  const structure = useMemo(() => buildStructure(datasets), []);
  const [expanded, setExpanded] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [query, setQuery] = useState("");

  // active dashboard id from /dash/:id
  const activeDashId = useMemo(() => {
    const m = location.pathname.match(/^\/dash\/(.+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }, [location.pathname]);

  // when URL includes ?section=..., expand that section and collapse siblings
  useEffect(() => {
    if (!sectionQuery) return;
    // find which dept contains this section and expand only that section
    for (const dept of structure) {
      const found = dept.sections.find((s) => s.sectionName === sectionQuery);
      if (found) {
        const newState = {};
        // open department
        newState[dept.deptName] = true;
        // open that section only (and close others)
        newState[`${dept.deptName}::${found.sectionName}`] = true;
        try { localStorage.setItem(LS_KEY, JSON.stringify(newState)); } catch {}
        setExpanded(newState);
        return;
      }
    }
  }, [sectionQuery, structure]);

  // when active dashboard changes, expand its parents (non-destructive)
  useEffect(() => {
    if (!activeDashId) return;
    for (const dept of structure) {
      for (const sec of dept.sections) {
        for (const dash of sec.dashboards) {
          if (dash.id === activeDashId) {
            setExpanded((prev) => {
              const next = { ...prev };
              next[dept.deptName] = true;
              next[`${dept.deptName}::${sec.sectionName}`] = true;
              try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
              return next;
            });
            return;
          }
        }
      }
    }
  }, [activeDashId, structure]);

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

  // Clicking a section label should navigate AND focus that section in sidebar:
  function onSectionClick(deptName, sectionName) {
    // set expanded to only this section within the dept, collapse siblings
    const newState = { ...expanded };
    newState[deptName] = true;
    // collapse other sections for this dept
    (structure.find(s => s.deptName === deptName)?.sections || []).forEach(sec => {
      newState[`${deptName}::${sec.sectionName}`] = false;
    });
    newState[`${deptName}::${sectionName}`] = true;
    setExpanded(newState);
    try { localStorage.setItem(LS_KEY, JSON.stringify(newState)); } catch {}
    // navigation handled by Link (we use Link for section label)
  }

  // search filter
  const filtered = useMemo(() => {
    if (!query.trim()) return structure;
    const q = query.trim().toLowerCase();
    return structure
      .map((dept) => {
        const sections = dept.sections
          .map((sec) => {
            const dashboards = sec.dashboards.filter((d) =>
              d.name.toLowerCase().includes(q) ||
              sec.sectionName.toLowerCase().includes(q) ||
              dept.deptName.toLowerCase().includes(q)
            );
            if (dashboards.length === 0) return null;
            return { ...sec, dashboards };
          })
          .filter(Boolean);
        if (sections.length === 0 && dept.deptName.toLowerCase().includes(q)) {
          return dept;
        }
        if (sections.length === 0) return null;
        return { ...dept, sections };
      })
      .filter(Boolean);
  }, [structure, query]);

  const Badge = ({ children }) => (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
      {children}
    </span>
  );

  return (
    <aside className={`${compact ? "w-48" : "w-full"} h-full`}>
      <div className="card p-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BuildingLibraryIcon className="w-5 h-5 text-xceed-600" />
            <div>
              <div className="text-sm font-semibold">Company</div>
              <div className="text-xs text-slate-400">Departments & dashboards</div>
            </div>
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
              placeholder="Search dashboards..."
              className="placeholder:text-slate-400 block w-full bg-white border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-xceed-300"
            />
          </label>
        </div>
      </div>

      <nav aria-label="Sidebar navigation" className="space-y-2 px-1">
        {filtered.length === 0 && <div className="text-sm text-slate-500 px-3">No matches found</div>}

        {filtered.map((dept) => {
          const deptOpen = !!expanded[dept.deptName];
          const deptIsActive = activeDeptFromPath === dept.deptName || dept.sections.some(s => s.dashboards.some(d => d.id === activeDashId));

          return (
            <div key={dept.deptName}>
              {/* Department header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleDept(dept.deptName)}
                  className="p-0 mr-2 rounded-md hover:bg-slate-50"
                  aria-label={`Toggle ${dept.deptName}`}
                >
                  {deptOpen ? <ChevronDownIcon className="w-4 h-4 text-slate-500" /> : <ChevronRightIcon className="w-4 h-4 text-slate-500" />}
                </button>

                <Link
                  to={`/departments/${encodeURIComponent(dept.deptName)}`}
                  className={`flex-1 flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 ${deptIsActive ? "bg-xceed-50" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="text-[14px] font-medium text-slate-800">{dept.deptName}</div>
                      <div className="text-[11px] text-slate-400">{dept.sections.length} sections</div>
                    </div>
                  </div>
                  <Badge>{dept.sections.reduce((s, sec) => s + sec.dashCount, 0)}</Badge>
                </Link>
              </div>

              {/* Sections */}
              {deptOpen && (
                <div className="mt-1 pl-4 space-y-1">
                  {dept.sections.map((sec) => {
                    const secKey = `${dept.deptName}::${sec.sectionName}`;
                    const secOpen = !!expanded[secKey];
                    // section active when query param matches or contains active dash
                    const secIsActive = sectionQuery === sec.sectionName || sec.dashboards.some(d => d.id === activeDashId);

                    return (
                      <div key={secKey}>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleSection(dept.deptName, sec.sectionName)}
                            className="p-0 mr-2 rounded-md hover:bg-slate-50"
                            aria-label={`Toggle ${sec.sectionName}`}
                          >
                            {secOpen ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                          </button>

                          {/* Section label is clickable Link and also triggers focusing behavior */}
                          <Link
                            to={`/departments/${encodeURIComponent(dept.deptName)}?section=${encodeURIComponent(sec.sectionName)}`}
                            onClick={() => onSectionClick(dept.deptName, sec.sectionName)}
                            className={`flex-1 flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 ${secIsActive ? "bg-xceed-50" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              <Squares2X2Icon className="w-3.5 h-3.5 text-slate-500" />
                              <div>
                                <div className="text-[13px] text-slate-700 font-medium">{sec.sectionName}</div>
                                <div className="text-[11px] text-slate-400">{sec.dashCount} dashboards</div>
                              </div>
                            </div>
                            <Badge>{sec.dashCount}</Badge>
                          </Link>
                        </div>

                        {/* Dashboards list — visible when section expanded */}
                        {secOpen && (
                          <div className="mt-1 ml-5 space-y-0.5">
                            {sec.dashboards.map((d) => {
                              const isActive = activeDashId === d.id || location.pathname === d.route;
                              return (
                                <Link
                                  key={d.id}
                                  to={d.route}
                                  className={`block px-2 py-1 rounded-md truncate text-[12px] ${isActive ? "bg-xceed-500/10 border-l-2 border-xceed-500 text-xceed-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                                >
                                  {d.name}
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
        })}
      </nav>

      <div className="mt-4 px-2">
        <div className="text-xs text-slate-400">Quick Links</div>
        <div className="mt-2 flex gap-2">
          <Link to="/data-manager" className="flex-1 text-center px-2 py-2 rounded-md border text-xs hover:bg-slate-50">Data Manager</Link>
          <Link to="/docs" className="flex-1 text-center px-2 py-2 rounded-md border text-xs hover:bg-slate-50">Docs</Link>
        </div>
      </div>
    </aside>
  );
}
