import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="space-y-8">
      <section className="bg-white card p-8 hero-accent">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Xceed Digital</h1>
            <p className="mt-3 text-slate-600 max-w-xl">
              Empowering organisations with data, automation and AI. Explore departmental dashboards, generate reports, and trigger automations from a single portal.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/departments" className="inline-flex items-center px-5 py-3 rounded-md bg-xceed-500 text-white font-semibold shadow">Open Portal</Link>
              <a href="#contact" className="inline-flex items-center px-4 py-3 rounded-md border">Request a dashboard</a>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 card">
                <div className="text-xs text-slate-400">Monthly Revenue</div>
                <div className="mt-1 text-xl font-bold">₨ 12.3M</div>
                <div className="text-sm text-emerald-600 mt-1">+8% vs last month</div>
              </div>
              <div className="p-4 card">
                <div className="text-xs text-slate-400">Active Users</div>
                <div className="mt-1 text-xl font-bold">1,240</div>
                <div className="text-sm text-slate-500 mt-1">Platform-wide</div>
              </div>
              <div className="p-4 card">
                <div className="text-xs text-slate-400">Model Accuracy</div>
                <div className="mt-1 text-xl font-bold">92%</div>
                <div className="text-sm text-slate-500 mt-1">Sales forecast model</div>
              </div>
              <div className="p-4 card">
                <div className="text-xs text-slate-400">Automations</div>
                <div className="mt-1 text-xl font-bold">18</div>
                <div className="text-sm text-slate-500 mt-1">Active flows</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Departments</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <Link to="/departments/finance" className="p-5 card hover:shadow-lg transition">
            <div className="font-semibold">Finance</div>
            <div className="text-sm text-slate-500 mt-1">Revenue, P&L, forecasts</div>
          </Link>
          <Link to="/departments/hr" className="p-5 card hover:shadow-lg transition">
            <div className="font-semibold">HR</div>
            <div className="text-sm text-slate-500 mt-1">Headcount, attrition</div>
          </Link>
          <Link to="/departments/operations" className="p-5 card hover:shadow-lg transition">
            <div className="font-semibold">Operations</div>
            <div className="text-sm text-slate-500 mt-1">SLA & delivery metrics</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
