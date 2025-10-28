import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Nav(){
  const loc = useLocation();
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">XD</div>
        <div>
          <div className="site-title">Xceed Digital</div>
          <div className="small">Data • Automation • AI</div>
        </div>
      </div>

      <nav className="nav-links" aria-label="Main navigation">
        <Link to="/" className="btn">Home</Link>
        <Link to="/departments" className="btn">Departments</Link>
        <a className="btn" href="https://github.com" target="_blank" rel="noreferrer">Docs</a>

        <div style={{width:8}} />
        <Link to="/departments/finance" className="btn primary">Open Portal</Link>
      </nav>
    </header>
  );
}
