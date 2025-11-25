// src/components/Shell.jsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

/**
 * Shell — renders a consistent layout and keeps the Sidebar fixed in place
 *
 * Behavior:
 * - Main content area uses a fixed, viewport-aware height: calc(100vh - header - footer - gap)
 *   so inner panes can use h-full and overflow-auto for independent scrolling.
 * - Sidebar has a fixed width (280px) and is sticky: it won't move when the page width changes.
 * - On small screens the sidebar is hidden by default, but can be toggled to appear as an overlay.
 *
 * Notes:
 * - Update the CSS variable --header-height in your global CSS to match your header height (default 80px).
 * - If you prefer absolute fixed pixel height (eg. 700px) change `contentHeight` calc below to h-[700px].
 */

export default function Shell({ children }) {
  const location = useLocation();
  const path = location.pathname || "";

  // Routes where we show the sidebar
  const sidebarRoutePrefixes = useMemo(() => [
    "/departments",
    "/dash",
    "/gallery",
    "/data-manager",
  ], []);

  const showSidebar = sidebarRoutePrefixes.some(prefix => path.startsWith(prefix));

  // mobile sidebar toggle (optional)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // compute content height class: using CSS calc to derive full viewport minus header and footer.
  // The header should set --header-height in CSS (example below sets to 80px). Footer assumed 64px.
  // we wrap with style to keep it simple — you can also put these in CSS classes.
  const contentStyle = {
    // subtract header (var), footer (64px) and vertical margins (2rem)
    height: `calc(100vh - var(--header-height, 80px) - 64px - 2rem)`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header must set CSS variable --header-height or rely on default 80px */}
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(v => !v)} />

      <div className="flex-1 w-full">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {showSidebar ? (
            // Desktop grid: fixed left column (280px) + flexible right content
            <div className="relative">
              <div className="grid" style={{ gridTemplateColumns: "280px 1fr", gap: "24px" }}>
                {/* LEFT: Sidebar (fixed width) */}
                <aside
                  aria-hidden={false}
                  className="hidden lg:block"
                  style={{ width: 300 }}
                >
                  {/* sticky keeps sidebar in view while right content scrolls */}
                  <div
                    className="sticky top-[calc(var(--header-height,80px)+1rem)] overflow-auto"
                    style={{ height: contentStyle.height }}
                  >
                    <Sidebar />
                  </div>
                </aside>

                {/* RIGHT: Main content area — fixed height so internal panes use h-full */}
                <main className="min-w-0" style={{ height: contentStyle.height }}>
                  {/* main content area should be independently scrollable if needed */}
                  <div className="h-full overflow-auto">
                    {children}
                  </div>
                </main>
              </div>

              {/* Mobile sidebar overlay (visible on small screens when toggled) */}
              <div
                className={`lg:hidden fixed inset-0 z-50 transition-opacity ${mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                aria-hidden={!mobileSidebarOpen}
              >
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setMobileSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 overflow-auto"
                  style={{ marginTop: "var(--header-height, 80px)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold">Navigation</div>
                    <button className="px-2 py-1 rounded-md border text-xs" onClick={() => setMobileSidebarOpen(false)}>Close</button>
                  </div>
                  <Sidebar />
                </div>
              </div>
            </div>
          ) : (
            // Single-column layout (no sidebar)
            <div>
              <main>{children}</main>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
