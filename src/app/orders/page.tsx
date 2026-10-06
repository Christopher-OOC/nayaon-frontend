"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, LoaderCircle, RefreshCw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type Order = {
  orderId?: string;
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
  orderItems?: unknown[];
  [key: string]: unknown;
};

type OrderPage = {
  orders: Order[];
  totalPages: number;
};

const endpoint = process.env.NEXT_PUBLIC_ORDERS_ENDPOINT || "/api/v1/orders";

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

function parseOrder(payload: unknown): Order {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected order response.");
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object") throw new Error("The order response did not contain order details.");
  return data as Order;
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
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function orderAmount(order: Order): number | null {
  const value = order.totalAmount ?? order.orderTotal ?? order.total ?? order.amount;
  return typeof value === "number" ? value : null;
}

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusInput, setStatusInput] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        status,
        from,
        to,
        page: String(page),
        size: "10",
      });
      const response = await authenticatedFetch(`${endpoint}/members?${query}`, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load your orders."));
      const result = parseOrderPage(payload);
      setOrders(result.orders);
      setTotalPages(Math.max(result.totalPages, 1));
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load your orders.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, status, from, to]);

  useEffect(() => {
    const controller = new AbortController();
    void loadOrders(controller.signal);
    return () => controller.abort();
  }, [loadOrders]);

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setStatus(statusInput.trim() || "ALL");
    setFrom(fromInput);
    setTo(toInput);
  };

  const openOrder = async (order: Order) => {
    const id = orderId(order);
    if (!id) {
      setError("This order response does not include an order ID.");
      return;
    }
    setDetailLoading(true);
    setSelectedOrder(order);
    setError("");
    try {
      const response = await authenticatedFetch(`${endpoint}/${encodeURIComponent(id)}/members`);
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load order details."));
      setSelectedOrder(parseOrder(payload));
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Could not load order details.");
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-2 border-b pb-6">
        <p className="text-sm font-medium text-muted-foreground">Marketplace / Orders</p>
        <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
        <p className="text-sm text-muted-foreground">Review order status, dates, and item details.</p>
      </header>

      <form onSubmit={applyFilters} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(150px,0.8fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)_auto_auto] xl:items-end">
        <div className="space-y-2">
          <Label htmlFor="orders-status">Status</Label>
          <Input id="orders-status" value={statusInput} onChange={(event) => setStatusInput(event.target.value)} placeholder="ALL" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orders-from">From</Label>
          <Input id="orders-from" type="date" value={fromInput} onChange={(event) => setFromInput(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orders-to">To</Label>
          <Input id="orders-to" type="date" value={toInput} onChange={(event) => setToInput(event.target.value)} />
        </div>
        <Button type="submit" variant="outline">Apply filters</Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => void loadOrders()} disabled={loading} aria-label="Refresh orders" title="Refresh orders"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></Button>
      </form>

      {error && <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="w-32 text-right">Details</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading orders</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-36 text-center text-muted-foreground">{error ? <span>Orders could not be loaded. <Button variant="link" className="h-auto p-0" onClick={() => void loadOrders()}>Retry</Button></span> : "No orders found."}</TableCell></TableRow>
                ) : orders.map((order, index) => {
                  const id = orderId(order);
                  return (
                    <TableRow key={id ?? index}>
                      <TableCell className="font-mono text-xs">{id ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{orderDate(order)}</TableCell>
                      <TableCell><Badge variant="outline">{orderStatus(order)}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(orderAmount(order))}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => void openOrder(order)} disabled={!id}>View order</Button></TableCell>
                    </TableRow>
                  );
                })}
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

      <Dialog open={selectedOrder !== null} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
            <DialogDescription>{selectedOrder ? `Order ${orderId(selectedOrder) ?? ""}` : "Loading order details"}</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-4 animate-spin" />Loading order details</div>
          ) : selectedOrder ? (
            <div className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1"><dt className="text-xs text-muted-foreground">Date</dt><dd className="text-sm font-medium">{orderDate(selectedOrder)}</dd></div>
                <div className="space-y-1"><dt className="text-xs text-muted-foreground">Status</dt><dd><Badge variant="outline">{orderStatus(selectedOrder)}</Badge></dd></div>
                <div className="space-y-1"><dt className="text-xs text-muted-foreground">Total</dt><dd className="text-sm font-medium">{formatPrice(orderAmount(selectedOrder))}</dd></div>
              </dl>
              {Array.isArray(selectedOrder.orderItems) && (
                <div className="space-y-3 border-t pt-4">
                  <h2 className="text-sm font-semibold">Items</h2>
                  {selectedOrder.orderItems.map((item, index) => {
                    const data = item && typeof item === "object" ? item as Record<string, unknown> : {};
                    const product = data.product && typeof data.product === "object" ? data.product as Record<string, unknown> : {};
                    const name = data.productName ?? data.name ?? product.name ?? `Item ${index + 1}`;
                    const quantity = data.quantity;
                    const price = data.price ?? data.unitPrice ?? product.price;
                    return (
                      <div key={String(data.id ?? data.orderItemId ?? index)} className="flex items-center justify-between gap-4 border-b pb-3 text-sm last:border-b-0">
                        <div><p className="font-medium">{renderValue(name)}</p><p className="text-xs text-muted-foreground">Quantity: {renderValue(quantity)}</p></div>
                        <p className="shrink-0 tabular-nums">{typeof price === "number" ? formatPrice(price) : renderValue(price)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <details className="border-t pt-4">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium"><CalendarDays className="size-4" />All returned order details</summary>
                <dl className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  {Object.entries(selectedOrder).filter(([key]) => key !== "orderItems").map(([key, value]) => (
                    <div key={key} className="min-w-0 space-y-1"><dt className="text-xs text-muted-foreground">{key}</dt><dd className="break-words text-sm">{renderValue(value)}</dd></div>
                  ))}
                </dl>
              </details>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
