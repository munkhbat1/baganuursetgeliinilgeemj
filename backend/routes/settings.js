const express = require("express");
const router = express.Router();
const store = require("../data/store");

// GET /api/settings/bank-account
// Bank transfer details shown as a manual-payment fallback alongside QPay.
// Configure via backend/.env — falls back to placeholder demo values.
router.get("/bank-account", (req, res) => {
  res.json({
    bankName: process.env.BANK_NAME || "Хаан Банк",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "5000123456",
    accountHolder: process.env.BANK_ACCOUNT_HOLDER || "Багануур Сэтгэлийн Илгээмж ХХК",
  });
});

// GET /api/settings/content
// Editable site content: nav links, "Бид юу хийдэг вэ?" services, footer.
router.get("/content", (req, res) => {
  res.json(store.getContent());
});

module.exports = router;
