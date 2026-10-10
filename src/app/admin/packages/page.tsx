"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Package, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type PackageRecord = {
  id?: number | string;
  packageId?: number | string;
  name: string;
  description: string;
  price: number;
  bv: number;
  pv: number;
  packageItems: string[];
  directCommissionRate: number;
  binaryCommissionRate: number;
  dailyCapping: number;
};

type PackageForm = {
  name: string;
  description: string;
  price: string;
  bv: string;
  pv: string;
  packageItems: string;
  directCommissionRate: string;
  binaryCommissionRate: string;
  dailyCapping: string;
};

const endpoint = process.env.NEXT_PUBLIC_PACKAGES_ENDPOINT || "/api/v1/packages";
const emptyForm: PackageForm = {
  name: "",
  description: "",
  price: "0",
  bv: "0",
  pv: "0",
  packageItems: "",
  directCommissionRate: "0",
  binaryCommissionRate: "0",
  dailyCapping: "0",
};

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parsePackages(payload: unknown): PackageRecord[] {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected packages response.");
  const data = (payload as Record<string, unknown>).data;
  if (!Array.isArray(data)) throw new Error("The packages response did not contain a package list.");
  return data as PackageRecord[];
}

function parsePackage(payload: unknown): PackageRecord {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected package response.");
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object") throw new Error("The package response did not contain package details.");
  return data as PackageRecord;
}

function packageId(packageRecord: PackageRecord): string | null {
  const id = packageRecord.id ?? packageRecord.packageId;
  return id === undefined || id === null ? null : String(id);
}

