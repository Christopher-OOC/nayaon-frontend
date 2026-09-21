"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JavaLordNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSponsor, setRegSponsor] = useState("JL-884920 (Founder)");
  const [regSuccess, setRegSuccess] = useState(false);

  const navItems = [
    { id: "home", label: "Home", href: "#hero" },
    { id: "about", label: "About Us", href: "#about" },
    { id: "products", label: "Products", href: "#products" },
    { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setRegisterOpen(false);
    }, 2000);
  };

  return (
    <>
      <header
        id="javalord-header"
        className="sticky top-0 z-40 w-full bg-[#070a0f]/90 backdrop-blur-md border-b border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
            id="brand-logo"
          >
            {/* Custom Green Spiral / Knot Emblem */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9 drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  stroke="url(#limeGradient)"
                  strokeWidth="1.5"
                  className="opacity-40"
                />
                <path
                  d="M10 22C9 17 12 11 18 10C24 9 27 13 25 19C23.5 23.5 18 24.5 15 22C12.5 20 13.5 15.5 17 15C19.5 14.7 21 16.5 20.5 18.5"
                  stroke="#a3e635"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="18" cy="18" r="2.2" fill="#bef264" />
                <defs>
                  <linearGradient
                    id="limeGradient"
                    x1="0"
                    y1="0"
                    x2="36"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#a3e635" />
                    <stop offset="1" stopColor="#15803d" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col leading-none">
              <div className="text-xl font-bold tracking-tight">
                <span className="text-white">Nay</span>
                <span className="text-[#a3e635]">aon</span>
              </div>
            </div>
          </Link>

          {/* CENTER DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium" id="desktop-nav">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 transition-colors duration-150 ${isActive
                      ? "text-white font-semibold"
                      : "text-slate-300 hover:text-white"
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#a3e635] rounded-full shadow-[0_0_8px_#a3e635]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* RIGHT CTA BUTTONS */}
          <div className="hidden sm:flex items-center gap-3" id="auth-actions">
            {/* Dashboard portal link */}

            <button
              id="login-btn"
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white bg-[#0e131d] border border-slate-800 hover:border-slate-700 hover:bg-[#141b29] transition-all cursor-pointer"
            >
              Login
            </button>

            <button
              id="register-btn"
              onClick={() => setRegisterOpen(true)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-black bg-[#a3e635] hover:bg-[#bef264] active:scale-95 transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] cursor-pointer"
            >
              Register
            </button>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              id="mobile-register-btn"
              onClick={() => setRegisterOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-black bg-[#a3e635]"
            >
              Register
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 bg-[#0e131d]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#0a0e16] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === item.id
                      ? "bg-[#141c2b] text-[#a3e635]"
                      : "text-slate-300 hover:bg-[#101622]"
                    }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                href="/payments"
                className="w-full py-2.5 rounded-lg text-sm font-medium text-center text-slate-300 bg-[#0e131d] border border-slate-800 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#a3e635]" />
                Member Portal
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginOpen(true);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-[#131a27] border border-slate-700"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRegisterOpen(true);
                }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-black bg-[#a3e635]"
              >
                Register Now
              </button>
            </div>
          </div>
        )}
      </header>

      {/* LOGIN DIALOG */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="bg-[#0c111a] border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635]"></span>
              Welcome back to JavaLord
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Enter your distributor ID or email to access your network dashboard.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoginOpen(false);
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs text-slate-300">Email or Member ID</Label>
              <Input
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. member@javalord.com or JL-25841"
                className="mt-1 bg-[#121824] border-slate-800 text-white placeholder:text-slate-600 focus:border-[#a3e635]"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-slate-300">Password</Label>
              <Input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-[#121824] border-slate-800 text-white placeholder:text-slate-600 focus:border-[#a3e635]"
                required
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-700 accent-[#a3e635]" />
                Remember me
              </label>
              <a href="#" className="text-[#a3e635] hover:underline">
                Forgot password?
              </a>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-semibold mt-2"
            >
              Sign In to Account
            </Button>
            <p className="text-center text-xs text-slate-400">
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setLoginOpen(false);
                  setRegisterOpen(true);
                }}
                className="text-[#a3e635] font-semibold hover:underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* REGISTER DIALOG */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-[#0c111a] border-slate-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-[#a3e635]" />
              Join the JavaLord Network
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Start earning daily commissions, build your team, and access premium wholesale products.
            </DialogDescription>
          </DialogHeader>

          {regSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-[#a3e635]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Welcome to JavaLord!</h3>
              <p className="text-sm text-slate-300 max-w-xs mx-auto">
                Your member account has been registered under sponsor {regSponsor}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Full Name</Label>
                  <Input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1 bg-[#121824] border-slate-800 text-white placeholder:text-slate-600 focus:border-[#a3e635]"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Email Address</Label>
                  <Input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="mt-1 bg-[#121824] border-slate-800 text-white placeholder:text-slate-600 focus:border-[#a3e635]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-300">Sponsor / Referrer ID</Label>
                <Input
                  value={regSponsor}
                  onChange={(e) => setRegSponsor(e.target.value)}
                  className="mt-1 bg-[#121824] border-slate-800 text-[#a3e635] font-mono text-sm focus:border-[#a3e635]"
                  required
                />
              </div>

              <div className="bg-[#121824]/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Starter Kit Package:</span>
                  <span className="text-[#a3e635]">Vital Max + Coffee Sample</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Includes immediate access to distributor pricing, PV earnings, and binary tree placement.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-bold py-2.5 mt-2"
              >
                Complete Registration & Join Now
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
