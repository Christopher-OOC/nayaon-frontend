import Link from "next/link";
import { ArrowUpRight, Award, CalendarDays, Package, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const adminSections = [
  {
    title: "Products",
    description: "Create, update, and review the product catalog.",
    href: "/admin/products",
    icon: Package,
    accent: "text-emerald-700 bg-emerald-500/10",
    count: "Catalog",
  },
  {
    title: "Packages",
    description: "Create, update, and review membership packages.",
    href: "/admin/packages",
    icon: Package,
    accent: "text-violet-700 bg-violet-500/10",
    count: "Catalog",
  },
  {
    title: "Members",
    description: "Browse member profiles and account activity.",
    href: "/users",
    icon: Users,
    accent: "text-sky-700 bg-sky-500/10",
    count: "Directory",
  },
  {
    title: "Events",
    description: "Manage company events and scheduled activities.",
    href: "/admin/events",
    icon: CalendarDays,
    accent: "text-amber-700 bg-amber-500/10",
    count: "Planning",
  },
  {
    title: "Ranks",
    description: "Review network ranks and qualification levels.",
    href: "/admin/ranks",
    icon: Award,
    accent: "text-rose-700 bg-rose-500/10",
    count: "Network",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 py-8">
      <header className="border-b pb-6">
        <p className="text-sm font-medium text-muted-foreground">Workspace / Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Administration</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage the core parts of your Nayaon network from one place.
        </p>
      </header>

      <section aria-label="Admin sections" className="grid gap-4 sm:grid-cols-2">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} href={section.href} className="group focus-visible:outline-none">
              <Card className="h-full transition-colors group-hover:border-foreground/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardContent className="flex min-h-44 items-start justify-between gap-6 p-6">
                  <div className="flex h-full flex-col items-start">
                    <span className={`mb-5 inline-flex size-10 items-center justify-center rounded-md ${section.accent}`}>
                      <Icon className="size-5" />
                    </span>
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="flex h-full shrink-0 flex-col items-end justify-between">
                    <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{section.count}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}