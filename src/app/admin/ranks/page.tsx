"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Pencil, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type Rank = {
  id?: number;
  rankId?: number;
  name: string;
  prize: number;
  qualifyingBv: number;
  rankValue: number;
};

type RankForm = {
  name: string;
  prize: string;
  qualifyingBv: string;
  rankValue: string;
};

const endpoint = process.env.NEXT_PUBLIC_RANKS_ENDPOINT || "/api/v1/ranks";
const emptyForm: RankForm = {
  name: "",
  prize: "0",
  qualifyingBv: "0",
  rankValue: "0",
};

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parseRankList(payload: unknown): Rank[] {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected ranks response.");
  }
  const data = (payload as Record<string, unknown>).data;
  if (!Array.isArray(data)) {
    throw new Error("The ranks response did not contain a rank list.");
  }
  return data as Rank[];
}

function parseRank(payload: unknown): Rank {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected rank response.");
  }
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object") {
    throw new Error("The rank response did not contain rank details.");
  }
  return data as Rank;
}

function rankId(rank: Rank): number | null {
  const id = rank.id ?? rank.rankId;
  return typeof id === "number" ? id : null;
}

function toForm(rank: Rank): RankForm {
  return {
    name: rank.name ?? "",
    prize: String(rank.prize ?? 0),
    qualifyingBv: String(rank.qualifyingBv ?? 0),
    rankValue: String(rank.rankValue ?? 0),
  };
}

export default function AdminRanksPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RankForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const loadRanks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedFetch(endpoint, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load ranks."));
      setRanks(parseRankList(payload));
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load ranks.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadRanks(controller.signal);
    return () => controller.abort();
  }, [loadRanks]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setNotice("");
    setEditorOpen(true);
  };

  const openEdit = async (rank: Rank) => {
    const id = rankId(rank);
    if (id === null) {
      setError("This rank response has no id, so it cannot be edited.");
      return;
    }
    setError("");
    try {
      const response = await authenticatedFetch(`${endpoint}/${id}`);
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load this rank."));
      setEditingId(id);
      setForm(toForm(parseRank(payload)));
      setNotice("");
      setEditorOpen(true);
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Could not load this rank.");
    }
  };

  const setField = (field: keyof RankForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveRank = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const requestData = {
      name: form.name.trim(),
      prize: Number(form.prize),
      qualifyingBv: Number(form.qualifyingBv),
      rankValue: Number(form.rankValue),
    };

    try {
      const response = await authenticatedFetch(
        editingId === null ? endpoint : `${endpoint}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          body: JSON.stringify(requestData),
        },
      );
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not save rank."));
      setEditorOpen(false);
      setNotice(editingId === null ? "Rank created." : "Rank updated.");
      await loadRanks();
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : "Could not save rank.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin / Ranks</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ranks</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage rank names, prizes, and qualification thresholds.</p>
        </div>
        <Button onClick={openCreate}><Plus /> Add rank</Button>
      </header>

      {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm text-muted-foreground">{ranks.length} {ranks.length === 1 ? "rank" : "ranks"}</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => void loadRanks()} aria-label="Refresh ranks" title="Refresh ranks">
              <RefreshCw className="size-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Rank value</TableHead>
                  <TableHead className="text-right">Qualifying BV</TableHead>
                  <TableHead className="text-right">Prize</TableHead>
                  <TableHead className="w-20 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading ranks</TableCell></TableRow>
                ) : ranks.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No ranks found.</TableCell></TableRow>
                ) : ranks.map((rank, index) => (
                  <TableRow key={rankId(rank) ?? `${rank.name}-${index}`}>
                    <TableCell className="font-medium">{rank.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{rank.rankValue}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(rank.qualifyingBv).toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(rank.prize).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => void openEdit(rank)} aria-label={`Edit ${rank.name}`} title="Edit rank">
                        <Pencil className="size-4" />
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId === null ? "Add rank" : "Update rank"}</DialogTitle>
            <DialogDescription>Set the rank name, prize, qualifying BV, and rank order.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveRank} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rank-name">Rank name</Label>
                <Input id="rank-name" required value={form.name} onChange={(event) => setField("name", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank-prize">Prize</Label>
                <Input id="rank-prize" type="number" min="0" step="any" required value={form.prize} onChange={(event) => setField("prize", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank-qualifying-bv">Qualifying BV</Label>
                <Input id="rank-qualifying-bv" type="number" min="0" step="any" required value={form.qualifyingBv} onChange={(event) => setField("qualifyingBv", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank-value">Rank value</Label>
                <Input id="rank-value" type="number" min="0" step="1" required value={form.rankValue} onChange={(event) => setField("rankValue", event.target.value)} />
              </div>
            </div>
            {notice && <p role="alert" className="text-sm text-destructive">{notice}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoaderCircle className="animate-spin" />}
                {editingId === null ? "Create rank" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}