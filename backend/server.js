require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");
const paymentsRouter = require("./routes/payments");
const settingsRouter = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Astra Fresh Flowers API" });
});

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/settings", settingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Хуудас олдсонгүй" });
});

// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Серверийн алдаа гарлаа" });
});

app.listen(PORT, () => {
  console.log(`🌸 Astra Fresh Flowers API ажиллаж байна: http://localhost:${PORT}`);
});
