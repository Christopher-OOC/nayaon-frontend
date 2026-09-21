"use client";

import React, { useState } from "react";
import {
  Users,
  Wallet,
  ShoppingBag,
  Trophy,
  ArrowRight,
  Play,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface JavaLordHeroProps {
  onGetStarted?: () => void;
}

export default function JavaLordHero({ onGetStarted }: JavaLordHeroProps) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section id="hero" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/4 -z-10 w-96 h-96 bg-[#a3e635]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 -z-10 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: HEADLINE & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121922] border border-[#a3e635]/30 text-amber-300 text-xs font-medium tracking-wide shadow-[0_0_12px_rgba(163,230,53,0.1)]">
              <span className="text-[#a3e635] font-bold text-sm leading-none">&</span>
              <span>The Future of Smart Network Marketing</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12]">
              Build Your Network. <br />
              Earn <span className="text-[#a3e635]">Without Limits.</span>
            </h1>

            {/* Subheading */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Join thousands of ambitious people building wealth through our trusted MLM platform. Quality products, powerful compensation plan, and financial freedom.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-get-started-btn"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg text-black bg-[#a3e635] hover:bg-[#bef264] font-bold text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(163,230,53,0.35)] hover:shadow-[0_0_25px_rgba(163,230,53,0.5)] active:scale-98 transition-all cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-learn-more-btn"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg text-white bg-[#0e141f] hover:bg-[#151e2e] border border-slate-800 hover:border-slate-700 font-semibold text-sm sm:text-base transition-all cursor-pointer"
              >
                <span>Learn More</span>
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 STAT METRIC CARDS + TRUST STRIP */}
          <div className="lg:col-span-6 space-y-4">
            {/* 4 Cards Grid (2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* CARD 1: Active Members */}
              <div
                id="stat-active-members"
                className="bg-[#0e141f]/90 border border-slate-800/90 hover:border-slate-700 p-5 rounded-xl transition-all hover:bg-[#111826] space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[#a3e635]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    25,684+
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Active Members
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/20 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  <span>↑ 18.5% this month</span>
                </div>
              </div>

              {/* CARD 2: Total Paid Out */}
              <div
                id="stat-total-paid"
                className="bg-[#0e141f]/90 border border-slate-800/90 hover:border-slate-700 p-5 rounded-xl transition-all hover:bg-[#111826] space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    ₦125.8M+
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Total Paid Out
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#a3e635] bg-[#a3e635]/10 border border-[#a3e635]/20 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  <span>↑ 22.3% this month</span>
                </div>
              </div>

              {/* CARD 3: Quality Products */}
              <div
                id="stat-quality-products"
                className="bg-[#0e141f]/90 border border-slate-800/90 hover:border-slate-700 p-5 rounded-xl transition-all hover:bg-[#111826] space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    12+
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Quality Products
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Premium & Affordable
                </div>
              </div>

              {/* CARD 4: Rank Levels */}
              <div
                id="stat-rank-levels"
                className="bg-[#0e141f]/90 border border-slate-800/90 hover:border-slate-700 p-5 rounded-xl transition-all hover:bg-[#111826] space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    8
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Rank Levels
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Unlimited Income Potential
                </div>
              </div>
            </div>

            {/* TRUST BANNER STRIP */}
            <div
              id="trust-strip"
              className="bg-[#0a0f17]/95 border border-slate-800/90 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              {/* Left trust text */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-[#a3e635] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Trusted • Transparent • Profitable
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Your success is our mission
                  </div>
                </div>
              </div>

              {/* Right avatars stack */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto pl-1 sm:pl-0">
                <div className="flex -space-x-2 overflow-hidden">
                  <Image
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0a0f17] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Member 1"
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                  />
                  <Image
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0a0f17] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Member 2"
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                  />
                  <Image
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0a0f17] object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Member 3"
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                  />
                  <Image
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0a0f17] object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Member 4"
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#a3e635]">10K+</span>{" "}
                  <span className="text-slate-300 font-medium">Happy Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEARN MORE MODAL */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="bg-[#0c111a] border-slate-800 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-[#a3e635] fill-[#a3e635]" />
              How the JavaLord Compensation Plan Works
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Understand our hybrid binary matrix, direct sponsorship bonuses, and leadership pools.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="aspect-video w-full rounded-lg bg-[#141b28] border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="w-14 h-14 rounded-full bg-[#a3e635]/20 border border-[#a3e635] flex items-center justify-center text-[#a3e635] mb-3 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                <Play className="w-6 h-6 fill-[#a3e635] ml-1" />
              </div>
              <p className="text-sm font-semibold text-white relative z-10">
                JavaLord Network Presentation (Overview)
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm relative z-10">
                Turn your regular household purchases into recurring residual income.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#121824] rounded-lg border border-slate-800">
                <div className="text-[#a3e635] font-bold">20% Direct Referral</div>
                <p className="text-slate-400 text-[11px] mt-0.5">Paid instantly when you personally sponsor a new distributor.</p>
              </div>
              <div className="p-3 bg-[#121824] rounded-lg border border-slate-800">
                <div className="text-purple-400 font-bold">Matching Binary</div>
                <p className="text-slate-400 text-[11px] mt-0.5">Earn up to ₦2.5M weekly pairing commissions on the lesser leg.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setVideoModalOpen(false);
                if (onGetStarted) onGetStarted();
              }}
              className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-bold py-2.5 rounded-lg text-sm transition-all"
            >
              Start Earning Today
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
