import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.oldPrice && <span className="badge">Хямдрал</span>}
        <button
          className="product-card__add"
          onClick={handleAdd}
          disabled={adding}
        >
          {added ? "Сагсанд нэмэгдлээ ✓" : "Сагслах"}
        </button>
      </Link>
      <div className="product-card__body">
        <p className="product-card__category">{product.categoryLabel}</p>
        <Link to={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        <div className="product-card__price">
          <span>{formatMNT(product.price)}</span>
          {product.oldPrice && <s>{formatMNT(product.oldPrice)}</s>}
        </div>
      </div>
    </article>
  );
}
