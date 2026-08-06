const express = require("express");
const router = express.Router();
const store = require("../data/store");

// GET /api/categories
router.get("/", (req, res) => {
  res.json(store.getCategories());
});

module.exports = router;
