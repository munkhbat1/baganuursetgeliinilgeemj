import React from "react";
import { Link } from "react-router-dom";
import { useCart, DELIVERY_OPTIONS } from "../context/CartContext";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function Cart() {
  const {
    cart,
    updateItem,
    removeItem,
    loading,
    deliveryType,
    setDeliveryType,
    deliveryFee,
    grandTotal,
  } = useCart();

  if (loading) return <p className="empty-state">Ачааллаж байна...</p>;

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <h1 className="section__title">Сагс</h1>
        <p className="empty-state">Таны сагс хоосон байна.</p>
        <Link to="/shop" className="btn btn--solid">Цэцэг сонгох</Link>
      </section>
    );
  }

  return (
    <section className="section cart-page">
      <h1 className="section__title">Сагс</h1>
      <div className="cart-page__grid">
        <div>
          <div className="cart-list">
            {cart.items.map((item) => (
              <div className="cart-row" key={item.productId}>
                <img src={item.product?.image} alt={item.product?.name} />
                <div className="cart-row__info">
                  <p className="cart-row__name">{item.product?.name}</p>
                  <p className="cart-row__price">{formatMNT(item.product?.price || 0)}</p>
                </div>
                <div className="qty-row">
                  <button onClick={() => updateItem(item.productId, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateItem(item.productId, item.qty + 1)}>+</button>
                </div>
                <p className="cart-row__total">{formatMNT(item.lineTotal)}</p>
                <button className="cart-row__remove" onClick={() => removeItem(item.productId)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="delivery-picker">
            <p className="field-label">Хүргэлтийн төрөл сонгох</p>
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
        </div>

        <aside className="cart-summary">
          <h3>Захиалгын дүн</h3>
          <div className="cart-summary__row">
            <span>Дүн</span>
            <span>{formatMNT(cart.total)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Хүргэлт ({DELIVERY_OPTIONS[deliveryType].label})</span>
            <span>{formatMNT(deliveryFee)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Нийт</span>
            <span>{formatMNT(grandTotal)}</span>
          </div>
          <Link to="/checkout" className="btn btn--solid btn--full">
            Захиалга өгөх
          </Link>
        </aside>
      </div>
    </section>
  );
}