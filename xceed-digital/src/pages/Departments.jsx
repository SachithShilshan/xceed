import React from "react";
import { Link } from "react-router-dom";

export default function Departments(){
  const list = [
    {title:"Finance", path:"/departments/finance", desc:"Revenue, P&L, forecasts"},
    {title:"HR", path:"/departments/hr", desc:"Headcount, attrition"},
    {title:"Operations", path:"/departments/operations", desc:"SLAs, deliveries"}
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Departments</h2>
      <div className="grid sm:grid-cols-3 gap-6">
        {list.map(d => (
          <Link key={d.title} to={d.path} className="card p-5 hover:shadow-lg transition">
            <div className="font-semibold text-lg">{d.title}</div>
            <div className="text-sm text-slate-500 mt-1">{d.desc}</div>
            <div className="mt-4">
              <button className="px-3 py-2 bg-xceed-500 text-white rounded-md">Open</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
