export interface Product {
  id: string;
  name: string;
  category: "Health" | "Beauty" | "Wellness" | "Gadget" | "Home" | "Personal Care";
  categoryColor: string;
  price: number;
  currency: string;
  rating: number;
  image: string;
  description: string;
  pointsValue: number; // PV for MLM earnings
  benefits: string[];
  inStock: boolean;
}

export interface StatMetric {
  id: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sublabel?: string;
  trend?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
}
