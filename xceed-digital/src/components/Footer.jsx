import React from "react";

export default function Footer(){
  return (
    <footer className="footer">
      © {new Date().getFullYear()} Xceed — Transforming data into clarity, action & growth. &nbsp; • &nbsp;
      <a href="mailto:hello@xceed.example">hello@xceed.example</a>
    </footer>
  );
}
