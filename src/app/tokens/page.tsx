"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, ChevronLeft, ChevronRight, Clipboard, Coins, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { authenticatedFetch, getAuthSession } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PurchasedToken {
  id: number;
  token: string;
  owner?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  used: boolean;
  dateCreated: string;
  usedBy: string | null;
  dateUsed: string | null;
  price: number;
}

const transferDetails = {
  bank: process.env.NEXT_PUBLIC_TOKEN_ACCOUNT_BANK,
  accountName: process.env.NEXT_PUBLIC_TOKEN_ACCOUNT_NAME,
  accountNumber: process.env.NEXT_PUBLIC_TOKEN_ACCOUNT_NUMBER,
};
export default function TokensPage() {
  const [showPurchase, setShowPurchase] = useState(false);
  const [tokens, setTokens] = useState<PurchasedToken[]>([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [tokensError, setTokensError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_MY_TOKENS_ENDPOINT || "/api/v1/tokens";

    const session = getAuthSession();
    if (!session?.access_token) {
      setTokensError("Your session has expired. Sign in again to view your tokens.");
      setTokensLoading(false);
      return;
    }

    const controller = new AbortController();
    setTokensLoading(true);

    const loadTokens = async () => {
      try {
        const requestUrl = new URLSearchParams({
          page: String(page),
          size: String(pageSize),
        });
        const separator = endpoint.includes("?") ? "&" : "?";
        const response = await authenticatedFetch(`${endpoint}${separator}${requestUrl}`, {
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new Error("Your session has expired. Sign in again to view your tokens.");
        }

        if (!response.ok) {
          throw new Error("Could not load your purchased tokens.");
        }

        const payload: unknown = await response.json();
        const { tokenList, responseTotalPages } = getTokenPage(payload);

        if (!Array.isArray(tokenList)) {
          throw new Error("The token history response has an unexpected format.");
        }

        setTokens(tokenList as PurchasedToken[]);
        setTotalPages(responseTotalPages);
        setTokensError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setTokensError(error instanceof Error ? error.message : "Could not load your purchased tokens.");
      } finally {
        if (!controller.signal.aborted) setTokensLoading(false);
      }
    };

    void loadTokens();
    return () => controller.abort();
  }, [page, pageSize]);

  const accountDetailsConfigured = Object.values(transferDetails).every(Boolean);

  const copyAccountNumber = async () => {
    if (!transferDetails.accountNumber) return;
    await navigator.clipboard.writeText(transferDetails.accountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleReceiptSelection = (file?: File) => {
    setReceiptError("");

    if (!file) {
      setReceipt(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setReceipt(null);
      setReceiptError("The receipt must be 10 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!["image/png", "image/jpeg", "application/pdf"].includes(file.type)) {
      setReceipt(null);
      setReceiptError("Choose a PNG, JPG, or PDF receipt.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setReceipt(file);
  };

  if (showPurchase) {
    return (
    <div className="mx-auto w-full max-w-5xl space-y-6 py-6">
      <header className="space-y-1">
        <Button type="button" variant="ghost" onClick={() => setShowPurchase(false)} className="mb-2 -ml-3">
          <ArrowLeft />
          Back to my tokens
        </Button>
        <p className="text-sm text-muted-foreground">Member services</p>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase tokens</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Choose how many tokens you need, transfer payment to the company account,
          and attach your receipt for verification.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-5 text-primary" />
              Token quantity
            </CardTitle>
            <CardDescription>Enter the number of tokens you want to purchase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token-quantity">Number of tokens</Label>
              <Input
                id="token-quantity"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-receipt">Transaction receipt</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {receipt ? "Choose a different receipt" : "Choose receipt file"}
                </span>
                <span className="max-w-full break-all text-xs text-muted-foreground">
                  {receipt ? `${receipt.name} (${(receipt.size / 1024 / 1024).toFixed(2)} MB)` : "PNG, JPG, or PDF up to 10 MB"}
                </span>
              </button>
              <Input
                ref={fileInputRef}
                id="token-receipt"
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="sr-only"
                onChange={(event) => handleReceiptSelection(event.target.files?.[0])}
              />
              {receiptError && (
                <p role="alert" className="text-sm text-destructive">
                  {receiptError}
                </p>
              )}
              {receipt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReceiptSelection(undefined)}
                  className="px-0 text-muted-foreground"
                >
                  Remove attachment
                </Button>
              )}
            </div>

            <div className="flex items-start gap-2 rounded-md border p-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>
                {receipt
                  ? "Receipt attached in this form. Online submission is not available yet; please contact the company to complete verification."
                  : "Attach proof of transfer after making payment. Online receipt submission is not available yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company transfer account</CardTitle>
            <CardDescription>
              Transfer payment to this account, then attach your transaction receipt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!accountDetailsConfigured && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>Company bank details have not been configured yet. Confirm the account with the company before transferring funds.</p>
              </div>
            )}

            <dl className="divide-y rounded-md border px-4">
              <div className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <dt className="text-muted-foreground">Bank</dt>
                <dd className="font-medium">{transferDetails.bank || "Not configured"}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <dt className="text-muted-foreground">Account name</dt>
                <dd className="font-medium">{transferDetails.accountName || "Not configured"}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <dt className="text-muted-foreground">Account number</dt>
                <dd className="flex items-center gap-2 font-mono font-medium">
                  {transferDetails.accountNumber || "Not configured"}
                  {transferDetails.accountNumber && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Copy account number"
                      onClick={copyAccountNumber}
                    >
                      {copied ? <Check /> : <Clipboard />}
                      <span className="sr-only">Copy account number</span>
                    </Button>
                  )}
                </dd>
              </div>
            </dl>

            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Purchase summary</p>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tokens requested</span>
                <span className="font-medium text-foreground">
                  {Math.max(0, Number.parseInt(quantity, 10) || 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                The token price and payment amount will be confirmed by the company.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Member services</p>
          <h1 className="text-2xl font-semibold tracking-tight">My tokens</h1>
          <p className="text-sm text-muted-foreground">View tokens purchased for your account.</p>
        </div>
        <Button onClick={() => setShowPurchase(true)}>
          <Plus />
          Purchase tokens
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Purchased tokens</CardTitle>
          <CardDescription>
            {tokensLoading ? "Loading your token history..." : `${tokens.length} token${tokens.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokensLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading tokens...</p>
          ) : tokensError ? (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{tokensError}</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="py-12 text-center">
              <Coins className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium">No tokens purchased yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Your purchased tokens will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S/N</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchased</TableHead>
                  <TableHead>Used by</TableHead>
                  <TableHead>Date used</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{(page - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{item.token}</TableCell>
                    <TableCell>
                      <span className="block">
                        {[item.owner?.firstName, item.owner?.lastName].filter(Boolean).join(" ") || item.owner?.username || "Unknown member"}
                      </span>
                      {item.owner?.username && (
                        <span className="text-xs text-muted-foreground">{item.owner.username}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={item.used ? "text-muted-foreground" : "font-medium text-emerald-600 dark:text-emerald-400"}>
                        {item.used ? "Used" : "Available"}
                      </span>
                    </TableCell>
                    <TableCell>{formatTokenDate(item.dateCreated)}</TableCell>
                    <TableCell>{item.usedBy || "-"}</TableCell>
                    <TableCell>{item.dateUsed ? formatTokenDate(item.dateUsed) : "-"}</TableCell>
                    <TableCell className="text-right">{formatTokenPrice(item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!tokensLoading && !tokensError && (tokens.length > 0 || page > 1) && (
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page}{totalPages ? ` of ${totalPages}` : ""}
              </p>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-2">
                  <Label htmlFor="tokens-page-size" className="whitespace-nowrap text-sm text-muted-foreground">
                    Rows per page
                  </Label>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="tokens-page-size" className="w-[76px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 5, 10, 20].map((size) => (
                        <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous page"
                    disabled={page <= 1 || tokensLoading}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next page"
                    disabled={tokensLoading || (totalPages !== null ? page >= totalPages : tokens.length < pageSize)}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getTokenPage(payload: unknown): {
  tokenList: unknown[] | null;
  responseTotalPages: number | null;
} {
  if (Array.isArray(payload)) return { tokenList: payload, responseTotalPages: null };
  if (typeof payload !== "object" || payload === null) {
    return { tokenList: null, responseTotalPages: null };
  }

  const envelope = payload as Record<string, unknown>;
  const data = envelope.data;
  const dataObject = typeof data === "object" && data !== null
    ? data as Record<string, unknown>
    : null;
  const metadata = (envelope.metadata ?? dataObject?.metadata) as Record<string, unknown> | undefined;
  const tokenList = Array.isArray(data)
    ? data
    : Array.isArray(dataObject?.items)
      ? dataObject.items
      : Array.isArray(envelope.items)
        ? envelope.items
        : null;
  const totalPagesValue = metadata?.totalPages ?? metadata?.total_pages ?? dataObject?.totalPages;
  const parsedTotalPages = Number(totalPagesValue);

  return {
    tokenList,
    responseTotalPages: Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
      ? parsedTotalPages
      : null,
  };
}

function formatTokenDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatTokenPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}