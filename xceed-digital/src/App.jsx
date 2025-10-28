import React from "react";
import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
import Finance from "./pages/Finance";
import HR from "./pages/HR";
import Operations from "./pages/Operations";

export default function App(){
  return (
    <div className="app-shell">
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/departments" element={<Departments/>} />
          <Route path="/departments/finance" element={<Finance/>} />
          <Route path="/departments/hr" element={<HR/>} />
          <Route path="/departments/operations" element={<Operations/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
