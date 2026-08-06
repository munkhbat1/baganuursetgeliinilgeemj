import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("idle");
  const { addItem } = useCart();

  useEffect(() => {
    setProduct(null);
    api.getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <p className="empty-state">Ачааллаж байна...</p>;

  const handleAdd = async () => {
    setStatus("loading");
    await addItem(product.id, qty);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 1800);
  };

  return (
    <section className="section product-detail">
      <Link to="/shop" className="back-link">← Буцах</Link>
      <div className="product-detail__grid">
        <div className="product-detail__media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail__info">
          <p className="product-card__category">{product.categoryLabel}</p>
          <h1>{product.name}</h1>
          <div className="product-card__price product-detail__price">
            <span>{formatMNT(product.price)}</span>
            {product.oldPrice && <s>{formatMNT(product.oldPrice)}</s>}
          </div>
          <p className="product-detail__desc">{product.description}</p>

          <div className="qty-row">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          <button className="btn btn--solid" onClick={handleAdd} disabled={status === "loading"}>
            {status === "done" ? "Сагсанд нэмэгдлээ ✓" : "Сагсанд нэмэх"}
          </button>

          <p className="product-detail__stock">
            {product.stock > 0 ? `Нөөцөд ${product.stock} ширхэг байна` : "Нөөц дууссан"}
          </p>
        </div>
      </div>
    </section>
  );
}
