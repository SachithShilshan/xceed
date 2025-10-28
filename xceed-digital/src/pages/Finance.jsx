import React from "react";
import PowerBIEmbed from "../components/PowerBIEmbed";

export default function Finance(){
  const embedUrl = "https://app.powerbi.com/reportEmbed?reportId=4ce8262e-8c41-42bc-93ee-d80be922ad50&autoAuth=true&ctid=c1e2da04-87a7-4c79-90a9-0a2a54d6db05&actionBarEnabled=true";

  return (
    <>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
        <div>
          <h2 style={{margin:0}}>Finance</h2>
          <div className="small">Earnings dashboard & finance reports</div>
        </div>
        <div className="small">Last refreshed: Oct 28, 2025</div>
      </div>

      <div className="dept-grid">
        <div>
          <PowerBIEmbed title="Earnings Dashboard" src={embedUrl} />

          <div style={{height:18}} />

          <div className="card">
            <div style={{fontWeight:700, marginBottom:8}}>Reports</div>
            <div className="small">Available downloads & quick links</div>
            <ul style={{marginTop:12}}>
              <li><a href={embedUrl} target="_blank" rel="noreferrer">Open full interactive report (Power BI)</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); alert("You can add PDF export links or CSV downloads here.")}}>Download monthly P&L (PDF)</a></li>
            </ul>
          </div>
        </div>

        <aside>
          <div className="card">
            <div style={{fontWeight:700}}>Quick actions</div>
            <div style={{marginTop:10}}>
              <button className="btn" style={{width:"100%", marginBottom:8}} onClick={()=>window.open(embedUrl, "_blank")}>Open report in Power BI</button>
              <button className="btn" style={{width:"100%"}} onClick={()=>alert("Automation endpoint is backend-led; add service to trigger automations.")}>Trigger month-end automation</button>
            </div>
          </div>

          <div style={{height:14}}/>
          <div className="card">
            <div style={{fontWeight:700}}>Notes</div>
            <div className="small" style={{marginTop:8}}>
              Use the filters inside the embedded report to change time periods and branches. If the embed prompts for login, sign-in with your Power BI account.
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
