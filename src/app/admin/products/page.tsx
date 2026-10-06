"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, LoaderCircle, Pencil, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authenticatedFetch } from "@/lib/auth";

type Product = {
  id?: number | string;
  name: string;
  description: string;
  bv: number;
  pv: number;
  price: number;
  availableQuantity: number;
  categoryId: number;
  discount: number;
  packageId: number;
  productType: string;
  image ?: string;
  isDiscounted?: boolean;
};

type ProductForm = Omit<Product, "id" | "productId" | "bv" | "pv" | "price" | "availableQuantity" | "categoryId" | "discount" | "packageId"> & {
  bv: string;
  pv: string;
  price: string;
  availableQuantity: string;
  categoryId: string;
  discount: string;
  packageId: string;
};

type ApiPage = {
  products: Product[];
  totalPages: number;
  totalElements: number;
};

const endpoint = process.env.NEXT_PUBLIC_PRODUCTS_ENDPOINT || "/api/v1/products";
const emptyForm: ProductForm = {
  name: "",
  description: "",
  bv: "0",
  pv: "0",
  price: "0",
  availableQuantity: "0",
  categoryId: "",
  discount: "0",
  packageId: "",
  productType: "",
};

function getMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function parsePage(payload: unknown): ApiPage {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected products response.");
  const response = payload as Record<string, unknown>;
  const data = response.data;
  const metadata = response.metadata && typeof response.metadata === "object"
    ? response.metadata as Record<string, unknown>
    : {};
  if (!Array.isArray(data)) throw new Error("The products response did not contain a product list.");
  return {
    products: data as Product[],
    totalPages: typeof metadata.totalPages === "number" ? metadata.totalPages : 1,
    totalElements: typeof metadata.totalNumberOfElements === "number" ? metadata.totalNumberOfElements : data.length,
  };
}

function parseProduct(payload: unknown): Product {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected product response.");
  const response = payload as Record<string, unknown>;
  const data = response.data;
  if (!data || typeof data !== "object") throw new Error("The product response did not contain product details.");
  return data as Product;
}

function productId(product: Product): string | null {
  const id = product.id;
  return id === undefined || id === null ? null : String(id);
}

function toForm(product?: Product): ProductForm {
  if (!product) return { ...emptyForm };
  return {
    name: product.name ?? "",
    description: product.description ?? "",
    bv: String(product.bv ?? 0),
    pv: String(product.pv ?? 0),
    price: String(product.price ?? 0),
    availableQuantity: String(product.availableQuantity ?? 0),
    categoryId: String(product.categoryId ?? ""),
    discount: String(product.discount ?? 0),
    packageId: String(product.packageId ?? ""),
    productType: product.productType ?? "",
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm });
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ page: String(page), size: "10", search });
      const response = await authenticatedFetch(`${endpoint}?${query}`, { signal });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load products."));
      const result = parsePage(payload);
      setProducts(result.products);
      setTotalPages(Math.max(1, result.totalPages));
      setTotalElements(result.totalElements);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load products.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const controller = new AbortController();
    void loadProducts(controller.signal);
    return () => controller.abort();
  }, [loadProducts]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImage(null);
    setNotice("");
    setEditorOpen(true);
  };

  const openEdit = async (product: Product) => {
    const id = productId(product);
    if (!id) {
      setError("This product response has no id, so it cannot be edited.");
      return;
    }
    setError("");
    try {
      const response = await authenticatedFetch(`${endpoint}/${encodeURIComponent(id)}`);
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getMessage(payload, "Could not load this product."));
      const fullProduct = parseProduct(payload);
      setEditingId(id);
      setForm(toForm(fullProduct));
      setImage(null);
      setEditorOpen(true);
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Could not load this product.");
    }
  };

  const setField = (field: keyof ProductForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Saving product:", form);
    console.log("Image file:", image);

    if (!editingId && !image) {
      setNotice("Choose a product image before creating the product.");
      return;
    }
    setSaving(true);
    setNotice("");

    const requestData = {
      name: form.name.trim(),
      description: form.description.trim(),
      bv: Number(form.bv),
      pv: Number(form.pv),
      price: Number(form.price),
      availableQuantity: Number(form.availableQuantity),
      categoryId: Number(form.categoryId),
      discount: Number(form.discount),
      packageId: Number(form.packageId),
      productType: form.productType.trim(),
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
      if (!response.ok) throw new Error(getMessage(payload, "Could not save product."));
      setEditorOpen(false);
      setNotice(editingId ? "Product updated." : "Product created.");
      await loadProducts();
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const fields: Array<{ key: keyof ProductForm; label: string; type?: string; required?: boolean }> = [
    { key: "name", label: "Product name", required: true },
    { key: "price", label: "Price", type: "number", required: true },
    { key: "bv", label: "BV", type: "number", required: true },
    { key: "pv", label: "PV", type: "number", required: true },
    { key: "availableQuantity", label: "Available quantity", type: "number", required: true },
    { key: "discount", label: "Discount", type: "number", required: true },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin / Products</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">{totalElements} products in the catalog</p>
        </div>
        <Button onClick={openCreate}><Plus /> Add product</Button>
      </header>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products" className="pl-9" aria-label="Search products" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => void loadProducts()} aria-label="Refresh products" title="Refresh products">
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
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">BV / PV</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Loading products</TableCell></TableRow>
                ) : products.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No products found.</TableCell></TableRow>
                ) : products.map((product, index) => (
                  <TableRow key={productId(product) ?? `${product.name}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="max-w-sm truncate text-xs text-muted-foreground">{product.description}</div>
                    </TableCell>
                    <TableCell>{product.productType || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(product.price).toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{product.bv} / {product.pv}</TableCell>
                    <TableCell className="text-right tabular-nums">{product.availableQuantity}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => void openEdit(product)} aria-label={`Edit ${product.name}`} title="Edit product">
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
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

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Update product" : "Add product"}</DialogTitle>
            <DialogDescription>Product details are sent as multipart form data to the products API.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveProduct} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`product-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`product-${field.key}`}
                    type={field.type ?? "text"}
                    min={field.type === "number" ? "0" : undefined}
                    step={field.type === "number" ? "any" : undefined}
                    required={field.required}
                    value={String(form[field.key] ?? "")}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-description">Description</Label>
                <textarea
                  id="product-description"
                  required
                  rows={3}
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-image">Product image{editingId ? " (optional)" : ""}</Label>
                <Input id="product-image" type="file" accept="image/*" required={!editingId} onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
              </div>
            </div>
            {notice && <p role="alert" className="text-sm text-destructive">{notice}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoaderCircle className="animate-spin" />}
                {editingId ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}