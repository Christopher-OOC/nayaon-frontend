import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Total members", value: "1,284", change: "+12.8% this month" },
  { label: "Active members", value: "936", change: "+8.2% this month" },
  { label: "Network volume", value: "$48,290", change: "+6.4% this month" },
  { label: "Pending payouts", value: "$3,640", change: "Across 18 payouts" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 py-6">
      <header>
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </header>

      <section aria-label="Network metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-label="Network activity" className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <AppAreaChart />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <AppBarChart />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}