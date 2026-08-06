import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { api } from "../api";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ category, search })
      .then((d) => setProducts(d.products))
      .finally(() => setLoading(false));
  }, [category, search]);

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === "all") next.delete("category");
    else next.set("category", id);
    setSearchParams(next);
  };

  return (
    <section className="section shop">
      <div className="shop__header">
        <h1 className="section__title">
          {search ? `“${search}” хайлтын үр дүн` : "Бүх цэцэг"}
        </h1>
        <div className="chip-row">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${category === c.id ? "is-active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Ачааллаж байна...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">Тохирох бараа олдсонгүй. Өөр ангилал сонгоно уу.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
