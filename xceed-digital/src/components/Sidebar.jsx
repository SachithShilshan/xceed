// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const structure = [
  {
    id: "executive",
    title: "Executive / Management",
    children: [
      {
        id: "strategy",
        title: "Strategy",
        dashboards: [
          { id: "company-kpi", title: "Company KPI Dashboard", route: "/dash/company-kpi" },
          { id: "okr", title: "OKR / Performance Scorecard", route: "/dash/okr" }
        ]
      },
      {
        id: "risk",
        title: "Risk & Governance",
        dashboards: [
          { id: "risk-comp", title: "Risk & Compliance Dashboard", route: "/dash/risk" }
        ]
      }
    ]
  },
  {
    id: "finance",
    title: "Finance & Accounting",
    children: [
      {
        id: "budget",
        title: "Budgeting & Reporting",
        dashboards: [
          { id: "budget-vs-actual", title: "Budget vs Actual Dashboard", route: "/dash/budget-vs-actual" }
        ]
      }
    ]
  }
];

export default function Sidebar({ activeDept = "" }) {
  return (
    <div className="sticky top-20">
      <div className="card p-4 mb-4">
        <div className="text-sm font-semibold">Company</div>
        <div className="text-xs text-slate-500 mt-1">
          Explore departments & dashboards
        </div>
      </div>

      <nav className="space-y-3">
        {structure.map(section => (
          <div key={section.id}>
            <div className="text-xs font-semibold text-slate-500 px-2">
              {section.title}
            </div>
            <div className="mt-2 space-y-1">
              {section.children.map(area => (
                <div key={area.id} className="pl-2">
                  <div className="text-sm font-medium text-slate-700">
                    {area.title}
                  </div>
                  <div className="mt-1 ml-2 space-y-1">
                    {area.dashboards.map(d => (
                      <Link
                        key={d.id}
                        to={d.route}
                        className={`block text-sm px-2 py-1 rounded-md hover:bg-slate-50 ${
                          section.id === activeDept ? "bg-xceed-50" : ""
                        }`}
                      >
                        {d.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
