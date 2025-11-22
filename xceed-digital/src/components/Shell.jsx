// src/components/Shell.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

/**
 * Shell — renders a consistent layout and shows/hides the Sidebar
 * based on the current route. Modify `sidebarRoutePrefixes` to control where the sidebar appears.
 */

export default function Shell({ children }) {
  const location = useLocation();
  const path = location.pathname || "";

  // Pages where we WANT the sidebar. Adjust to your app's routes.
  const sidebarRoutePrefixes = [
    "/departments",
    "/dash",
    // "/data-manager",
    "/gallery",
    //"/docs"
  ];

  const showSidebar = sidebarRoutePrefixes.some(prefix => path.startsWith(prefix));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-1 w-full">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {showSidebar ? (
            // two-column layout (sidebar + content)
            <div className="grid grid-cols-[280px_1fr] gap-6 items-start">
              <aside className="hidden lg:block">
                <div className="sticky top-[calc(var(--header-height,80px)+1rem)] h-[calc(100vh-80px-2rem)] overflow-auto">
                  <Sidebar />
                </div>
              </aside>

              <main className="min-w-0">
                {children}
              </main>
            </div>
          ) : (
            // single-column layout (no sidebar)
            <div>
              <main>
                {children}
              </main>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
