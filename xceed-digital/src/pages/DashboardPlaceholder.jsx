// src/pages/DashboardPlaceholder.jsx
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import manifest from "../data/datasets.json";

/**
 * Robust dashboard loader:
 * - supports matching by dashId or dashboard name
 * - normalizes (lowercase, remove punctuation, replace spaces with hyphens)
 * - when no exact match, shows similar entries (best-effort)
 */

function normalizeKey(s = "") {
  return s
    .toString()
    .trim()
    .toLowerCase()
    // replace common punctuation with space
    .replace(/[.,/#!$%^&*;:{}=\_`~()@+]/g, " ")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s = "") {
  return normalizeKey(s).replace(/\s+/g, "-");
}

function findDashboardNode(manifestObj, searchId) {
  if (!manifestObj || !manifestObj.company) return null;
  const company = manifestObj.company;

  const target = {
    raw: searchId || "",
    decoded: decodeURIComponent(searchId || ""),
    norm: normalizeKey(decodeURIComponent(searchId || "")),
    slug: slugify(decodeURIComponent(searchId || ""))
  };

  // First pass: exact dashId match
  for (const deptName of Object.keys(company)) {
    const dept = company[deptName];
    for (const sectionName of Object.keys(dept)) {
      const section = dept[sectionName];
      for (const dashName of Object.keys(section)) {
        const dashObj = section[dashName];
        if (!dashObj) continue;
        // exact dashId
        if (dashObj.dashId && dashObj.dashId === target.decoded) {
          return { deptName, sectionName, dashName, dashObj, matchType: "dashId-exact" };
        }
        // exact dashId (raw param)
        if (dashObj.dashId && dashObj.dashId === target.raw) {
          return { deptName, sectionName, dashName, dashObj, matchType: "dashId-raw" };
        }
      }
    }
  }

  // Second pass: exact dashboard name match (case-insensitive)
  for (const deptName of Object.keys(company)) {
    const dept = company[deptName];
    for (const sectionName of Object.keys(dept)) {
      const section = dept[sectionName];
      for (const dashName of Object.keys(section)) {
        const dashObj = section[dashName];
        if (dashName === target.decoded || dashName === target.raw) {
          return { deptName, sectionName, dashName, dashObj, matchType: "dashName-exact" };
        }
        if (normalizeKey(dashName) === target.norm) {
          return { deptName, sectionName, dashName, dashObj, matchType: "dashName-norm" };
        }
      }
    }
  }

  // Third pass: slug match (dashId or dashName slugified)
  for (const deptName of Object.keys(company)) {
    const dept = company[deptName];
    for (const sectionName of Object.keys(dept)) {
      const section = dept[sectionName];
      for (const dashName of Object.keys(section)) {
        const dashObj = section[dashName];
        const dashIdSlug = dashObj?.dashId ? slugify(dashObj.dashId) : null;
        const dashNameSlug = slugify(dashName);
        if (dashIdSlug === target.slug || dashNameSlug === target.slug) {
          return { deptName, sectionName, dashName, dashObj, matchType: "slug-match" };
        }
      }
    }
  }

  // Not found: return null
  return null;
}

export default function DashboardPlaceholder() {
  const { id } = useParams();
  const dashIdParam = id || "";

  const node = useMemo(() => findDashboardNode(manifest, dashIdParam), [dashIdParam]);

  const embedUrl = node?.dashObj?.embedUrl || node?.dashObj?.embedUrl || "";

  // helpful list of close matches (for UI when not found)
  const suggestions = useMemo(() => {
    if (node) return [];
    const q = decodeURIComponent(dashIdParam || "").toLowerCase();
    if (!q) return [];
    const out = [];
    const company = manifest.company || {};
    for (const deptName of Object.keys(company)) {
      const dept = company[deptName];
      for (const sectionName of Object.keys(dept)) {
        const section = dept[sectionName];
        for (const dashName of Object.keys(section)) {
          const dashObj = section[dashName];
          const nameNorm = normalizeKey(dashName);
          if (nameNorm.includes(normalizeKey(q))) {
            out.push({ deptName, sectionName, dashName, dashObj });
          }
        }
      }
    }
    return out.slice(0, 8);
  }, [dashIdParam]);

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 min-w-0 lg:w-64">
          <Sidebar compact />
        </aside>

        <main className="col-span-12 lg:col-span-9 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{node ? node.dashName : decodeURIComponent(dashIdParam || "")}</h1>
              {node ? <div className="text-sm text-slate-500">{node.sectionName} — {node.deptName}</div> : <div className="text-sm text-slate-500">Dashboard not found</div>}
            </div>

            <div>
              <Link to={`/data-manager?dept=${encodeURIComponent(node?.deptName || "")}&dash=${encodeURIComponent(node?.dashObj?.dashId || dashIdParam)}`} className="px-3 py-2 rounded-md border">Datasets</Link>
            </div>
          </div>

          <div className="card p-4">
            {node && embedUrl ? (
              <iframe title={node?.dashName || dashIdParam} src={embedUrl} style={{ width: "100%", maxWidth: "100%", height: 640, border: 0 }} />
            ) : node && !embedUrl ? (
              <div className="text-sm text-slate-500">This dashboard is registered but no embed URL is configured.</div>
            ) : (
              <div>
                <div className="text-sm text-slate-500 mb-4">Could not find a dashboard that matches <strong>{decodeURIComponent(dashIdParam || "")}</strong>.</div>

                {suggestions.length > 0 ? (
                  <div>
                    <div className="text-sm font-medium mb-2">Did you mean:</div>
                    <div className="grid gap-2">
                      {suggestions.map(s => (
                        <Link key={`${s.deptName}-${s.dashName}`} to={`/dash/${encodeURIComponent(s.dashObj?.dashId || s.dashName)}`} className="p-3 border rounded-md hover:shadow-sm">
                          <div className="font-medium">{s.dashName}</div>
                          <div className="text-xs text-slate-500">{s.sectionName} • {s.deptName}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">No close matches found. Check your URL or open the dashboard from the Departments / Sidebar menu.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
