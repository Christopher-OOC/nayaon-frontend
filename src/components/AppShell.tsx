"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AppShellProps {
  children: React.ReactNode;
  defaultOpen: boolean;
}

export default function AppShell({ children, defaultOpen }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isHomePage) {
      setAuthChecked(true);
      return;
    }

    if (getAuthSession()?.access_token) {
      setIsAuthenticated(true);
      setAuthChecked(true);
      return;
    }

    setIsAuthenticated(false);
    setAuthChecked(true);
    router.replace("/");
  }, [isHomePage, pathname, router]);

  if (isHomePage) {
    return (
      <div id="home-root" className="w-full min-h-screen bg-[#070a0f] text-slate-100 flex flex-col selection:bg-[#a3e635] selection:text-black">
        {children}
      </div>
    );
  }

  if (!authChecked || !isAuthenticated) return null;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
