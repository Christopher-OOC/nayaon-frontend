"use client";

import React from "react";
import JavaLordNavbar from "@/components/javalord/JavaLordNavbar";
import JavaLordHero from "@/components/javalord/JavaLordHero";
import JavaLordProducts from "@/components/javalord/JavaLordProducts";
import JavaLordFeatures from "@/components/javalord/JavaLordFeatures";
import JavaLordFooter from "@/components/javalord/JavaLordFooter";

export default function Homepage() {
  const handleGetStarted = () => {
    const regBtn = document.getElementById("register-btn");
    if (regBtn) {
      regBtn.click();
    } else {
      const productsSection = document.getElementById("products");
      productsSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070a0f] text-slate-100 flex flex-col antialiased">
      {/* Top Header / Navigation */}
      <JavaLordNavbar />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* Hero Section with 4-card metrics and trust strip */}
        <JavaLordHero onGetStarted={handleGetStarted} />

        {/* Our Products Section */}
        <JavaLordProducts />

        {/* Bottom 4 Feature Highlights */}
        <JavaLordFeatures />
      </main>

      {/* Footer */}
      <JavaLordFooter />
    </div>
  );
}
