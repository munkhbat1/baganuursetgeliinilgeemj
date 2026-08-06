const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const store = require("../data/store");

function getCart(carts, cartId) {
  if (!carts[cartId]) carts[cartId] = { items: [] };
  return carts[cartId];
}

function withProductDetails(cart) {
  const products = store.getProducts();
  const items = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product,
      lineTotal: product ? product.price * item.qty : 0,
    };
  });
  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, total, count: items.reduce((s, i) => s + i.qty, 0) };
}

// POST /api/cart -> creates a new cart id for a fresh visitor
router.post("/", (req, res) => {
  const carts = store.getCarts();
  const cartId = nanoid(10);
  carts[cartId] = { items: [] };
  store.saveCarts(carts);
  res.json({ cartId });
});

// GET /api/cart/:cartId
router.get("/:cartId", (req, res) => {
  const carts = store.getCarts();
  const cart = getCart(carts, req.params.cartId);
  res.json(withProductDetails(cart));
});

// POST /api/cart/:cartId/items  { productId, qty }
router.post("/:cartId/items", (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = store.getProducts().find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Бараа олдсонгүй" });

  const carts = store.getCarts();
  const cart = getCart(carts, req.params.cartId);
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId, qty });
  }
  store.saveCarts(carts);
  res.json(withProductDetails(cart));
});

// PUT /api/cart/:cartId/items/:productId  { qty }
router.put("/:cartId/items/:productId", (req, res) => {
  const { qty } = req.body;
  const carts = store.getCarts();
  const cart = getCart(carts, req.params.cartId);
  const item = cart.items.find((i) => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ error: "Сагсанд байхгүй байна" });

  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  } else {
    item.qty = qty;
  }
  store.saveCarts(carts);
  res.json(withProductDetails(cart));
});

// DELETE /api/cart/:cartId/items/:productId
router.delete("/:cartId/items/:productId", (req, res) => {
  const carts = store.getCarts();
  const cart = getCart(carts, req.params.cartId);
  cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  store.saveCarts(carts);
  res.json(withProductDetails(cart));
});

// DELETE /api/cart/:cartId -> empty the cart
router.delete("/:cartId", (req, res) => {
  const carts = store.getCarts();
  carts[req.params.cartId] = { items: [] };
  store.saveCarts(carts);
  res.json(withProductDetails(carts[req.params.cartId]));
});

module.exports = router;
