"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function JavaLordFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05080c] py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight text-white">
              Java<span className="text-[#a3e635]">Lord</span> Network
            </span>
            <span className="text-[9px] tracking-[0.2em] text-slate-500 uppercase">
              Smart MLM Platform
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span>© {new Date().getFullYear()} JavaLord Network. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a href="#about" className="hover:text-white transition-colors">
            About Us
          </a>
          <a href="#products" className="hover:text-white transition-colors">
            Products
          </a>
          <a href="#plan" className="hover:text-white transition-colors">
            Compensation Plan
          </a>
          <Link
            href="/payments"
            className="text-[#a3e635] hover:underline flex items-center gap-1 font-medium"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Member Dashboard</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
