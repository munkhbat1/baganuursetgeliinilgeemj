const express = require("express");
const router = express.Router();
const store = require("../data/store");

// GET /api/products?category=hairaa-ilerhiileh&search=сарнай&featured=true
router.get("/", (req, res) => {
  let products = store.getProducts();
  const { category, search, featured } = req.query;

  if (category && category !== "all") {
    products = products.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  if (featured === "true") {
    products = products.filter((p) => p.featured);
  }

  res.json({ count: products.length, products });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = store.getProducts().find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Бараа олдсонгүй" });
  res.json(product);
});

module.exports = router;
