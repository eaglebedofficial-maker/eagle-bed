export type Category =
  | "ecommerce"
  | "maker"
  | "retail_local"
  | "food_drink"
  | "local_service"
  | "professional"
  | "health_beauty"
  | "saas"
  | "creator"
  | "other";

export const CATEGORIES: { id: Category; label: string; hint: string }[] = [
  { id: "ecommerce", label: "Online shop", hint: "You sell products online (Shopify, WooCommerce…)" },
  { id: "maker", label: "Maker / manufacturer", hint: "You make what you sell (furniture, clothing, crafts…)" },
  { id: "retail_local", label: "Local shop", hint: "A physical store, maybe with a website" },
  { id: "food_drink", label: "Food & drink", hint: "Restaurant, café, bakery, takeaway" },
  { id: "local_service", label: "Local service", hint: "Plumber, cleaner, builder, salon, garage…" },
  { id: "professional", label: "Professional services", hint: "Accountant, lawyer, agency, consultant" },
  { id: "health_beauty", label: "Health & beauty", hint: "Clinic, gym, spa, beauty brand" },
  { id: "saas", label: "Software / app", hint: "SaaS, apps, digital products" },
  { id: "creator", label: "Creator / education", hint: "Courses, coaching, content" },
  { id: "other", label: "Something else", hint: "Tell the Manager in your brief" },
];
