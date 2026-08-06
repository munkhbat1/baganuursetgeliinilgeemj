const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const store = require("../data/store");
const { login, logout, requireAdmin } = require("../middleware/adminAuth");
const upload = require("../middleware/upload");

/* ---------- Auth ---------- */

// POST /api/admin/login  { password }
router.post("/login", (req, res) => {
  const { password } = req.body;
  const token = login(password);
  if (!token) return res.status(401).json({ error: "Нууц үг буруу байна" });
  res.json({ token });
});

// POST /api/admin/logout
router.post("/logout", requireAdmin, (req, res) => {
  const token = req.headers.authorization.slice(7);
  logout(token);
  res.json({ ok: true });
});

// Everything below requires a valid admin token
router.use(requireAdmin);

/* ---------- Dashboard summary ---------- */

// GET /api/admin/summary
router.get("/summary", (req, res) => {
  const products = store.getProducts();
  const orders = store.getOrders();
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStock = products.filter((p) => p.stock <= 5);

  res.json({
    productCount: products.length,
    orderCount: orders.length,
    revenue,
    pendingOrders: orders.filter((o) => o.status === "хүлээгдэж буй").length,
    lowStock,
  });
});

/* ---------- Products (CRUD) ---------- */

// GET /api/admin/products
router.get("/products", (req, res) => {
  res.json(store.getProducts());
});

// POST /api/admin/products
router.post("/products", (req, res) => {
  const products = store.getProducts();
  const categories = store.getCategories();
  const body = req.body || {};

  if (!body.name || !body.price || !body.category) {
    return res.status(400).json({ error: "Нэр, үнэ, ангилал заавал шаардлагатай" });
  }

  const category = categories.find((c) => c.id === body.category);

  const product = {
    id: "p_" + nanoid(8),
    name: body.name,
    category: body.category,
    categoryLabel: category ? category.label : body.category,
    price: Number(body.price),
    oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
    image: body.image || "https://picsum.photos/seed/" + nanoid(6) + "/600/700",
    description: body.description || "",
    tags: body.tags || [],
    featured: !!body.featured,
    stock: body.stock !== undefined ? Number(body.stock) : 0,
  };

  products.push(product);
  store.saveProducts(products);
  res.status(201).json(product);
});

// PUT /api/admin/products/:id
router.put("/products/:id", (req, res) => {
  const products = store.getProducts();
  const categories = store.getCategories();
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Бараа олдсонгүй" });

  const body = req.body || {};
  const category = body.category
    ? categories.find((c) => c.id === body.category)
    : null;

  products[idx] = {
    ...products[idx],
    ...body,
    price: body.price !== undefined ? Number(body.price) : products[idx].price,
    oldPrice:
      body.oldPrice !== undefined
        ? body.oldPrice
          ? Number(body.oldPrice)
          : null
        : products[idx].oldPrice,
    stock: body.stock !== undefined ? Number(body.stock) : products[idx].stock,
    categoryLabel: category ? category.label : products[idx].categoryLabel,
  };

  store.saveProducts(products);
  res.json(products[idx]);
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", (req, res) => {
  const products = store.getProducts();
  const next = products.filter((p) => p.id !== req.params.id);
  if (next.length === products.length) {
    return res.status(404).json({ error: "Бараа олдсонгүй" });
  }
  store.saveProducts(next);
  res.json({ ok: true });
});

/* ---------- Categories (CRUD) ---------- */

function slugify(text) {
  const ascii = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii; // may be empty for non-Latin labels (e.g. Cyrillic) — caller falls back to a random id
}

// GET /api/admin/categories
router.get("/categories", (req, res) => {
  res.json(store.getCategories());
});

// POST /api/admin/categories  { label, id? }
router.post("/categories", (req, res) => {
  const { label } = req.body;
  if (!label || !label.trim()) {
    return res.status(400).json({ error: "Ангиллын нэр заавал шаардлагатай" });
  }

  const categories = store.getCategories();
  let id = req.body.id ? slugify(req.body.id) : slugify(label);
  if (!id) id = "cat-" + nanoid(6);

  if (categories.some((c) => c.id === id)) {
    return res.status(400).json({ error: "Ийм ID-тай ангилал аль хэдийн байна" });
  }

  const category = { id, label: label.trim() };
  categories.push(category);
  store.saveCategories(categories);
  res.status(201).json(category);
});