function toForm(packageRecord?: PackageRecord): PackageForm {
  if (!packageRecord) return { ...emptyForm };
  return {
    name: packageRecord.name ?? "",
    description: packageRecord.description ?? "",
    price: String(packageRecord.price ?? 0),
    bv: String(packageRecord.bv ?? 0),
    pv: String(packageRecord.pv ?? 0),
    packageItems: Array.isArray(packageRecord.packageItems) ? packageRecord.packageItems.join("\n") : "",
    directCommissionRate: String(packageRecord.directCommissionRate ?? 0),
    binaryCommissionRate: String(packageRecord.binaryCommissionRate ?? 0),
    dailyCapping: String(packageRecord.dailyCapping ?? 0),
  };
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>({ ...emptyForm });
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPackages = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedFetch(endpoint, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load packages."));
      setPackages(parsePackages(payload));
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load packages.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadPackages(controller.signal);
    return () => controller.abort();
  }, [loadPackages]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImage(null);
    setNotice("");
    setEditorOpen(true);
  };

  const openEdit = async (packageRecord: PackageRecord) => {
    const id = packageId(packageRecord);
    if (!id) {
      setError("This package response has no id, so it cannot be edited.");
      return;
    }
    setError("");
    try {
      const response = await authenticatedFetch(`${endpoint}/${encodeURIComponent(id)}`);
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load this package."));
      const fullPackage = parsePackage(payload);
      setEditingId(id);
      setForm(toForm(fullPackage));
      setImage(null);
      setNotice("");
      setEditorOpen(true);
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Could not load this package.");
    }
  };

  const setField = (field: keyof PackageForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const savePackage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId && !image) {
      setNotice("Choose a package image before creating the package.");
      return;
    }
    setSaving(true);
    setNotice("");

    const requestData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      bv: Number(form.bv),
      pv: Number(form.pv),
      packageItems: form.packageItems.split("\n").map((item) => item.trim()).filter(Boolean),
      directCommissionRate: Number(form.directCommissionRate),
      binaryCommissionRate: Number(form.binaryCommissionRate),
      dailyCapping: Number(form.dailyCapping),
    };
    const body = new FormData();
    body.append("data", JSON.stringify(requestData));
    if (image) body.append("file", image);

    try {
      const response = await authenticatedFetch(
        editingId ? `${endpoint}/${encodeURIComponent(editingId)}` : endpoint,
        { method: editingId ? "PUT" : "POST", body },
      );
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not save package."));
      setEditorOpen(false);
      setNotice(editingId ? "Package updated." : "Package created.");
      await loadPackages();
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : "Could not save package.");
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (packageRecord: PackageRecord) => {
    const id = packageId(packageRecord);
    if (!id) {
      setError("This package response has no id, so it cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete "${packageRecord.name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    setError("");
    setNotice("");
    try {
      const response = await authenticatedFetch(`${endpoint}/${encodeURIComponent(id)}`, { method: "DELETE" });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not delete package."));
      setNotice("Package deleted.");
      await loadPackages();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete package.");
    } finally {
      setDeletingId(null);
    }
  };

  const fields: Array<{ key: keyof PackageForm; label: string; numeric?: boolean }> = [
    { key: "price", label: "Price", numeric: true },
    { key: "bv", label: "BV", numeric: true },
    { key: "pv", label: "PV", numeric: true },
    { key: "directCommissionRate", label: "Direct commission rate", numeric: true },
    { key: "binaryCommissionRate", label: "Binary commission rate", numeric: true },
    { key: "dailyCapping", label: "Daily capping", numeric: true },
  ];
  const visiblePackages = packages.filter((packageRecord) =>
    `${packageRecord.name} ${packageRecord.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin / Packages</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Packages</h1>
          <p className="mt-2 text-sm text-muted-foreground">{packages.length} packages in the catalog</p>
        </div>
        <Button onClick={openCreate}><Plus /> Add package</Button>
      </header>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput);
        }}
      >
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search packages" className="pl-9" aria-label="Search packages" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => void loadPackages()} aria-label="Refresh packages" title="Refresh packages">
          <RefreshCw className="size-4" />
        </Button>
      </form>

      {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">BV / PV</TableHead>
                  <TableHead className="text-right">Direct / Binary rate</TableHead>
                  <TableHead className="text-right">Daily cap</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading packages</TableCell></TableRow>
                ) : visiblePackages.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No packages found.</TableCell></TableRow>
                ) : visiblePackages.map((packageRecord, index) => (
                  <TableRow key={packageId(packageRecord) ?? `${packageRecord.name}-${index}`}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Package className="mt-0.5 size-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{packageRecord.name}</div>
                          <div className="max-w-sm truncate text-xs text-muted-foreground">{packageRecord.description}</div>
                          {packageRecord.packageItems?.length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">{packageRecord.packageItems.join(", ")}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{Number(packageRecord.price).toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{packageRecord.bv} / {packageRecord.pv}</TableCell>
                    <TableCell className="text-right tabular-nums">{packageRecord.directCommissionRate} / {packageRecord.binaryCommissionRate}</TableCell>
                    <TableCell className="text-right tabular-nums">{packageRecord.dailyCapping}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => void openEdit(packageRecord)} aria-label={`Edit ${packageRecord.name}`} title="Edit package">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void deletePackage(packageRecord)} disabled={deletingId === packageId(packageRecord)} aria-label={`Delete ${packageRecord.name}`} title="Delete package">
                        {deletingId === packageId(packageRecord) ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Update package" : "Add package"}</DialogTitle>
            <DialogDescription>Package details are sent as multipart form data to the packages API.</DialogDescription>
          </DialogHeader>
          <form onSubmit={savePackage} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="package-name">Package name</Label>
                <Input id="package-name" required value={form.name} onChange={(event) => setField("name", event.target.value)} />
              </div>
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`package-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`package-${field.key}`}
                    type={field.numeric ? "number" : "text"}
                    min={field.numeric ? "0" : undefined}
                    step={field.numeric ? "any" : undefined}
                    required
                    value={form[field.key]}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="package-description">Description</Label>
                <textarea
                  id="package-description"
                  required
                  rows={3}
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="package-items">Package items (one per line)</Label>
                <textarea
                  id="package-items"
                  rows={4}
                  value={form.packageItems}
                  onChange={(event) => setField("packageItems", event.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="package-image">Package image{editingId ? " (optional)" : ""}</Label>
                <Input id="package-image" type="file" accept="image/*" required={!editingId} onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
              </div>
            </div>
            {notice && <p role="alert" className="text-sm text-destructive">{notice}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoaderCircle className="animate-spin" />}
                {editingId ? "Save changes" : "Create package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
