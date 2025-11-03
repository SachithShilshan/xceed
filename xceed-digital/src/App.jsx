// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
import DepartmentPage from "./pages/DepartmentPage";
import DataManager from "./pages/DataManager";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";
import CompanyKPI from "./pages/CompanyKPI";
import useHeaderOffset from "./hooks/useHeaderOffset";

export default function App() {
  // sync main padding to header height
  useHeaderOffset(); // defaults to #site-header and .site-main

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="site-main max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:deptSlug" element={<DepartmentPage />} />
          <Route path="/data-manager" element={<DataManager />} />
          <Route path="/dash/company-kpi" element={<CompanyKPI />} />
          <Route path="/dash/:id" element={<DashboardPlaceholder />} />
          <Route path="/departments" element={<Departments />} />
          
         

        </Routes>
      </main>
      <Footer />
    </div>
  );
}