// PUT /api/admin/categories/:id  { label }
router.put("/categories/:id", (req, res) => {
  const { label } = req.body;
  if (!label || !label.trim()) {
    return res.status(400).json({ error: "Ангиллын нэр заавал шаардлагатай" });
  }

  const categories = store.getCategories();
  const category = categories.find((c) => c.id === req.params.id);
  if (!category) return res.status(404).json({ error: "Ангилал олдсонгүй" });

  category.label = label.trim();
  store.saveCategories(categories);

  // keep product cards' displayed category name in sync
  const products = store.getProducts();
  let changed = false;
  products.forEach((p) => {
    if (p.category === req.params.id) {
      p.categoryLabel = category.label;
      changed = true;
    }
  });
  if (changed) store.saveProducts(products);

  res.json(category);
});

// DELETE /api/admin/categories/:id
router.delete("/categories/:id", (req, res) => {
  if (req.params.id === "all") {
    return res.status(400).json({ error: "'Бүх цэцэг' ангиллыг устгах боломжгүй" });
  }

  const categories = store.getCategories();
  const exists = categories.some((c) => c.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Ангилал олдсонгүй" });

  const products = store.getProducts();
  const inUse = products.filter((p) => p.category === req.params.id).length;
  if (inUse > 0) {
    return res.status(400).json({
      error: `Энэ ангилалд ${inUse} бараа хамаарч байгаа тул устгах боломжгүй. Эхлээд тэдгээр барааны ангиллыг өөрчилнө үү.`,
    });
  }

  store.saveCategories(categories.filter((c) => c.id !== req.params.id));
  res.json({ ok: true });
});

/* ---------- Orders ---------- */

// GET /api/admin/orders
router.get("/orders", (req, res) => {
  const orders = store.getOrders().slice().reverse(); // newest first
  res.json(orders);
});

const DELIVERY_OPTIONS = {
  flower: { label: "Цэцэгт мэндчилгээ", fee: 20000 },
  regular: { label: "Энгийн хүргэлт", fee: 10000 },
};

// POST /api/admin/orders — manually create an order from the admin panel
router.post("/orders", (req, res) => {
  const { customer, items, deliveryDate, status, paymentStatus, deliveryType } = req.body;

  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: "Нэр, утас, хаяг заавал шаардлагатай" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Дор хаяж нэг бараа сонгоно уу" });
  }

  const resolvedDeliveryType = DELIVERY_OPTIONS[deliveryType] ? deliveryType : "regular";
  const deliveryFee = DELIVERY_OPTIONS[resolvedDeliveryType].fee;

  const products = store.getProducts();
  const resolvedItems = items.map((i) => {
    const product = products.find((p) => p.id === i.productId);
    const price = product ? product.price : 0;
    const qty = Number(i.qty) || 1;
    return {
      productId: i.productId,
      name: product ? product.name : i.name || "Устсан бараа",
      price,
      qty,
      lineTotal: price * qty,
    };
  });
  const itemsTotal = resolvedItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const total = itemsTotal + deliveryFee;

  const order = {
    id: nanoid(8).toUpperCase(),
    items: resolvedItems,
    itemsTotal,
    deliveryType: resolvedDeliveryType,
    deliveryTypeLabel: DELIVERY_OPTIONS[resolvedDeliveryType].label,
    deliveryFee,
    total,
    customer,
    deliveryDate: deliveryDate || null,
    status: status || "хүлээгдэж буй",
    paymentStatus: paymentStatus || "хүлээгдэж буй",
    payment: null,
    createdAt: new Date().toISOString(),
  };

  const orders = store.getOrders();
  orders.push(order);
  store.saveOrders(orders);
  res.status(201).json(order);
});

// PUT /api/admin/orders/:id — edit customer info / items / delivery date / delivery type
router.put("/orders/:id", (req, res) => {
  const orders = store.getOrders();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Захиалга олдсонгүй" });

  const { customer, items, deliveryDate, deliveryType } = req.body;

  if (customer) {
    if (!customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ error: "Нэр, утас, хаяг заавал шаардлагатай" });
    }
    order.customer = customer;
  }

  if (deliveryType !== undefined && DELIVERY_OPTIONS[deliveryType]) {
    order.deliveryType = deliveryType;
    order.deliveryTypeLabel = DELIVERY_OPTIONS[deliveryType].label;
    order.deliveryFee = DELIVERY_OPTIONS[deliveryType].fee;
  }

  if (Array.isArray(items) && items.length > 0) {
    const products = store.getProducts();
    order.items = items.map((i) => {
      const product = products.find((p) => p.id === i.productId);
      const price = product ? product.price : (i.price || 0);
      const qty = Number(i.qty) || 1;
      return {
        productId: i.productId,
        name: product ? product.name : i.name || "Устсан бараа",
        price,
        qty,
        lineTotal: price * qty,
      };
    });
    order.itemsTotal = order.items.reduce((sum, i) => sum + i.lineTotal, 0);
  }

  // recompute total whenever items or delivery type could have changed
  const fee = order.deliveryFee || 0;
  const itemsTotal = order.itemsTotal !== undefined
    ? order.itemsTotal
    : order.items.reduce((sum, i) => sum + i.lineTotal, 0);
  order.total = itemsTotal + fee;

  if (deliveryDate !== undefined) order.deliveryDate = deliveryDate;

  store.saveOrders(orders);
  res.json(order);
});

