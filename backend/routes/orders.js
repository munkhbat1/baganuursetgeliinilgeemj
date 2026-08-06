const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const store = require("../data/store");
const qpay = require("../services/qpay");

const DELIVERY_OPTIONS = {
  flower: { label: "Цэцэгт мэндчилгээ", fee: 20000 },
  regular: { label: "Энгийн хүргэлт", fee: 10000 },
};

// POST /api/orders
// body: { cartId, customer: { name, phone, address, note }, deliveryDate, deliveryType }
router.post("/", async (req, res) => {
  const { cartId, customer, deliveryDate, deliveryType } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({
      error: "Нэр, утас, хаяг заавал шаардлагатай",
    });
  }

  const carts = store.getCarts();
  const cart = carts[cartId];
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Сагс хоосон байна" });
  }

  const resolvedDeliveryType = DELIVERY_OPTIONS[deliveryType] ? deliveryType : "regular";
  const deliveryFee = DELIVERY_OPTIONS[resolvedDeliveryType].fee;

  const products = store.getProducts();
  const items = cart.items.map((i) => {
    const product = products.find((p) => p.id === i.productId);
    const price = product ? product.price : 0;
    return {
      productId: i.productId,
      name: product ? product.name : null,
      price: price,
      qty: i.qty,
      lineTotal: price * i.qty,
    };
  });
  const itemsTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const total = itemsTotal + deliveryFee;

  const order = {
    id: nanoid(8).toUpperCase(),
    items,
    itemsTotal,
    deliveryType: resolvedDeliveryType,
    deliveryTypeLabel: DELIVERY_OPTIONS[resolvedDeliveryType].label,
    deliveryFee,
    total,
    customer,
    deliveryDate: deliveryDate || null,
    status: "хүлээгдэж буй",
    paymentStatus: "хүлээгдэж буй", // хүлээгдэж буй | төлөгдсөн | цуцлагдсан
    payment: null, // { invoiceId, qrText, qrImage, urls, demo }
    createdAt: new Date().toISOString(),
  };

  // create the QPay invoice up front so the payment page has something to show
  try {
    order.payment = await qpay.createInvoice(order);
  } catch (err) {
    console.error("QPay invoice error:", err.message);
    // order still gets created — the payment page can retry invoice creation
  }

  const orders = store.getOrders();
  orders.push(order);
  store.saveOrders(orders);

  // clear the cart after a successful order
  carts[cartId] = { items: [] };
  store.saveCarts(carts);

  res.status(201).json(order);
});

// GET /api/orders/:id  -> track an order
router.get("/:id", (req, res) => {
  const order = store.getOrders().find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Захиалга олдсонгүй" });
  res.json(order);
});

module.exports = router;
