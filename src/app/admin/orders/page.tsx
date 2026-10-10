"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, Eye, LoaderCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type Order = {
  orderId?: string | number;
  id?: string | number;
  status?: string;
  orderStatus?: string;
  dateCreated?: string;
  createdAt?: string;
  orderDate?: string;
  total?: number;
  totalAmount?: number;
  orderTotal?: number;
  amount?: number;
  member?: unknown;
  memberId?: string | number;
  items?: unknown[];
  pdfText?: unknown;
  [key: string]: unknown;
};

type OrderPage = {
  orders: Order[];
  totalPages: number;
};

type OrderStatus = "CONFIRMED" | "NOT_CONFIRMED" | "DECLINED" | "REFUNDED";

const statuses: OrderStatus[] = ["CONFIRMED", "NOT_CONFIRMED", "DECLINED", "REFUNDED"];
const endpoint = "/api/v1/admins/orders";

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parseOrderPage(payload: unknown): OrderPage {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected orders response.");
  const response = payload as Record<string, unknown>;
  const metadata = response.metadata && typeof response.metadata === "object"
    ? response.metadata as Record<string, unknown>
    : {};
  if (!Array.isArray(response.data)) throw new Error("The orders response did not contain an order list.");
  return {
    orders: response.data as Order[],
    totalPages: typeof metadata.totalPages === "number" ? metadata.totalPages : 1,
  };
}

function orderId(order: Order): string | null {
  const id = order.orderId ?? order.id;
  return id === undefined || id === null ? null : String(id);
}

function orderStatus(order: Order): string {
  return String(order.status ?? order.orderStatus ?? "Unknown");
}

