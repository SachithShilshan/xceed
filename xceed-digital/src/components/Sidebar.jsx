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
          { id: "risk-comp", title: "Risk & Compliance Dashboard", route: "/dash/risk-compliance" }
        ]
      }
    ]
  },

  {
    id: "hr",
    title: "Human Resources (HR)",
    children: [
      {
        id: "recruitment",
        title: "Recruitment",
        dashboards: [{ id: "hiring-funnel", title: "Hiring Funnel Dashboard", route: "/dash/hiring-funnel" }]
      },
      {
        id: "payroll",
        title: "Payroll & Compensation",
        dashboards: [{ id: "payroll-analytics", title: "Payroll & Salary Analytics", route: "/dash/payroll-analytics" }]
      },
      {
        id: "employee-rel",
        title: "Employee Relations",
        dashboards: [{ id: "attrition", title: "Attrition / Employee Satisfaction Dashboard", route: "/dash/attrition" }]
      },
      {
        id: "ld",
        title: "Learning & Development",
        dashboards: [{ id: "training", title: "Training Performance Dashboard", route: "/dash/training-performance" }]
      }
    ]
  },

  {
    id: "finance",
    title: "Finance & Accounting",
    children: [
      {
        id: "ap",
        title: "Accounts Payable",
        dashboards: [{ id: "ap-aging", title: "AP Aging Dashboard", route: "/dash/ap-aging" }]
      },
      {
        id: "ar",
        title: "Accounts Receivable",
        dashboards: [{ id: "ar-aging", title: "AR Aging Dashboard", route: "/dash/ar-aging" }]
      },
      {
        id: "treasury",
        title: "Treasury",
        dashboards: [{ id: "cash-flow", title: "Cash Flow Dashboard", route: "/dash/cash-flow" }]
      },
      {
        id: "budgeting",
        title: "Budgeting & Reporting",
        dashboards: [{ id: "budget-vs-actual", title: "Budget vs Actual Dashboard", route: "/dash/budget-vs-actual" }]
      }
    ]
  },

  {
    id: "operations",
    title: "Operations",
    children: [
      {
        id: "proc-mgmt",
        title: "Process Management",
        dashboards: [{ id: "sla-efficiency", title: "SLA & Efficiency Dashboard", route: "/dash/sla-efficiency" }]
      },
      {
        id: "supply",
        title: "Supply Chain / Logistics",
        dashboards: [{ id: "inventory", title: "Inventory & Supply Chain Dashboard", route: "/dash/inventory-supply" }]
      },
      {
        id: "production",
        title: "Production / Manufacturing",
        dashboards: [{ id: "production", title: "Production Output & Downtime Dashboard", route: "/dash/production-output" }]
      },
      {
        id: "quality",
        title: "Quality Control",
        dashboards: [{ id: "quality", title: "Quality & Defects Dashboard", route: "/dash/quality-defects" }]
      }
    ]
  },

  {
    id: "sales",
    title: "Sales",
    children: [
      {
        id: "field",
        title: "Field Sales",
        dashboards: [{ id: "territory", title: "Territory Performance Dashboard", route: "/dash/territory-performance" }]
      },
      {
        id: "inside",
        title: "Inside Sales",
        dashboards: [{ id: "lead-conv", title: "Lead Conversion Dashboard", route: "/dash/lead-conversion" }]
      },
      {
        id: "planning",
        title: "Sales Planning",
        dashboards: [{ id: "sales-planning", title: "Sales Target vs Actual Dashboard", route: "/dash/sales-targets" }]
      }
    ]
  },

  {
    id: "marketing",
    title: "Marketing",
    children: [
      {
        id: "digital",
        title: "Digital Marketing",
        dashboards: [{ id: "campaign", title: "Campaign & Web Analytics Dashboard", route: "/dash/campaign-analytics" }]
      },
      {
        id: "branding",
        title: "Branding & PR",
        dashboards: [{ id: "brand", title: "Brand Awareness Dashboard", route: "/dash/brand-awareness" }]
      },
      {
        id: "research",
        title: "Market Research",
        dashboards: [{ id: "customer-insights", title: "Customer Insights Dashboard", route: "/dash/customer-insights" }]
      }
    ]
  },

  {
    id: "it",
    title: "IT / Technology",
    children: [
      {
        id: "support",
        title: "IT Support / Helpdesk",
        dashboards: [{ id: "incidents", title: "Incident & SLA Dashboard", route: "/dash/incidents" }]
      },
      {
        id: "infra",
        title: "Infrastructure",
        dashboards: [{ id: "uptime", title: "System Uptime & Asset Dashboard", route: "/dash/system-uptime" }]
      },
      {
        id: "dev",
        title: "Software Development",
        dashboards: [{ id: "sprints", title: "Project & Sprint Dashboard", route: "/dash/project-sprints" }]
      },
      {
        id: "cyber",
        title: "Cybersecurity",
        dashboards: [{ id: "security", title: "Security Alerts & Threat Dashboard", route: "/dash/security-alerts" }]
      }
    ]
  },

  {
    id: "customer-service",
    title: "Customer Service",
    children: [
      {
        id: "call",
        title: "Call Center",
        dashboards: [{ id: "call-volume", title: "Call Volume & SLA Dashboard", route: "/dash/call-volume" }]
      },
      {
        id: "support-desk",
        title: "Support Desk",
        dashboards: [{ id: "ticket-resolution", title: "Ticket Resolution Dashboard", route: "/dash/ticket-resolution" }]
      },
      {
        id: "cx",
        title: "Customer Experience",
        dashboards: [{ id: "csat", title: "CSAT / NPS Feedback Dashboard", route: "/dash/csat-nps" }]
      }
    ]
  }
];

export default function Sidebar({ compact = false }) {
  return (
    <div className={`sticky top-20 ${compact ? 'w-44' : 'w-full'}`}>
      <div className="card p-4 mb-4">
        <div className="text-sm font-semibold">Company</div>
        <div className="text-xs text-slate-500 mt-1">Browse departments & dashboards</div>
      </div>

      <nav className="space-y-4 px-1">
        {structure.map(section => (
          <div key={section.id}>
            <div className="text-xs font-semibold text-slate-500 px-2">{section.title}</div>

            <div className="mt-2 space-y-2">
              {section.children.map(area => (
                <div key={area.id} className="pl-2">
                  <div className="text-sm font-medium text-slate-700">{area.title}</div>
                  <div className="mt-1 ml-3 space-y-1">
                    {area.dashboards.map(d => (
                      <Link
                        key={d.id}
                        to={d.route}
                        className="block text-sm px-2 py-1 rounded-md hover:bg-slate-50 text-slate-700"
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
