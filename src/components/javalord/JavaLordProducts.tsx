"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, Check, ShoppingCart, Sparkles } from "lucide-react";
import { Product } from "./types";

const PRODUCTS_DATA: Product[] = [
  {
    id: "vital-max",
    name: "Vital Max",
    category: "Health",
    categoryColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    price: 15000,
    currency: "₦",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
    description:
      "Premium multivitamin complex packed with natural herbal extracts and immune defenders to boost daily vitality and energy.",
    pointsValue: 40,
    benefits: [
      "Supports immune resilience",
      "Sustained all-day stamina",
      "100% natural organic blend",
    ],
    inStock: true,
  },
  {
    id: "glow-skin-set",
    name: "Glow Skin Set",
    category: "Beauty",
    categoryColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    price: 22500,
    currency: "₦",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
    description:
      "4-step luxury botanical skincare regimen featuring brightening serum, day moisture veil, and nighttime repair nectar.",
    pointsValue: 65,
    benefits: [
      "Hyaluronic acid hydration",
      "Reduces dark spots & blemishes",
      "Dermatologically certified",
    ],
    inStock: true,
  },
  {
    id: "javalord-coffee",
    name: "JavaLord Coffee",
    category: "Wellness",
    categoryColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    price: 8500,
    currency: "₦",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80",
    description:
      "Signature gourmet Arabica roast infused with Cordyceps and Ganoderma for razor-sharp cognitive focus and zero crash.",
    pointsValue: 25,
    benefits: [
      "Infused with Ganoderma Lucidum",
      "Rich aroma, low acidity",
      "Boosts brain focus and alertness",
    ],
    inStock: true,
  },
  {
    id: "prosound-earbuds",
    name: "ProSound Earbuds",
    category: "Gadget",
    categoryColor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    price: 18000,
    currency: "₦",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
    description:
      "True wireless HD sound with active noise suppression, LED digital charge readout, and 36-hour total battery playback.",
    pointsValue: 50,
    benefits: [
      "Deep bass acoustic drivers",
      "Touch volume & call control",
      "Sweat and water resistant",
    ],
    inStock: true,
  },
  {
    id: "power-blender",
    name: "Power Blender",
    category: "Home",
    categoryColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    price: 30000,
    currency: "₦",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&auto=format&fit=crop&q=80",
    description:
      "Commercial-grade 1200W high-speed motor with 6 stainless vortex blades designed to crush whole fruits, nuts, and ice in seconds.",
    pointsValue: 85,
    benefits: [
      "BPA-free tritan container",
      "Overheat circuit safety switch",
      "Self-cleaning rapid pulse mode",
    ],
    inStock: true,
  },
  {
    id: "classic-care-set",
    name: "Classic Care Set",
    category: "Personal Care",
    categoryColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    price: 12000,
    currency: "₦",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80",
    description:
      "Gentle daily grooming essentials with invigorating eucalyptus, cedarwood, and shea butter for pristine all-day freshness.",
    pointsValue: 35,
    benefits: [
      "Sulfate and paraben free",
      "Long lasting masculine fragrance",
      "Includes body wash and shampoo",
    ],
    inStock: true,
  },
  {
    id: "smart-health-watch",
    name: "Smart Health Watch",
    category: "Gadget",
    categoryColor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    price: 35000,
    currency: "₦",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80",
    description:
      "Next-gen biometric fitness tracker featuring blood oxygen monitoring, heart rate analysis, ECG tracking, and 14-day battery life.",
    pointsValue: 95,
    benefits: [
      "24/7 continuous health tracking",
      "High-res AMOLED curved glass",
      "5ATM water resistance rating",
    ],
    inStock: true,
  },
  {
    id: "detox-herbal-tea",
    name: "Detox Herbal Tea",
    category: "Health",
    categoryColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    price: 7500,
    currency: "₦",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
    description:
      "All-natural cleanse formula combining organic dandelion root, ginger rhizome, and senna for digestion support and cellular cleansing.",
    pointsValue: 20,
    benefits: [
      "Naturally flushes metabolic toxins",
      "Smooth mint & lemon ginger taste",
      "No caffeine or synthetic additives",
    ],
    inStock: true,
  },
  {
    id: "caviar-lift-elixir",
    name: "Caviar Lift Elixir",
    category: "Beauty",
    categoryColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    price: 28000,
    currency: "₦",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80",
    description:
      "Concentrated marine collagen and black caviar peptide serum designed to visibly restore elasticity, firmness, and youth radiance.",
    pointsValue: 80,
    benefits: [
      "Micro-encapsulated caviar beads",
      "Noticeable tightening in 7 days",
      "Enhances natural skin barrier",
    ],
    inStock: true,
  },
  {
    id: "ionic-air-purifier",
    name: "Ionic Air Purifier",
    category: "Home",
    categoryColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    price: 45000,
    currency: "₦",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80",
    description:
      "Compact desktop air sanitation unit with True HEPA-13 multi-layer filtration and silent whisper-quiet negative ion dispersion.",
    pointsValue: 120,
    benefits: [
      "Filters 99.97% of particulates",
      "Ultra-quiet sleep mode under 22dB",
      "Low power consumption USB-C",
    ],
    inStock: true,
  },
];

