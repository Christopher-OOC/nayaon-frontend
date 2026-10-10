"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, LoaderCircle, Minus, PackageOpen, Plus, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticatedFetch } from "@/lib/auth";

type CartProduct = {
  id?: number | string;
  productId?: number | string;
  name?: string;
  productName?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  availableQuantity?: number;
  productType?: string;
};

type CartItem = {
  cartItemId?: number | string;
  id?: number | string;
  quantity: number | string;
  product?: CartProduct;
  productId?: number | string;
  productName?: string;
  name?: string;
  price?: number;
  image?: string;
  availableQuantity?: number;
};

type Cart = {
  cartItems: CartItem[];
  total?: number;
  totalPrice?: number;
};

const cartEndpoint = process.env.NEXT_PUBLIC_CARTS_ENDPOINT || "/api/v1/carts";
const ordersEndpoint = process.env.NEXT_PUBLIC_ORDERS_ENDPOINT || "/api/v1/orders";
const EMPTY_CART_ITEMS: CartItem[] = [];

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Record<string, unknown>).data;
  }
  return payload;
}

function parseCart(payload: unknown): Cart {
  const cartData = unwrapData(payload);
  if (cartData === null) return { cartItems: [] };
  if (!cartData || typeof cartData !== "object") throw new Error("The cart response has an unexpected format.");
  const record = cartData as Record<string, unknown>;
  const possibleItems = [record.cartItems, record.items, record.cartItemList, record.cartItemResponses];
  const itemList = possibleItems.find(Array.isArray);
  if (!Array.isArray(itemList)) throw new Error("The cart response does not contain cart items.");
  return {
    cartItems: itemList as CartItem[],
    total: typeof record.total === "number" ? record.total : undefined,
    totalPrice: typeof record.totalPrice === "number" ? record.totalPrice : undefined,
  };
}

