import React from "react";
import { Link } from "react-router-dom";
import PowerBIEmbed from "../components/PowerBIEmbed";
import Sidebar from "../components/Sidebar";

export default function CompanyKPI() {
  const embedUrl =
    "https://app.powerbi.com/reportEmbed?reportId=4ce8262e-8c41-42bc-93ee-d80be922ad50&autoAuth=true&ctid=c1e2da04-87a7-4c79-90a9-0a2a54d6db05&actionBarEnabled=true";

  const lastRefreshed = "Oct 30, 2025";

  return (
    <div className="w-full px-4 md:px-6 lg:px-10">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <Sidebar activeDept="executive" />
        </aside>

        {/* Main content */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Company KPI Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Strategic performance tracking & company-wide KPIs
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">
                Last refreshed:{" "}
                <span className="font-medium text-slate-700">
                  {lastRefreshed}
                </span>
              </div>

              <Link
                to="/data-manager?dept=executive&dash=company-kpi"
                className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:shadow-sm text-sm text-slate-700"
              >
                Go to Dataset
              </Link>
            </div>
          </div>

          {/* Power BI Embed */}
          <PowerBIEmbed title="Company KPI Dashboard" src={embedUrl} />

          {/* Quick Actions */}
          <div className="card p-4">
            <div className="font-semibold text-slate-900">Quick Actions</div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => window.open(embedUrl, "_blank")}
                className="w-full px-3 py-2 rounded-md border text-sm"
              >
                Open in Power BI
              </button>
              <Link
                to="/data-manager?dept=executive&dash=company-kpi"
                className="w-full block text-center px-3 py-2 rounded-md border text-sm"
              >
                Manage Datasets
              </Link>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-4">
            <div className="font-semibold text-slate-900">Notes</div>
            <p className="text-sm text-slate-500 mt-2">
              The Company KPI dashboard consolidates core metrics across
              departments. Use Power BI filters to analyze performance trends by
              business unit, period, and region.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
