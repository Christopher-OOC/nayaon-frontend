"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type Member = {
  memberId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  image?: string;
  enabled: boolean;
  totalLeftBv?: number;
  totalRightBv?: number;
  rank?: { name?: string } | null;
  roles?: Array<{ name?: string; roleName?: string }>;
};

type MemberPage = {
  members: Member[];
  totalPages: number;
  totalElements: number;
};

const endpoint = process.env.NEXT_PUBLIC_MEMBERS_ENDPOINT || "/api/v1/members";

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parseMemberPage(payload: unknown): MemberPage {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected members response.");
  const response = payload as Record<string, unknown>;
  const metadata = response.metadata && typeof response.metadata === "object"
    ? response.metadata as Record<string, unknown>
    : {};
  if (!Array.isArray(response.data)) throw new Error("The members response did not contain a member list.");
  return {
    members: response.data as Member[],
    totalPages: typeof metadata.totalPages === "number" ? metadata.totalPages : 1,
    totalElements: typeof metadata.totalNumberOfElements === "number" ? metadata.totalNumberOfElements : response.data.length,
  };
}

function fullName(member: Member): string {
  return [member.firstName, member.lastName].filter(Boolean).join(" ") || member.username || member.memberId;
}

function memberRole(member: Member): string {
  return member.roles?.map((role) => role.name ?? role.roleName).filter(Boolean).join(", ") || "Member";
}

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleInput, setRoleInput] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [sortByBv, setSortByBv] = useState("ALL");
  const [enabled, setEnabled] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: String(page),
        size: "10",
        search,
        role,
        sortByBv,
        enabled,
      });
      const response = await authenticatedFetch(`${endpoint}?${query}`, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load members."));
      const result = parseMemberPage(payload);
      setMembers(result.members);
      setTotalPages(Math.max(result.totalPages, 1));
      setTotalElements(result.totalElements);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load members.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, search, role, sortByBv, enabled]);

  useEffect(() => {
    const controller = new AbortController();
    void loadMembers(controller.signal);
    return () => controller.abort();
  }, [loadMembers]);

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setRole(roleInput.trim() || "ALL");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-8">
      <header className="flex flex-col gap-2 border-b pb-6">
        <p className="text-sm font-medium text-muted-foreground">Admin / Members</p>
        <h1 className="text-3xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">{totalElements.toLocaleString()} members</p>
      </header>

      <form onSubmit={applyFilters} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(140px,0.6fr)_minmax(150px,0.6fr)_minmax(150px,0.6fr)_auto_auto] xl:items-end">
        <div className="space-y-2">
          <Label htmlFor="member-search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="member-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Name, username, email" className="pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-role">Role</Label>
          <Input id="member-role" value={roleInput} onChange={(event) => setRoleInput(event.target.value)} placeholder="ALL" />
        </div>
        <div className="space-y-2">
          <Label>Sort by BV</Label>
          <Select value={sortByBv} onValueChange={(value) => { setSortByBv(value); setPage(1); }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Default order</SelectItem>
              <SelectItem value="ASC">Lowest BV first</SelectItem>
              <SelectItem value="DESC">Highest BV first</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Account status</Label>
          <Select value={enabled} onValueChange={(value) => { setEnabled(value); setPage(1); }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All members</SelectItem>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="outline">Apply filters</Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => void loadMembers()} aria-label="Refresh members" title="Refresh members">
          <RefreshCw className="size-4" />
        </Button>
      </form>

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
                  <TableHead>Member</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Left / right BV</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading members</TableCell></TableRow>
                ) : members.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No members found.</TableCell></TableRow>
                ) : members.map((member, index) => (
                  <TableRow key={member.memberId || index}>
                    <TableCell>
                      <Link href={`/users/${encodeURIComponent(member.memberId)}`} className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {fullName(member)}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">{member.email || member.username || ""}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs">{member.memberId}</TableCell>
                    <TableCell>{memberRole(member)}</TableCell>
                    <TableCell>{member.rank?.name || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(member.totalLeftBv ?? 0).toLocaleString()} / {Number(member.totalRightBv ?? 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={member.enabled ? "secondary" : "outline"}>{member.enabled ? "Enabled" : "Disabled"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="size-4" /></Button>
              <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)}><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}