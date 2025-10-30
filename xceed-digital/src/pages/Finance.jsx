import React from "react";
import { Link } from "react-router-dom";
import PowerBIEmbed from "../components/PowerBIEmbed";

export default function Finance() {
  // Power BI dashboard embed URL
  const embedUrl =
    "https://app.powerbi.com/reportEmbed?reportId=4ce8262e-8c41-42bc-93ee-d80be922ad50&autoAuth=true&ctid=c1e2da04-87a7-4c79-90a9-0a2a54d6db05&actionBarEnabled=true";

  // New OneDrive Excel embed URL
  const excelEmbedUrl =
    "https://1drv.ms/x/c/2c9d502198273e67/IQSzi1f4O8g1T7qv3t__mmU8AdFXax9HDcVFpTzlONu0Kx0";

  const lastRefreshed = "Oct 30, 2025";

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
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
              <span className="font-medium text-slate-700">
                {lastRefreshed}
              </span>
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

        {/* Excel embed (OneDrive) */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-slate-900">
                Finance Data Workbook
              </div>
              <div className="text-sm text-slate-500">
                OneDrive Excel embedded inside the page (editable if you have
                permission)
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={excelEmbedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-md border text-sm"
              >
                Open in new tab
              </a>
            </div>
          </div>

          {/* Inline Excel iframe */}
          <div className="rounded-md overflow-hidden border">
            <div className="responsive-iframe">
              <iframe
                src={excelEmbedUrl}
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                title="Finance Excel Workbook"
              ></iframe>
            </div>

          </div>
        </div>

        {/* Reports */}
        <div className="card p-4">
          <div className="font-semibold text-slate-900 mb-2">Reports</div>
          <div className="space-y-3">
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
                    alert("Export feature not yet implemented in this demo.")
                  }
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
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

        <div className="card p-4">
          <div className="font-semibold text-slate-900">Notes</div>
          <p className="text-sm text-slate-500 mt-2">
            The embedded Excel workbook allows in-page viewing and, if you are
            signed in to Microsoft 365, editing. Changes save automatically to
            OneDrive.
          </p>
        </div>

        <div className="card p-4">
          <div className="font-semibold text-slate-900">Contact</div>
          <p className="text-sm text-slate-500 mt-2">
            For dashboard requests or data issues, email{" "}
            <a
              className="text-xceed-500 underline"
              href="mailto:hello@xceed.example"
            >
              hello@xceed.example
            </a>
          </p>
        </div>
      </aside>
    </div>
  );
}
