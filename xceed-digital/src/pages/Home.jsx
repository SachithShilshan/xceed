import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <>
      <div className="hero">
        <div className="hero-left">
          <h1 className="h1">Xceed Digital — Data & AI for real business impact</h1>
          <p className="lead">Turn data into clarity, automation, and predictive insights. Explore departmental dashboards, reports and automations.</p>
          <div style={{display:"flex", gap:12}}>
            <Link to="/departments" className="btn primary">Open Portal</Link>
            <a href="#contact" className="btn">Request Dashboard</a>
          </div>
        </div>
        <div style={{width:340}}>
          <div className="card">
            <div style={{fontWeight:700, marginBottom:8}}>Quick KPIs</div>
            <div className="kpi" style={{marginBottom:8}}>
              <div>
                <div className="value">₨ 12.3M</div>
                <div className="label">Monthly Revenue</div>
              </div>
              <div className="small">+8% vs last month</div>
            </div>
            <div className="kpi">
              <div>
                <div className="value">1,240</div>
                <div className="label">Active Users</div>
              </div>
              <div className="small">Stable</div>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{marginTop:18}}>Departments</h3>
      <div className="grid" style={{marginBottom:24}}>
        <div className="card">
          <div style={{fontWeight:700, marginBottom:8}}>Finance</div>
          <div className="small">Revenue, P&L, cash flow and forecasts</div>
          <div style={{marginTop:12}}>
            <Link to="/departments/finance" className="btn">Open Finance</Link>
          </div>
        </div>
        <div className="card">
          <div style={{fontWeight:700, marginBottom:8}}>HR</div>
          <div className="small">Headcount, attrition, payroll summaries</div>
          <div style={{marginTop:12}}>
            <Link to="/departments/hr" className="btn">Open HR</Link>
          </div>
        </div>
        <div className="card">
          <div style={{fontWeight:700, marginBottom:8}}>Operations</div>
          <div className="small">Supply chain, deliveries, SLA monitoring</div>
          <div style={{marginTop:12}}>
            <Link to="/departments/operations" className="btn">Open Operations</Link>
          </div>
        </div>
      </div>
    </>
  );
}
