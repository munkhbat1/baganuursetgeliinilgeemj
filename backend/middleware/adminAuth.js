/**
 * Very small auth layer for a demo admin panel.
 * Login with the admin password issues an opaque token kept in memory.
 * Tokens are lost on server restart — good enough for local/demo use.
 * For production, swap this for real sessions/JWT + hashed passwords.
 */
const { nanoid } = require("nanoid");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "astra2026";
const validTokens = new Set();

function login(password) {
  if (password !== ADMIN_PASSWORD) return null;
  const token = nanoid(32);
  validTokens.add(token);
  return token;
}

function logout(token) {
  validTokens.delete(token);
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: "Нэвтрэх эрхгүй байна" });
  }
  next();
}

module.exports = { login, logout, requireAdmin };
