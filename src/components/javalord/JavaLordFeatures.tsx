"use client";

import React from "react";
import { ShieldCheck, Zap, Users, Headphones } from "lucide-react";

export default function JavaLordFeatures() {
  const features = [
    {
      id: "secure",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-950/60 border-emerald-500/30",
      title: "Secure & Reliable",
      description: "Bank level security to protect your data and earnings.",
    },
    {
      id: "payouts",
      icon: Zap,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-950/60 border-amber-500/30",
      title: "Fast Payouts",
      description: "Instant and automated commission payments.",
    },
    {
      id: "community",
      icon: Users,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-950/60 border-purple-500/30",
      title: "Powerful Community",
      description: "Join a strong community of achievers.",
    },
    {
      id: "support",
      icon: Headphones,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-950/60 border-teal-500/30",
      title: "24/7 Support",
      description: "We're here to support you every step of the way.",
    },
  ];

  return (
    <section id="features" className="py-8 sm:py-12 border-t border-slate-800/60 bg-[#070a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={`feature-${feat.id}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#0b1019]/60 border border-slate-800/80 hover:border-slate-700/90 transition-all hover:bg-[#0e1422]"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${feat.iconBg} ${feat.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