// DELETE /api/admin/orders/:id
router.delete("/orders/:id", (req, res) => {
  const orders = store.getOrders();
  const next = orders.filter((o) => o.id !== req.params.id);
  if (next.length === orders.length) {
    return res.status(404).json({ error: "Захиалга олдсонгүй" });
  }
  store.saveOrders(next);
  res.json({ ok: true });
});

// PUT /api/admin/orders/:id/status  { status }
const STATUSES = ["хүлээгдэж буй", "баталгаажсан", "хүргэгдэж буй", "хүргэгдсэн", "цуцлагдсан"];

router.put("/orders/:id/status", (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "Буруу статус", allowed: STATUSES });
  }
  const orders = store.getOrders();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Захиалга олдсонгүй" });
  order.status = status;
  store.saveOrders(orders);
  res.json(order);
});

/* ---------- Site content (nav / services / footer) ---------- */

// GET /api/admin/content
router.get("/content", (req, res) => {
  res.json(store.getContent());
});

// PUT /api/admin/content/hero  { hero: {title, subtitle, primaryButtonLabel, secondaryButtonLabel} }
router.put("/content/hero", (req, res) => {
  const { hero } = req.body;
  if (!hero || typeof hero !== "object") {
    return res.status(400).json({ error: "hero объект байх ёстой" });
  }
  const content = store.getContent();
  content.hero = hero;
  store.saveContent(content);
  res.json(content);
});

// POST /api/admin/content/hero-image  (multipart/form-data, field name "image")
router.post("/content/hero-image", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Зураг хуулахад алдаа гарлаа" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Зураг олдсонгүй" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const content = store.getContent();
    content.hero = { ...content.hero, image: imageUrl };
    store.saveContent(content);
    res.json(content);
  });
});

// DELETE /api/admin/content/hero-image — revert to the default illustration
router.delete("/content/hero-image", (req, res) => {
  const content = store.getContent();
  if (content.hero) delete content.hero.image;
  store.saveContent(content);
  res.json(content);
});

// POST /api/admin/content/hero-phone-image  (multipart/form-data, field name "image")
router.post("/content/hero-phone-image", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Зураг хуулахад алдаа гарлаа" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Зураг олдсонгүй" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const content = store.getContent();
    content.hero = { ...content.hero, phoneImage: imageUrl };
    store.saveContent(content);
    res.json(content);
  });
});

// DELETE /api/admin/content/hero-phone-image — revert to the default phone mockup
router.delete("/content/hero-phone-image", (req, res) => {
  const content = store.getContent();
  if (content.hero) delete content.hero.phoneImage;
  store.saveContent(content);
  res.json(content);
});

// PUT /api/admin/content/nav  { nav: [{label, path}] }
router.put("/content/nav", (req, res) => {
  const { nav } = req.body;
  if (!Array.isArray(nav)) {
    return res.status(400).json({ error: "nav массив байх ёстой" });
  }
  const content = store.getContent();
  content.nav = nav;
  store.saveContent(content);
  res.json(content);
});

// PUT /api/admin/content/services  { services: [{title, desc, icon}] }
router.put("/content/services", (req, res) => {
  const { services } = req.body;
  if (!Array.isArray(services)) {
    return res.status(400).json({ error: "services массив байх ёстой" });
  }
  const content = store.getContent();
  content.services = services;
  store.saveContent(content);
  res.json(content);
});

// PUT /api/admin/content/footer  { footer: {...} }
router.put("/content/footer", (req, res) => {
  const { footer } = req.body;
  if (!footer || typeof footer !== "object") {
    return res.status(400).json({ error: "footer объект байх ёстой" });
  }
  const content = store.getContent();
  content.footer = footer;
  store.saveContent(content);
  res.json(content);
});

module.exports = router;
