"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, LoaderCircle, PackageSearch, RefreshCw, Search, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authenticatedFetch } from "@/lib/auth";
import Link from "next/link";

type Product = {
  id?: number | string;
  productId?: number | string;
  name: string;
  description?: string;
  price: number;
  bv?: number;
  pv?: number;
  availableQuantity?: number;
  discount?: number;
  productType?: string;
  image?: string;
  imageUrl?: string;
  isDiscounted?: boolean;
};

type ProductPage = {
  products: Product[];
  totalPages: number;
  totalElements: number;
};

const endpoint = process.env.NEXT_PUBLIC_PRODUCTS_ENDPOINT || "/api/v1/products";
const cartEndpoint = process.env.NEXT_PUBLIC_CARTS_ENDPOINT || "/api/v1/carts";

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parseProductPage(payload: unknown): ProductPage {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected products response.");
  const response = payload as Record<string, unknown>;
  const metadata = response.metadata && typeof response.metadata === "object"
    ? response.metadata as Record<string, unknown>
    : {};
  if (!Array.isArray(response.data)) throw new Error("The products response did not contain a product list.");
  return {
    products: response.data as Product[],
    totalPages: typeof metadata.totalPages === "number" ? metadata.totalPages : 1,
    totalElements: typeof metadata.totalNumberOfElements === "number" ? metadata.totalNumberOfElements : response.data.length,
  };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function getProductImage(product: Product): string | null {
  return product.image || product.imageUrl || null;
}

function getProductId(product: Product, index: number): string {
  return String(product.id ?? product.productId ?? `${product.name}-${index}`);
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ page: String(page), size: "12", search });
      const response = await authenticatedFetch(`${endpoint}?${query}`, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load marketplace products."));
      const result = parseProductPage(payload);
      setProducts(result.products);
      setTotalPages(Math.max(result.totalPages, 1));
      setTotalElements(result.totalElements);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load marketplace products.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const controller = new AbortController();
    void loadProducts(controller.signal);
    return () => controller.abort();
  }, [loadProducts]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const addToCart = async (product: Product) => {
    const productId = product.id ?? product.productId;
    const key = String(productId ?? "");
    const quantity = Number(quantities[key] ?? "1");
    if (!key) {
      setCartError("This product has no ID and cannot be added to the cart.");
      setCartMessage("");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setCartError("Enter a quantity of at least 1.");
      setCartMessage("");
      return;
    }
    setAddingProductId(key);
    setCartError("");
    setCartMessage("");
    try {
      const response = await authenticatedFetch(`${cartEndpoint}/add-to-cart`, {
        method: "POST",
        body: JSON.stringify({ productId: key, quantity }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not add this product to your cart."));
      setCartMessage(`${product.name} added to cart.`);
    } catch (addError) {
      setCartError(addError instanceof Error ? addError.message : "Could not add this product to your cart.");
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Shop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Marketplace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Browse the current product catalog.</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-sm tabular-nums text-muted-foreground">{totalElements.toLocaleString()} products</p>
          <Button asChild variant="outline"><Link href="/cart"><ShoppingCart /> View cart</Link></Button>
        </div>
      </header>

      {cartMessage && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400"><Check className="mr-1 inline size-4" />{cartMessage}</p>}
      {cartError && <p role="alert" className="text-sm text-destructive">{cartError}</p>}

      <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products" aria-label="Search products" className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => void loadProducts()} disabled={loading} aria-label="Refresh marketplace" title="Refresh marketplace">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </form>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          <LoaderCircle className="mr-2 size-4 animate-spin" />Loading products
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
          <PackageSearch className="size-7" />
          <p>{error ? "Products could not be loaded." : "No products found."}</p>
        </div>
      ) : (
        <section aria-label="Marketplace products" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => {
            const image = getProductImage(product);
            const available = Number(product.availableQuantity ?? 0);
            return (
              <Card key={getProductId(product, index)} className="overflow-hidden py-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {image ? (
                    <Image src={image} alt={product.name} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><PackageSearch className="size-9" /></div>
                  )}
                  <Badge variant={available > 0 ? "secondary" : "outline"} className="absolute left-3 top-3 bg-background/90">
                    {available > 0 ? `${available} in stock` : "Out of stock"}
                  </Badge>
                </div>
                <CardContent className="flex min-h-52 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-semibold">{product.name}</h2>
                      {product.productType && <p className="mt-1 text-xs text-muted-foreground">{product.productType}</p>}
                    </div>
                    {product.isDiscounted && <Badge variant="outline">Discount</Badge>}
                  </div>
                  {product.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <p className="text-lg font-semibold tabular-nums">{formatPrice(product.price)}</p>
                    {(product.bv !== undefined || product.pv !== undefined) && (
                      <p className="text-right text-xs text-muted-foreground">BV {Number(product.bv ?? 0).toLocaleString()}<br />PV {Number(product.pv ?? 0).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t pt-4">
                    <Input
                      type="number"
                      min="1"
                      max={product.availableQuantity || undefined}
                      value={quantities[String(product.id ?? product.productId ?? "")] ?? "1"}
                      onChange={(event) => setQuantities((current) => ({ ...current, [String(product.id ?? product.productId ?? "")]: event.target.value }))}
                      aria-label={`Quantity for ${product.name}`}
                      className="w-20"
                      disabled={available < 1}
                    />
                    <Button
                      className="flex-1"
                      onClick={() => void addToCart(product)}
                      disabled={available < 1 || addingProductId === String(product.id ?? product.productId ?? "")}
                    >
                      {addingProductId === String(product.id ?? product.productId ?? "") ? <LoaderCircle className="animate-spin" /> : <ShoppingCart />}
                      Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}