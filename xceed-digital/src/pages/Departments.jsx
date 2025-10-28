import React from "react";
import { Link } from "react-router-dom";

export default function Departments(){
  const cards = [
    {title:"Finance", path:"/departments/finance", desc:"Revenue, P&L, forecasts"},
    {title:"HR", path:"/departments/hr", desc:"Headcount, attrition"},
    {title:"Operations", path:"/departments/operations", desc:"SLAs, deliveries"}
  ];

  return (
    <>
      <h2>Departments</h2>
      <div className="grid">
        {cards.map(c => (
          <div className="card" key={c.title}>
            <div style={{fontWeight:700, marginBottom:8}}>{c.title}</div>
            <div className="small">{c.desc}</div>
            <div style={{marginTop:12}}>
              <Link to={c.path} className="btn">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
