// src/pages/DepartmentPage.jsx
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

/**
 * DepartmentPage.jsx
 * Reusable department page that reads deptSlug from the URL and renders:
 * - header (department title + description)
 * - list of dashboards with Open and Datasets buttons
 *
 * Edit departmentsConfig below to add dashboards, embed URLs, descriptions, etc.
 */

const departmentsConfig = {
  executive: {
    title: "Executive / Management",
    desc: "Strategy, governance and executive KPIs — company-level performance and risk oversight.",
    dashboards: [
      { id: "company-kpi", title: "Company KPI Dashboard", route: "/dash/company-kpi", embedUrl: "https://app.powerbi.com/reportEmbed?reportId=4ce8262e-8c41-42bc-93ee-d80be922ad50&autoAuth=true" },
      { id: "okr", title: "OKR / Performance Scorecard", route: "/dash/okr", embedUrl: "" },
      { id: "risk-compliance", title: "Risk & Compliance Dashboard", route: "/dash/risk-compliance", embedUrl: "" }
    ]
  },

  hr: {
    title: "Human Resources (HR)",
    desc: "Headcount, recruitment, payroll, engagement and learning metrics.",
    dashboards: [
      { id: "hiring-funnel", title: "Hiring Funnel Dashboard", route: "/dash/hiring-funnel", embedUrl: "" },
      { id: "payroll-analytics", title: "Payroll & Salary Analytics", route: "/dash/payroll-analytics", embedUrl: "" },
      { id: "attrition", title: "Attrition / Employee Satisfaction Dashboard", route: "/dash/attrition", embedUrl: "" },
      { id: "training-performance", title: "Training Performance Dashboard", route: "/dash/training-performance", embedUrl: "" }
    ]
  },

  finance: {
    title: "Finance & Accounting",
    desc: "Revenue, P&L, cash flow, AP/AR and budgeting — finance insights for decision making.",
    dashboards: [
      { id: "ap-aging", title: "AP Aging Dashboard", route: "/dash/ap-aging", embedUrl: "" },
      { id: "ar-aging", title: "AR Aging Dashboard", route: "/dash/ar-aging", embedUrl: "" },
      { id: "cash-flow", title: "Cash Flow Dashboard", route: "/dash/cash-flow", embedUrl: "" },
      { id: "budget-vs-actual", title: "Budget vs Actual Dashboard", route: "/dash/budget-vs-actual", embedUrl: "" }
    ]
  },

  operations: {
    title: "Operations",
    desc: "Process management, supply chain, production and quality metrics.",
    dashboards: [
      { id: "sla-efficiency", title: "SLA & Efficiency Dashboard", route: "/dash/sla-efficiency", embedUrl: "" },
      { id: "inventory-supply", title: "Inventory & Supply Chain Dashboard", route: "/dash/inventory-supply", embedUrl: "" },
      { id: "production-output", title: "Production Output & Downtime Dashboard", route: "/dash/production-output", embedUrl: "" },
      { id: "quality-defects", title: "Quality & Defects Dashboard", route: "/dash/quality-defects", embedUrl: "" }
    ]
  },

  sales: {
    title: "Sales",
    desc: "Territory performance, lead conversion and sales planning metrics.",
    dashboards: [
      { id: "territory-performance", title: "Territory Performance Dashboard", route: "/dash/territory-performance", embedUrl: "" },
      { id: "lead-conversion", title: "Lead Conversion Dashboard", route: "/dash/lead-conversion", embedUrl: "" },
      { id: "sales-targets", title: "Sales Target vs Actual Dashboard", route: "/dash/sales-targets", embedUrl: "" }
    ]
  },

  marketing: {
    title: "Marketing",
    desc: "Campaign performance, brand and customer insights.",
    dashboards: [
      { id: "campaign-analytics", title: "Campaign & Web Analytics Dashboard", route: "/dash/campaign-analytics", embedUrl: "" },
      { id: "brand-awareness", title: "Brand Awareness Dashboard", route: "/dash/brand-awareness", embedUrl: "" },
      { id: "customer-insights", title: "Customer Insights Dashboard", route: "/dash/customer-insights", embedUrl: "" }
    ]
  },

  it: {
    title: "IT / Technology",
    desc: "Support, infrastructure, development and cybersecurity metrics.",
    dashboards: [
      { id: "incidents", title: "Incident & SLA Dashboard", route: "/dash/incidents", embedUrl: "" },
      { id: "system-uptime", title: "System Uptime & Asset Dashboard", route: "/dash/system-uptime", embedUrl: "" },
      { id: "project-sprints", title: "Project & Sprint Dashboard", route: "/dash/project-sprints", embedUrl: "" },
      { id: "security-alerts", title: "Security Alerts & Threat Dashboard", route: "/dash/security-alerts", embedUrl: "" }
    ]
  },

  "customer-service": {
    title: "Customer Service",
    desc: "Call center, ticketing and customer experience metrics.",
    dashboards: [
      { id: "call-volume", title: "Call Volume & SLA Dashboard", route: "/dash/call-volume", embedUrl: "" },
      { id: "ticket-resolution", title: "Ticket Resolution Dashboard", route: "/dash/ticket-resolution", embedUrl: "" },
      { id: "csat-nps", title: "CSAT / NPS Feedback Dashboard", route: "/dash/csat-nps", embedUrl: "" }
    ]
  },

  maintenance: {
    title: "Maintenance",
    desc: "Asset maintenance schedules, downtime and maintenance KPIs.",
    dashboards: [
      { id: "maintenance-overview", title: "Maintenance Overview Dashboard", route: "/dash/maintenance-overview", embedUrl: "" }
    ]
  }
};

export default function DepartmentPage() {
  const { deptSlug } = useParams();
  const dept = departmentsConfig[deptSlug];

  const safeDept = useMemo(() => dept || {
    title: "Unknown Department",
    desc: "This department is not configured yet. You can add it to departmentsConfig in DepartmentPage.jsx",
    dashboards: []
  }, [dept]);

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 gap-6">
        {/* left: sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <Sidebar />
        </aside>

        {/* main content */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{safeDept.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{safeDept.desc}</p>
            </div>

            <div className="flex gap-2 items-start">
              <Link to="/data-manager" className="px-3 py-2 rounded-md border text-sm">Data Manager</Link>
              <Link to="/departments" className="px-3 py-2 rounded-md border text-sm">All Departments</Link>
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-3">Dashboards</h2>

            {safeDept.dashboards.length === 0 ? (
              <div className="card p-4">
                <div className="text-sm text-slate-500">No dashboards configured for this department yet.</div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {safeDept.dashboards.map(d => (
                  <article key={d.id} className="card p-4 hover:shadow-lg transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">{d.title}</div>
                        <div className="text-xs text-slate-500 mt-1">Dashboard</div>

                        {/* optional short description */}
                        {d.shortDesc && <div className="text-sm text-slate-600 mt-2">{d.shortDesc}</div>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link to={d.route} className="px-3 py-2 rounded-md border text-sm text-center">Open</Link>
                        <Link to={`/data-manager?dept=${deptSlug}&dash=${d.id}`} className="px-3 py-2 rounded-md border text-sm text-center">Datasets</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