function normalizeCartItemId(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function itemId(item: CartItem): number | null {
  return normalizeCartItemId(item.cartItemId ?? item.id);
}

function itemName(item: CartItem): string {
  return item.product?.name || item.product?.productName || item.productName || item.name || "Product";
}

function itemPrice(item: CartItem): number {
  return Number(item.product?.price ?? item.price ?? 0);
}

function itemImage(item: CartItem): string | null {
  return item.product?.image || item.product?.imageUrl || item.image || null;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCart = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await authenticatedFetch(cartEndpoint, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load your cart."));
      const result = parseCart(payload);
      setCart(result);
      setQuantities(Object.fromEntries(result.cartItems.flatMap((item) => {
        const id = itemId(item);
        if (id === null) return [];
        const nextQuantity = Number(item.quantity ?? 1);
        return [[id, Number.isFinite(nextQuantity) && nextQuantity > 0 ? String(nextQuantity) : "1"]];
      })));
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load your cart.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadCart(controller.signal);
    return () => controller.abort();
  }, [loadCart]);

  const items = cart?.cartItems ?? EMPTY_CART_ITEMS;
  const total = useMemo(() => {
    const calculatedTotal = items.reduce((sum, item) => sum + itemPrice(item) * Number(quantities[itemId(item) ?? -1] ?? item.quantity ?? 1), 0);
    return calculatedTotal || cart?.totalPrice || cart?.total || 0;
  }, [cart, items, quantities]);

  const saveQuantities = async () => {
    const updatePayload = items.flatMap((item) => {
      const id = itemId(item);
      if (id === null) return [];
      const quantity = Number(quantities[id]);
      if (!Number.isInteger(quantity) || quantity <= 0) return [];
      return [{ cartItemId: id, quantity }];
    });

    if (items.length > 0 && updatePayload.length !== items.length) {
      setError("Every item must have a valid quantity of at least 1.");
      return;
    }

    if (items.length === 0) {
      setNotice("No cart items to update.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await authenticatedFetch(cartEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not update cart quantities."));
      setCart(parseCart(payload));
      setNotice("Cart quantities updated.");
      await loadCart();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update cart quantities.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: number) => {
    setRemovingId(id);
    setError("");
    setNotice("");
    try {
      const query = new URLSearchParams({ cartItemId: String(id) });
      const response = await authenticatedFetch(`${cartEndpoint}?${query}`, { method: "DELETE" });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not remove this item."));
      setCart(parseCart(payload));
      setNotice("Item removed from cart.");
      setRemovingId(null);
      await loadCart();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove this item.");
    } finally {
      setRemovingId((current) => (current === id ? null : current));
    }
  };

  const checkout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) return;
    setCheckoutLoading(true);
    setError("");
    setNotice("");
    const orderRequest = { address: address.trim(), phoneNumber: phoneNumber.trim() };
    try {
      const validationResponse = await authenticatedFetch(`${ordersEndpoint}/validate`, {
        method: "POST",
        body: JSON.stringify(orderRequest),
      });
      const validationPayload: unknown = await validationResponse.json().catch(() => null);
      if (!validationResponse.ok) throw new Error(getMessage(validationPayload, "Order validation failed."));
      const validationResult = unwrapData(validationPayload);
      if (validationResult === false) throw new Error(getMessage(validationPayload, "This order cannot be completed. Check product availability and your details."));

      const orderResponse = await authenticatedFetch(`${ordersEndpoint}/create-order`, {
        method: "POST",
        body: JSON.stringify(orderRequest),
      });
      const orderPayload: unknown = await orderResponse.json().catch(() => null);
      if (!orderResponse.ok) throw new Error(getMessage(orderPayload, "Could not create your order."));
      const orderData = unwrapData(orderPayload);
      const createdOrderId = orderData && typeof orderData === "object"
        ? (orderData as Record<string, unknown>).orderId ?? (orderData as Record<string, unknown>).id
        : undefined;
      setNotice(createdOrderId ? `Order ${String(createdOrderId)} placed successfully.` : "Order placed successfully.");
      setAddress("");
      setPhoneNumber("");
      await loadCart();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Could not complete checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-4 animate-spin" />Loading cart</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your cart</h1>
          <p className="mt-2 text-sm text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        <Button asChild variant="outline"><Link href="/marketplace"><ShoppingBag /> Continue shopping</Link></Button>
      </header>

      {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      {error && <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}

      {error && items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div><h2 className="font-semibold">Cart unavailable</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">Your cart could not be loaded. Check your connection or sign in again, then retry.</p></div>
          <Button variant="outline" onClick={() => void loadCart()}><RefreshCw /> Retry</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          <PackageOpen className="size-9 text-muted-foreground" />
          <div><h2 className="font-semibold">No cart items.</h2><p className="mt-1 text-sm text-muted-foreground">Browse the marketplace to find something you need.</p></div>
          <Button asChild><Link href="/marketplace">Browse products <ArrowRight /></Link></Button>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Cart items</CardTitle>
              <Button variant="outline" onClick={() => void saveQuantities()} disabled={saving}>
                {saving && <LoaderCircle className="animate-spin" />}Save quantities
              </Button>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {items.map((item, index) => {
                const id = itemId(item);
                const image = itemImage(item);
                const productId = item.product?.id ?? item.product?.productId ?? item.productId;
                const quantity = Number(quantities[id ?? -1] ?? item.quantity ?? 1);
                return (
                  <div key={id ?? `${productId ?? itemName(item)}-${index}`} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {image ? <Image src={image} alt={itemName(item)} fill unoptimized sizes="80px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ShoppingBag className="size-6" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-medium">{itemName(item)}</h2>
                      <p className="mt-2 text-sm font-semibold tabular-nums">{formatPrice(itemPrice(item))}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" aria-label={`Decrease quantity for ${itemName(item)}`} disabled={quantity <= 1 || id === null} onClick={() => id !== null && setQuantities((current) => ({ ...current, [id]: String(quantity - 1) }))}><Minus /></Button>
                      <Input type="number" min="1" value={id !== null ? quantities[id] ?? String(item.quantity ?? 1) : String(item.quantity ?? 1)} onChange={(event) => id !== null && setQuantities((current) => ({ ...current, [id]: event.target.value }))} aria-label={`Quantity for ${itemName(item)}`} className="w-20 text-center" />
                      <Button type="button" size="icon" variant="outline" aria-label={`Increase quantity for ${itemName(item)}`} disabled={id === null} onClick={() => id !== null && setQuantities((current) => ({ ...current, [id]: String(quantity + 1) }))}><Plus /></Button>
                    </div>
                    <div className="flex min-w-28 items-center justify-between gap-3 sm:justify-end">
                      <p className="font-semibold tabular-nums">{formatPrice(itemPrice(item) * quantity)}</p>
                      <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${itemName(item)}`} title="Remove item" disabled={id === null || removingId === id} onClick={() => id !== null && void removeItem(id)}>
                        {removingId === id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Checkout</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={checkout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-address">Delivery address</Label>
                  <Input id="checkout-address" autoComplete="street-address" required value={address} onChange={(event) => setAddress(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-phone">Phone number</Label>
                  <Input id="checkout-phone" type="tel" autoComplete="tel" required value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
                </div>
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatPrice(total)}</span></div>
                  <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="tabular-nums">{formatPrice(total)}</span></div>
                </div>
                <Button type="submit" className="w-full" disabled={checkoutLoading || saving || items.length === 0}>
                  {checkoutLoading && <LoaderCircle className="animate-spin" />}
                  Place order
                </Button>
                <p className="text-xs text-muted-foreground">Your order is validated before it is submitted. Payment reference can be added when available.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
