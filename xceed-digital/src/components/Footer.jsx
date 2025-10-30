import React from "react";

export default function Footer(){
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Xceed — Transforming data into clarity, action & growth. • <a href="mailto:hello@xceed.example" className="text-slate-600 underline">hello@xceed.example</a>
      </div>
    </footer>
  );
}
