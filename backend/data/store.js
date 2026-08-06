/**
 * Minimal file-backed JSON store.
 * Good enough for a demo backend without a real database.
 * Swap this out for MongoDB/Postgres later without touching the routes much,
 * as long as the same async get/save shape is kept.
 */
const fs = require("fs");
const path = require("path");

const ORDERS_FILE = path.join(__dirname, "orders.json");
const CARTS_FILE = path.join(__dirname, "carts.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");
const CATEGORIES_FILE = path.join(__dirname, "categories.json");
const CONTENT_FILE = path.join(__dirname, "content.json");

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  }
}

ensureFile(ORDERS_FILE, []);
ensureFile(CARTS_FILE, {});

function readJSON(file) {
  const raw = fs.readFileSync(file, "utf-8");
  return raw.trim() ? JSON.parse(raw) : null;
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  getProducts: () => readJSON(PRODUCTS_FILE),
  saveProducts: (products) => writeJSON(PRODUCTS_FILE, products),
  getCategories: () => readJSON(CATEGORIES_FILE),
  saveCategories: (categories) => writeJSON(CATEGORIES_FILE, categories),
  getContent: () => readJSON(CONTENT_FILE),
  saveContent: (content) => writeJSON(CONTENT_FILE, content),
  getOrders: () => readJSON(ORDERS_FILE) || [],
  saveOrders: (orders) => writeJSON(ORDERS_FILE, orders),
  getCarts: () => readJSON(CARTS_FILE) || {},
  saveCarts: (carts) => writeJSON(CARTS_FILE, carts),
};
