/*
 * AutoAffiliates — Renders affiliate product recommendations
 * Injects 2-4 inline links + bottom "Healing Journey" section
 * All links use tag=spankyspinola-20 + (paid link)
 */

import { useMemo } from "react";
import { matchProducts, amazonUrl, type Product } from "@/lib/product-catalog";

interface AutoAffiliatesProps {
  articleTitle: string;
  articleCategory: string;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <li className="py-2">
      <a
        href={amazonUrl(product.asin)}
        target="_blank"
        rel="nofollow noopener"
        className="text-foreground hover:text-gold transition-colors no-underline"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
      >
        {product.name}
      </a>
      <span className="text-muted-foreground text-sm ml-1">(paid link)</span>
    </li>
  );
}

export default function AutoAffiliates({ articleTitle, articleCategory }: AutoAffiliatesProps) {
  const products = useMemo(
    () => matchProducts(articleTitle, articleCategory, 4),
    [articleTitle, articleCategory]
  );

  if (products.length === 0) return null;

  return (
    <div
      className="my-8 p-6 rounded-lg"
      style={{
        border: "1px solid oklch(0.85 0.05 85)",
        background: "oklch(0.97 0.01 85 / 0.3)",
      }}
    >
      <h3
        className="mt-0 mb-3 text-lg"
        style={{ fontFamily: "var(--font-serif)", color: "oklch(0.45 0.08 85)" }}
      >
        Healing Journey Resources
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        A few tools that others on a similar path have found helpful:
      </p>
      <ul className="list-none p-0 m-0 space-y-1">
        {products.map((p) => (
          <ProductCard key={p.asin} product={p} />
        ))}
      </ul>
      <p className="text-xs text-muted-foreground mt-4 mb-0">
        As an Amazon Associate, I earn from qualifying purchases.
      </p>
    </div>
  );
}
