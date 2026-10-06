"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle, Mail, MapPin, Phone, RefreshCw, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticatedFetch } from "@/lib/auth";

type MemberResponse = {
  memberId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  image?: string;
  phoneNumber?: string;
  address?: string;
  businessName?: string;
  sponsorId?: string;
  placerId?: string;
  leftLegId?: string;
  rightLegId?: string;
  sponsorUsername?: string;
  placerUsername?: string;
  registeredOn?: string | null;
  currentPackage?: { name?: string; packageName?: string } | null;
  accountDetails?: { accountName?: string; accountNumber?: string; bankName?: string } | null;
  enabled: boolean;
  canReceivePayment: boolean;
  totalLeftBv?: number;
  totalRightBv?: number;
  binaryLeftPv?: number;
  binaryRightPv?: number;
  monthlyLeftPv?: number;
  monthlyRightPv?: number;
  countNewlyRegisteredOnMonthlyWeakerLeg?: number;
  availableBalance?: number;
  transactionWallet?: number;
  awaitingWallet?: number;
  dailyBinaryEarning?: number;
  cashback?: number;
  lastActive?: string | null;
  lastEarned?: string | null;
  rank?: { name?: string; rankValue?: number } | null;
  roles?: Array<{ name?: string; roleName?: string }>;
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

function parseMember(payload: unknown): MemberResponse {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected member response.");
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object") throw new Error("The member response did not contain member details.");
  return data as MemberResponse;
}

function displayName(member: MemberResponse): string {
  return [member.firstName, member.lastName].filter(Boolean).join(" ") || member.username || member.memberId;
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatNumber(value?: number): string {
  return Number(value ?? 0).toLocaleString();
}

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export default function SingleUserPage() {
  const params = useParams<{ username: string }>();
  const memberId = decodeURIComponent(params.username);
  const [member, setMember] = useState<MemberResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadMember = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await authenticatedFetch(`${endpoint}/${encodeURIComponent(memberId)}`, { signal: controller.signal });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) throw new Error(getMessage(payload, "Could not load this member."));
        setMember(parseMember(payload));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load this member.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadMember();
    return () => controller.abort();
  }, [memberId]);

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-4 animate-spin" />Loading member</div>;
  }

  if (error || !member) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 py-8">
        <Button asChild variant="ghost" className="-ml-3"><Link href="/users"><ArrowLeft /> Back to members</Link></Button>
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error || "Member not found."}</span>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw /> Retry</Button>
      </div>
    );
  }

  const roles = member.roles?.map((role) => role.name ?? role.roleName).filter((role): role is string => Boolean(role)) ?? [];
  const packageName = member.currentPackage?.name ?? member.currentPackage?.packageName;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-3"><Link href="/users"><ArrowLeft /> Back to members</Link></Button>
        <p className="text-sm font-medium text-muted-foreground">Members / {member.memberId}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-16 shrink-0">
              <AvatarImage src={member.image} alt={displayName(member)} />
              <AvatarFallback><UserRound className="size-6" /></AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-semibold tracking-tight">{displayName(member)}</h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">@{member.username || member.memberId}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={member.enabled ? "secondary" : "outline"}>{member.enabled ? "Enabled" : "Disabled"}</Badge>
                <Badge variant={member.canReceivePayment ? "secondary" : "outline"}>{member.canReceivePayment ? "Can receive payments" : "Payments disabled"}</Badge>
                {member.rank?.name && <Badge variant="outline">{member.rank.name}</Badge>}
                {roles.map((role) => <Badge key={role} variant="outline">{role}</Badge>)}
              </div>
            </div>
          </div>
          <div className="grid gap-3 text-sm sm:min-w-52">
            {member.email && <p className="flex min-w-0 items-center gap-2 break-all"><Mail className="size-4 shrink-0 text-muted-foreground" />{member.email}</p>}
            {member.phoneNumber && <p className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-muted-foreground" />{member.phoneNumber}</p>}
            {member.address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{member.address}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Member details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem label="Member ID" value={member.memberId} />
              <InfoItem label="Business name" value={member.businessName} />
              <InfoItem label="Registered" value={formatDate(member.registeredOn)} />
              <InfoItem label="Last active" value={formatDate(member.lastActive)} />
              <InfoItem label="Last earned" value={formatDate(member.lastEarned)} />
              <InfoItem label="Current package" value={packageName} />
              <InfoItem label="Rank" value={member.rank?.name} />
              <InfoItem label="Rank value" value={member.rank?.rankValue} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sponsor network</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem label="Sponsor" value={member.sponsorUsername || member.sponsorId} />
              <InfoItem label="Sponsor ID" value={member.sponsorId} />
              <InfoItem label="Placer" value={member.placerUsername || member.placerId} />
              <InfoItem label="Placer ID" value={member.placerId} />
              <InfoItem label="Left leg ID" value={member.leftLegId} />
              <InfoItem label="Right leg ID" value={member.rightLegId} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Network volume</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem label="Total left BV" value={formatNumber(member.totalLeftBv)} />
              <InfoItem label="Total right BV" value={formatNumber(member.totalRightBv)} />
              <InfoItem label="Binary left PV" value={formatNumber(member.binaryLeftPv)} />
              <InfoItem label="Binary right PV" value={formatNumber(member.binaryRightPv)} />
              <InfoItem label="Monthly left PV" value={formatNumber(member.monthlyLeftPv)} />
              <InfoItem label="Monthly right PV" value={formatNumber(member.monthlyRightPv)} />
              <InfoItem label="New members on weaker leg" value={formatNumber(member.countNewlyRegisteredOnMonthlyWeakerLeg)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Wallet balances</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem label="Available balance" value={formatNumber(member.availableBalance)} />
              <InfoItem label="Transaction wallet" value={formatNumber(member.transactionWallet)} />
              <InfoItem label="Awaiting wallet" value={formatNumber(member.awaitingWallet)} />
              <InfoItem label="Daily binary earning" value={formatNumber(member.dailyBinaryEarning)} />
              <InfoItem label="Cashback" value={formatNumber(member.cashback)} />
            </dl>
          </CardContent>
        </Card>

        {member.accountDetails && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Account details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                <InfoItem label="Account name" value={member.accountDetails.accountName} />
                <InfoItem label="Bank" value={member.accountDetails.bankName} />
                <InfoItem label="Account number" value={member.accountDetails.accountNumber} />
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}