function orderDate(order: Order): string {
  const value = order.orderDate ?? order.dateCreated ?? order.createdAt;
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function orderAmount(order: Order): number | null {
  const value = order.totalAmount ?? order.orderTotal ?? order.total ?? order.amount;
  return typeof value === "number" ? value : null;
}

function formatPrice(value: number | null): string {
  return value === null
    ? "—"
    : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
}

function memberName(order: Order): string {
  const member = order.member;
  if (member && typeof member === "object") {
    const record = member as Record<string, unknown>;
    const fullName = [record.firstName, record.lastName]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" ");
    if (fullName) return fullName;
    if (typeof record.username === "string") return record.username;
    if (typeof record.email === "string") return record.email;
  }
  return order.memberId === undefined ? "—" : String(order.memberId);
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function receiptSource(value: unknown): { src: string; isPdf: boolean } | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const receipt = value.trim();

  if (/^data:application\/pdf;base64,/i.test(receipt)) {
    return { src: receipt, isPdf: true };
  }
  if (/^data:image\//i.test(receipt)) {
    return { src: receipt, isPdf: false };
  }
  if (/^(https?:\/\/|\/)/i.test(receipt)) {
    return { src: receipt, isPdf: /\.pdf(?:$|[?#])/i.test(receipt) };
  }

  const base64 = receipt.replace(/\s/g, "");
  if (base64.startsWith("JVBERi0")) {
    return { src: `data:application/pdf;base64,${base64}`, isPdf: true };
  }
  const imageType = base64.startsWith("iVBORw0KGgo")
    ? "image/png"
    : base64.startsWith("R0lGOD")
      ? "image/gif"
      : base64.startsWith("UklGR")
        ? "image/webp"
        : "image/jpeg";
  return { src: `data:${imageType};base64,${base64}`, isPdf: false };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, OrderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [treatingId, setTreatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [treatmentError, setTreatmentError] = useState("");

  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ page: String(page), size: "10" });
      const response = await authenticatedFetch(`${endpoint}?${query}`, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load admin orders."));
      const result = parseOrderPage(payload);
      setOrders(result.orders);
      setTotalPages(Math.max(1, result.totalPages));
      setSelectedStatuses((current) => {
        const next = { ...current };
        for (const order of result.orders) {
          const id = orderId(order);
          const currentStatus = orderStatus(order);
          if (id && statuses.includes(currentStatus as OrderStatus) && !next[id]) {
            next[id] = currentStatus as OrderStatus;
          }
        }
        return next;
      });
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load admin orders.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    void loadOrders(controller.signal);
    return () => controller.abort();
  }, [loadOrders]);

  const treatOrder = async (order: Order) => {
    const id = orderId(order);
    if (!id) {
      setError("This order response does not include an order ID and cannot be treated.");
      return;
    }
    const status = selectedStatuses[id];
    if (!status) {
      setError("Choose a status before treating this order.");
      return;
    }
    setTreatingId(id);
    setTreatmentError("");
    setError("");
    setNotice("");
    try {
      const query = new URLSearchParams({ status });
      const response = await authenticatedFetch(
        `/api/v1/admins/treat-order/${encodeURIComponent(id)}?${query}`,
        { method: "PUT" },
      );
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not treat this order."));
      setNotice(`Order ${id} treated as ${status.replace(/_/g, " ").toLowerCase()}.`);
      setSelectedOrder(null);
      await loadOrders();
    } catch (treatError) {
      setTreatmentError(treatError instanceof Error ? treatError.message : "Could not treat this order.");
    } finally {
      setTreatingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin / Treat Orders</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Treat Orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review and update order statuses. Showing {orders.length} orders on this page.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadOrders()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                      <LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading orders
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                      {error ? "Orders could not be loaded." : "No orders found."}
                    </TableCell>
                  </TableRow>
                ) : orders.map((order, index) => {
                  const id = orderId(order);
                  const status = orderStatus(order);
                  return (
                    <TableRow key={id ?? `${status}-${index}`}>
                      <TableCell>
                        <div className="font-medium">{id ? `#${id}` : "Order ID unavailable"}</div>
                      </TableCell>
                      <TableCell>{memberName(order)}</TableCell>
                      <TableCell><Badge variant="outline">{status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{orderDate(order)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(orderAmount(order))}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => { setTreatmentError(""); setSelectedOrder(order); }} aria-label={`View order ${id ?? ""}`}>
                          <Eye className="size-4" />
                          View and treat
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedOrder !== null} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review and treat order</DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Order ${orderId(selectedOrder) ?? ""}` : "Order details"}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <>
              <dl className="divide-y rounded-md border px-4">
                {Object.entries(selectedOrder)
                  .filter(([key]) => key !== "pdfText" && key !== "orderItems" && key !== "items")
                  .map(([key, value]) => (
                    <div key={key} className="grid gap-2 py-3 sm:grid-cols-[minmax(9rem,0.4fr)_1fr]">
                      <dt className="text-sm font-medium capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="min-w-0 whitespace-pre-wrap break-words text-sm">{displayValue(value)}</dd>
                    </div>
                  ))}
              </dl>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Payment receipt</h3>
                {(() => {
                  const receipt = receiptSource(selectedOrder.pdfText);
                  if (!receipt) {
                    return <p className="rounded-md border p-4 text-sm text-muted-foreground">No payment receipt was attached to this order.</p>;
                  }
                  if (receipt.isPdf) {
                    return (
                      <iframe
                        src={receipt.src}
                        title={`Payment receipt for order ${orderId(selectedOrder) ?? ""}`}
                        className="h-[60vh] w-full rounded-md border"
                      />
                    );
                  }
                  return (
                    <div className="flex max-h-[60vh] justify-center overflow-auto rounded-md border bg-muted/20 p-2">
                      <Image
                        src={receipt.src}
                        alt={`Payment receipt for order ${orderId(selectedOrder) ?? ""}`}
                        width={1000}
                        height={800}
                        unoptimized
                        className="h-auto max-h-full max-w-full object-contain"
                      />
                    </div>
                  );
                })()}
              </section>

              <section className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-semibold">Treat this order</h3>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <span className="text-sm font-medium">Set order status</span>
                    <Select
                      value={selectedOrder && orderId(selectedOrder) ? selectedStatuses[orderId(selectedOrder)!] : undefined}
                      onValueChange={(value) => {
                        const id = orderId(selectedOrder);
                        if (id) setSelectedStatuses((current) => ({ ...current, [id]: value as OrderStatus }));
                      }}
                    >
                      <SelectTrigger aria-label="Select order treatment status">
                        <SelectValue placeholder="Choose status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((option) => (
                          <SelectItem key={option} value={option}>{option.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={() => void treatOrder(selectedOrder)}
                    disabled={!orderId(selectedOrder) || !selectedStatuses[orderId(selectedOrder)!] || treatingId !== null}
                  >
                    {treatingId === orderId(selectedOrder) ? <LoaderCircle className="size-4 animate-spin" /> : <ClipboardList className="size-4" />}
                    {treatingId === orderId(selectedOrder) ? "Treating..." : "Treat order"}
                  </Button>
                </div>
                {treatmentError && (
                  <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {treatmentError}
                  </p>
                )}
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
