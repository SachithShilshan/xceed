import React from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
import Finance from "./pages/Finance";
import HR from "./pages/HR";
import Operations from "./pages/Operations";
import DataViewer from "./pages/DataViewer";
import DataManager from "./pages/DataManager";
// ... other imports

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/finance" element={<Finance />} />
          <Route path="/departments/hr" element={<HR />} />
          <Route path="/departments/operations" element={<Operations />} />
          <Route path="/data-manager" element={<DataManager />} />
          <Route path="/data-viewer" element={<DataViewer />} />   {/* <-- new */}
        </Routes>

      </main>
      <Footer />
    </div>
  );
}
