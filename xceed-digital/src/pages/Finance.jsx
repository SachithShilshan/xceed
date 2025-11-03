// src/pages/Finance.jsx
import React from "react";
import { Link } from "react-router-dom";
import PowerBIEmbed from "../components/PowerBIEmbed";
import Sidebar from "../components/Sidebar";

export default function Finance() {
  const embedUrl =
    "https://app.powerbi.com/reportEmbed?reportId=4ce8262e-8c41-42bc-93ee-d80be922ad50&autoAuth=true&ctid=c1e2da04-87a7-4c79-90a9-0a2a54d6db05&actionBarEnabled=true";
  const lastRefreshed = "Oct 30, 2025";

  return (
    <div className="w-full px-4 md:px-6 lg:px-10">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Sidebar (company hierarchy) */}
        <aside className="col-span-12 lg:col-span-3">
          <Sidebar activeDept="finance" />
        </aside>

        {/* MAIN: wider content */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
              <p className="text-sm text-slate-500 mt-1">
                Earnings dashboard, revenue analysis & finance datasets
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">
                Last refreshed:{" "}
                <span className="font-medium text-slate-700">{lastRefreshed}</span>
              </div>

              <Link
                to="/data-manager?dept=finance"
                className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:shadow-sm text-sm text-slate-700"
              >
                Go to Dataset
              </Link>
            </div>
          </div>

          {/* Power BI embed */}
          <PowerBIEmbed title="Earnings Dashboard" src={embedUrl} />

          {/* Reports & quick links */}
          <div className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-semibold text-slate-900">Reports</div>
                <div className="text-sm text-slate-500 mt-1">
                  Quick exports and links related to Finance.
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <div className="font-medium">Monthly P&L (PDF)</div>
                      <div className="text-xs text-slate-500">
                        Generated from finance dataset
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 text-sm rounded-md border"
                        onClick={() =>
                          alert(
                            "Download/export endpoint not configured in this demo."
                          )
                        }
                      >
                        Download
                      </button>
                      <a
                        className="text-sm text-xceed-500 underline"
                        href={embedUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Power BI
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrow right column for actions */}
              <div className="w-64 hidden md:block">
                <div className="card p-4">
                  <div className="font-semibold text-slate-900">Quick actions</div>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => window.open(embedUrl, "_blank")}
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    >
                      Open in Power BI
                    </button>

                    <button
                      onClick={() =>
                        alert(
                          "Trigger automation requires backend integration (e.g., Power Automate)."
                        )
                      }
                      className="w-full px-3 py-2 rounded-md border text-sm"
                    >
                      Trigger month-end automation
                    </button>

                    <Link
                      to="/data-manager?dept=finance"
                      className="w-full block text-center px-3 py-2 rounded-md border text-sm"
                    >
                      Manage datasets
                    </Link>
                  </div>
                </div>

                <div className="card p-4 mt-4">
                  <div className="font-semibold text-slate-900">Notes</div>
                  <p className="text-sm text-slate-500 mt-2">
                    Use the report filters inside the embedded report to change time
                    periods, branches, and scenarios. If the embed prompts for
                    sign-in, sign-in with your Power BI / Microsoft account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
