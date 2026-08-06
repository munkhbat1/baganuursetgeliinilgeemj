import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, DELIVERY_OPTIONS } from "../context/CartContext";
import { api } from "../api";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function Checkout() {
  const { cart, cartId, refreshCart, deliveryType, setDeliveryType, deliveryFee, grandTotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    let composedNote = "";
    try {
      composedNote = localStorage.getItem("astra_composed_note") || "";
    } catch {
      // localStorage unavailable — just start with an empty note
    }
    return { name: "", phone: "", address: "", note: composedNote };
  });
  const [deliveryDate, setDeliveryDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("astra_composed_note");
    } catch {
      // nothing to clean up if storage isn't available
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await api.placeOrder({
        cartId,
        customer: form,
        deliveryDate,
        deliveryType,
      });
      await refreshCart(cartId);
      navigate(`/payment/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <h1 className="section__title">Захиалга</h1>
        <p className="empty-state">Сагс хоосон тул захиалга үүсгэх боломжгүй.</p>
      </section>
    );
  }

  return (
    <section className="section checkout">
      <h1 className="section__title">Хүргэлтийн мэдээлэл</h1>
      <div className="checkout__grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Хүлээн авагчийн нэр
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Утасны дугаар
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
          <label>
            Хүргэлтийн хаяг
            <textarea name="address" value={form.address} onChange={handleChange} required />
          </label>
          <label>
            Хүргэх огноо
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </label>

          <div className="delivery-picker">
            <p className="field-label">Хүргэлтийн төрөл</p>
            <div className="delivery-picker__options">
              {Object.entries(DELIVERY_OPTIONS).map(([key, opt]) => (
                <label
                  key={key}
                  className={`delivery-option ${deliveryType === key ? "is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value={key}
                    checked={deliveryType === key}
                    onChange={() => setDeliveryType(key)}
                  />
                  <span className="delivery-option__name">{opt.label}</span>
                  <span className="delivery-option__fee">+{formatMNT(opt.fee)}</span>
                </label>
              ))}
            </div>
          </div>

          <label>
            Захидлын бичвэр (заавал биш)
            <textarea name="note" value={form.note} onChange={handleChange} placeholder="Хайртай хүндээ хэдэн үг..." />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn--solid btn--full" disabled={submitting}>
            {submitting ? "Илгээж байна..." : "Захиалга баталгаажуулах"}
          </button>
        </form>

        <aside className="cart-summary">
          <h3>Захиалгын дүн</h3>
          {cart.items.map((item) => (
            <div className="cart-summary__row" key={item.productId}>
              <span>{item.product?.name} × {item.qty}</span>
              <span>{formatMNT(item.lineTotal)}</span>
            </div>
          ))}
          <div className="cart-summary__row">
            <span>Хүргэлт ({DELIVERY_OPTIONS[deliveryType].label})</span>
            <span>{formatMNT(deliveryFee)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Нийт</span>
            <span>{formatMNT(grandTotal)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
