import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, paymentsApi, settingsApi } from "../api";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function PaymentQPay() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("хүлээгдэж буй");
  const [isDemo, setIsDemo] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [pollError, setPollError] = useState("");
  const [bankAccount, setBankAccount] = useState(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    api.getOrder(orderId).then((o) => {
      setOrder(o);
      setStatus(o.paymentStatus);
    });
    settingsApi.getBankAccount().then(setBankAccount).catch(() => {});
  }, [orderId]);

  useEffect(() => {
    if (status === "төлөгдсөн") {
      navigate(`/order-success/${orderId}`, { replace: true });
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await paymentsApi.getStatus(orderId);
        setStatus(res.paymentStatus);
        setIsDemo(res.demo);
        setPollError("");
      } catch (err) {
        setPollError(err.message);
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [status, orderId, navigate]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await paymentsApi.simulate(orderId);
      setStatus(res.paymentStatus);
    } catch (err) {
      setPollError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleCopyAccount = async () => {
    if (!bankAccount) return;
    try {
      await navigator.clipboard.writeText(bankAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API may be blocked — the number is still visible to copy manually
    }
  };

  if (!order) return <p className="empty-state">Ачааллаж байна...</p>;

  const payment = order.payment;

  return (
    <section className="section payment-page">
      <h1 className="section__title">Төлбөр төлөх</h1>

      <div className="payment-page__grid">
        <div className="payment-page__methods">
          <div className="payment-qr-card">
            {payment && payment.demo && (
              <p className="payment-demo-badge">DEMO ГОРИМ — жинхэнэ QPay холбогдоогүй байна</p>
            )}

            {payment && payment.qrImage ? (
              <img
                className="payment-qr-card__image"
                src={`data:image/png;base64,${payment.qrImage}`}
                alt="QPay QR код"
              />
            ) : (
              <div className="payment-qr-card__placeholder">
                <span>QR</span>
                <p>{payment ? payment.qrText : "Нэхэмжлэх үүсгэж байна..."}</p>
              </div>
            )}

            <p className="payment-qr-card__amount">{formatMNT(order.total)}</p>
            <p className="payment-qr-card__hint">
              QPay холбогдсон банкны аппликейшнээрээ дээрх QR кодыг уншуулж төлбөрөө
              төлнө үү.
            </p>

            {payment && payment.demo && (
              <button
                className="btn btn--solid btn--full"
                onClick={handleSimulate}
                disabled={simulating}
              >
                {simulating ? "Илгээж байна..." : "Төлбөр хийгдсэн гэж тэмдэглэх (demo)"}
              </button>
            )}

            <p className="payment-qr-card__status">
              Төлбөрийн төлөв: <strong>{status}</strong>
            </p>
            {pollError && <p className="form-error">{pollError}</p>}
          </div>

          {bankAccount && (
            <div className="bank-card">
              <p className="bank-card__label">Эсвэл дансаар шилжүүлэх</p>
              <div className="bank-card__row">
                <span>Банк</span>
                <strong>{bankAccount.bankName}</strong>
              </div>
              <div className="bank-card__row">
                <span>Дансны дугаар</span>
                <div className="bank-card__account">
                  <strong>{bankAccount.accountNumber}</strong>
                  <button type="button" className="bank-card__copy" onClick={handleCopyAccount}>
                    {copied ? "Хууллаа ✓" : "Хуулах"}
                  </button>
                </div>
              </div>
              <div className="bank-card__row">
                <span>Хүлээн авагч</span>
                <strong>{bankAccount.accountHolder}</strong>
              </div>
              <div className="bank-card__row">
                <span>Шилжүүлэх дүн</span>
                <strong>{formatMNT(order.total)}</strong>
              </div>
              <p className="bank-card__hint">
                Шилжүүлэг хийсний дараа захиалгын дугаараа (#{order.id}) гүйлгээний утга дээр
                бичнэ үү — бид баталгаажуулаад захиалгыг таны хаяг руу хүргэнэ.
              </p>
            </div>
          )}
        </div>

        <aside className="cart-summary">
          <h3>Захиалга #{order.id}</h3>
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
        </aside>
      </div>

      <Link to="/shop" className="back-link">← Дэлгүүр лүү буцах</Link>
    </section>
  );
}