export default function JavaLordProducts() {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<string>("All");
  const [cartSuccess, setCartSuccess] = React.useState(false);

  const categories = [
    "All",
    "Health",
    "Beauty",
    "Wellness",
    "Gadget",
    "Home",
    "Personal Care",
  ];

  const filteredProducts =
    activeFilter === "All"
      ? PRODUCTS_DATA
      : PRODUCTS_DATA.filter((p) => p.category === activeFilter);

  return (
    <section id="products" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Our Products</span>
              <span className="w-2 h-2 rounded-full bg-[#a3e635]" />
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              High quality products carefully selected for you and your customers ({filteredProducts.length} items).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              id="view-all-products-btn"
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter("All")}
              className="border-[#a3e635]/40 text-[#a3e635] hover:bg-[#a3e635]/10 hover:text-[#a3e635] text-xs sm:text-sm font-semibold h-9 px-3.5 rounded-lg active:scale-95 cursor-pointer"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => {
            const countForCat =
              cat === "All"
                ? PRODUCTS_DATA.length
                : PRODUCTS_DATA.filter((p) => p.category === cat).length;

            return (
              <Button
                key={cat}
                variant={activeFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(cat)}
                className={`h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === cat
                    ? "bg-[#a3e635] text-black font-semibold hover:bg-[#bef264]"
                    : "bg-[#0e141f] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${
                    activeFilter === cat
                      ? "bg-black/20 text-black font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {countForCat}
                </span>
              </Button>
            );
          })}
        </div>

        {/* CAROUSEL SLIDER (Showing 6 by default on desktop, up to 10 products, with CarouselPrevious & CarouselNext) */}
        <div className="relative px-2 sm:px-6 lg:px-8">
          <Carousel
            opts={{
              align: "start",
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4">
              {filteredProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  id={`product-slide-${product.id}`}
                  className="pl-2 sm:pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/6"
                >
                  <div className="p-1 h-full">
                    <Card
                      id={`product-card-${product.id}`}
                      className="group bg-[#0e141f] border-slate-800/90 hover:border-slate-700 py-0 gap-0 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                    >
                      {/* Image Container with Category Badge */}
                      <div className="relative aspect-square w-full bg-[#151c28] overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e141f] via-transparent to-transparent opacity-60 z-10 pointer-events-none" />
                      </div>

                      {/* Body using shadcn CardContent */}
                      <CardContent className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
                        <div className="space-y-1.5">
                          {/* Category Badge using shadcn Badge */}
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium border px-2 py-0.5 ${product.categoryColor}`}
                          >
                            {product.category}
                          </Badge>

                          {/* Title */}
                          <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-[#a3e635] transition-colors">
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div className="text-sm font-bold text-[#a3e635] tracking-tight">
                            {product.currency}
                            {product.price.toLocaleString()}
                          </div>
                        </div>

                        {/* View Details Button using shadcn Button */}
                        <Button
                          id={`view-product-btn-${product.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="w-full h-8 py-1.5 px-2 bg-[#131a26] hover:bg-[#1a2333] border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              id="carousel-prev-btn"
              className="-left-3 sm:-left-5 lg:-left-6 bg-[#0e141f] border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer shadow-lg"
            />
            <CarouselNext
              id="carousel-next-btn"
              className="-right-3 sm:-right-5 lg:-right-6 bg-[#0e141f] border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30 cursor-pointer shadow-lg"
            />
          </Carousel>
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL (shadcn Dialog) */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
            setCartSuccess(false);
          }
        }}
      >
        {selectedProduct && (
          <DialogContent className="bg-[#0c111a] border-slate-800 text-white sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={`text-[11px] font-semibold px-2.5 py-0.5 border ${selectedProduct.categoryColor}`}
                >
                  {selectedProduct.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs text-[#a3e635] font-semibold bg-[#a3e635]/10 border-[#a3e635]/30 px-2 py-0.5"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  +{selectedProduct.pointsValue} PV Commission
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {selectedProduct.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Official JavaLord Network verified product line
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-[#121824]">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedProduct.description}
              </p>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-200">
                  Key Benefits:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedProduct.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#a3e635]/20 text-[#a3e635] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">
                    Distributor Price
                  </div>
                  <div className="text-2xl font-bold text-[#a3e635]">
                    {selectedProduct.currency}
                    {selectedProduct.price.toLocaleString()}
                  </div>
                </div>

                <Button
                  id="product-order-wholesale-btn"
                  onClick={() => {
                    setCartSuccess(true);
                    setTimeout(() => setCartSuccess(false), 2500);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#a3e635] hover:bg-[#bef264] text-black font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {cartSuccess ? "Added to Order!" : "Order Wholesale"}
                  </span>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
