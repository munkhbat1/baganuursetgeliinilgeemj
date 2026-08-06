import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import PetalMark from "../components/PetalMark";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.getOrder(id).then(setOrder).catch(() => {});
  }, [id]);

  return (
    <section className="section order-success">
      <PetalMark size={40} />
      <h1>Баярлалаа, {order?.customer?.name || ""}!</h1>
      <p>Таны захиалга <strong>#{id}</strong> амжилттай бүртгэгдлээ.</p>
      {order && (
        <div className="cart-summary order-success__summary">
          {order.items.map((item) => (
            <div className="cart-summary__row" key={item.productId}>
              <span>{item.name} × {item.qty}</span>
              <span>{formatMNT(item.lineTotal)}</span>
            </div>
          ))}
          {order.deliveryTypeLabel && (
            <div className="cart-summary__row">
              <span>Хүргэлт ({order.deliveryTypeLabel})</span>
              <span>{formatMNT(order.deliveryFee || 0)}</span>
            </div>
          )}
          <div className="cart-summary__row cart-summary__row--total">
            <span>Нийт</span>
            <span>{formatMNT(order.total)}</span>
          </div>
        </div>
      )}
      <Link to="/shop" className="btn btn--solid">Үргэлжлүүлэн худалдан авах</Link>
    </section>
  );
}
