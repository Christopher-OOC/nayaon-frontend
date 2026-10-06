import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectionDetails: Record<string, { title: string; description: string }> = {
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const details = sectionDetails[section];

  if (!details) {
    return (
      <div className="space-y-4 py-10">
        <h1 className="text-2xl font-semibold">Section not found</h1>
        <Button asChild variant="outline">
          <Link href="/admin"><ArrowLeft /> Back to admin</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-4xl flex-col items-start justify-center py-10">
      <span className="mb-5 inline-flex size-11 items-center justify-center rounded-md bg-muted">
        <Construction className="size-5 text-muted-foreground" />
      </span>
      <p className="text-sm text-muted-foreground">Admin workspace</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{details.title}</h1>
      <p className="mt-3 max-w-lg text-sm text-muted-foreground">{details.description}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/admin"><ArrowLeft /> Back to admin</Link>
      </Button>
    </div>
  );
}