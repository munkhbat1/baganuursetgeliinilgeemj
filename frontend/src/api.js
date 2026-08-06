const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Алдаа гарлаа");
  }
  return res.json();
}

async function adminRequest(path, options = {}) {
  const token = localStorage.getItem("astra_admin_token");
  const res = await fetch(`${BASE}/admin${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    localStorage.removeItem("astra_admin_token");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Алдаа гарлаа");
  }
  return res.json();
}

export const adminApi = {
  login: (password) =>
    request("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => adminRequest("/logout", { method: "POST" }),
  getSummary: () => adminRequest("/summary"),
  getProducts: () => adminRequest("/products"),
  createProduct: (data) =>
    adminRequest("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    adminRequest(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => adminRequest(`/products/${id}`, { method: "DELETE" }),
  getOrders: () => adminRequest("/orders"),
  createOrder: (data) =>
    adminRequest("/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrder: (id, data) =>
    adminRequest(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteOrder: (id) => adminRequest(`/orders/${id}`, { method: "DELETE" }),
  updateOrderStatus: (id, status) =>
    adminRequest(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getCategories: () => adminRequest("/categories"),
  createCategory: (data) =>
    adminRequest("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    adminRequest(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id) => adminRequest(`/categories/${id}`, { method: "DELETE" }),
};

export const paymentsApi = {
  getStatus: (orderId) => request(`/payments/qpay/${orderId}/status`),
  simulate: (orderId) =>
    request(`/payments/qpay/${orderId}/simulate`, { method: "POST" }),
};

export const settingsApi = {
  getBankAccount: () => request("/settings/bank-account"),
  getContent: () => request("/settings/content"),
};

export const contentAdminApi = {
  getContent: () => adminRequest("/content"),
  updateHero: (hero) =>
    adminRequest("/content/hero", { method: "PUT", body: JSON.stringify({ hero }) }),
  uploadHeroImage: async (file) => {
    const token = localStorage.getItem("astra_admin_token");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE}/admin/content/hero-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Зураг хуулахад алдаа гарлаа");
    }
    return res.json();
  },
  removeHeroImage: () => adminRequest("/content/hero-image", { method: "DELETE" }),
  uploadHeroPhoneImage: async (file) => {
    const token = localStorage.getItem("astra_admin_token");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE}/admin/content/hero-phone-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Зураг хуулахад алдаа гарлаа");
    }
    return res.json();
  },
  removeHeroPhoneImage: () => adminRequest("/content/hero-phone-image", { method: "DELETE" }),
  updateNav: (nav) =>
    adminRequest("/content/nav", { method: "PUT", body: JSON.stringify({ nav }) }),
  updateServices: (services) =>
    adminRequest("/content/services", { method: "PUT", body: JSON.stringify({ services }) }),
  updateFooter: (footer) =>
    adminRequest("/content/footer", { method: "PUT", body: JSON.stringify({ footer }) }),
};

export const api = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request("/categories"),

  createCart: () => request("/cart", { method: "POST" }),
  getCart: (cartId) => request(`/cart/${cartId}`),
  addToCart: (cartId, productId, qty = 1) =>
    request(`/cart/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify({ productId, qty }),
    }),
  updateCartItem: (cartId, productId, qty) =>
    request(`/cart/${cartId}/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ qty }),
    }),
  removeCartItem: (cartId, productId) =>
    request(`/cart/${cartId}/items/${productId}`, { method: "DELETE" }),

  placeOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  getOrder: (id) => request(`/orders/${id}`),
};
