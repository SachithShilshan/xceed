import React from "react";

export default function HR(){
  return (
    <>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
        <div>
          <h2 style={{margin:0}}>HR</h2>
          <div className="small">People analytics & headcount</div>
        </div>
        <div className="small">Last updated: Oct 28, 2025</div>
      </div>

      <div className="card">
        <div style={{fontWeight:700}}>HR Dashboards</div>
        <div className="small" style={{marginTop:8}}>Add your HR report embeds here (publish-to-web or user-owns-data).</div>
      </div>
    </>
  );
}
