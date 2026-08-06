const express = require("express");
const router = express.Router();
const store = require("../data/store");
const qpay = require("../services/qpay");

function findOrder(orders, id) {
  return orders.find((o) => o.id === id);
}

// GET /api/payments/qpay/:orderId/status
// Frontend polls this while the payment page is open.
router.get("/qpay/:orderId/status", async (req, res) => {
  const orders = store.getOrders();
  const order = findOrder(orders, req.params.orderId);
  if (!order) return res.status(404).json({ error: "Захиалга олдсонгүй" });

  // Already resolved — no need to call QPay again
  if (order.paymentStatus === "төлөгдсөн") {
    return res.json({ paymentStatus: order.paymentStatus, demo: qpay.DEMO_MODE });
  }

  if (qpay.DEMO_MODE) {
    // Demo mode only advances when /simulate is called explicitly
    return res.json({ paymentStatus: order.paymentStatus, demo: true });
  }

  if (!order.payment || !order.payment.invoiceId) {
    return res.status(400).json({ error: "Энэ захиалгад нэхэмжлэх үүсээгүй байна" });
  }

  try {
    const { paid } = await qpay.checkPayment(order.payment.invoiceId);
    if (paid && order.paymentStatus !== "төлөгдсөн") {
      order.paymentStatus = "төлөгдсөн";
      order.status = "баталгаажсан";
      store.saveOrders(orders);
    }
    res.json({ paymentStatus: order.paymentStatus, demo: false });
  } catch (err) {
    console.error("QPay check error:", err.message);
    res.status(502).json({ error: "QPay-тэй холбогдоход алдаа гарлаа" });
  }
});

// POST /api/payments/qpay/:orderId/simulate
// DEMO ONLY — lets you test the full flow without a real bank app.
router.post("/qpay/:orderId/simulate", (req, res) => {
  if (!qpay.DEMO_MODE) {
    return res.status(403).json({ error: "Энэ endpoint зөвхөн demo горимд ажиллана" });
  }
  const orders = store.getOrders();
  const order = findOrder(orders, req.params.orderId);
  if (!order) return res.status(404).json({ error: "Захиалга олдсонгүй" });

  order.paymentStatus = "төлөгдсөн";
  order.status = "баталгаажсан";
  store.saveOrders(orders);
  res.json({ paymentStatus: order.paymentStatus });
});

// POST /api/payments/qpay/callback
// QPay calls this URL (configured as QPAY_CALLBACK_URL) when a payment lands.
// Not reachable from your laptop unless the server is exposed publicly
// (e.g. via ngrok) — included for when you go live with real credentials.
router.post("/qpay/callback", (req, res) => {
  const { sender_invoice_no, invoice_id } = req.body || {};
  const orders = store.getOrders();
  const order = orders.find(
    (o) =>
      o.id === sender_invoice_no ||
      (o.payment && o.payment.invoiceId === invoice_id)
  );
  if (order) {
    order.paymentStatus = "төлөгдсөн";
    order.status = "баталгаажсан";
    store.saveOrders(orders);
  }
  res.json({ ok: true });
});

module.exports = router;
