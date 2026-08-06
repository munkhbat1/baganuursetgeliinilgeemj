import React, { useEffect, useState } from "react";
import { adminApi, api } from "../../api";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

const emptyForm = {
  name: "",
  category: "",
  price: "",
  oldPrice: "",
  stock: "",
  image: "",
  description: "",
  featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getProducts(), api.getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c.filter((c) => c.id !== "all"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice || "",
      stock: p.stock,
      image: p.image,
      description: p.description,
      featured: p.featured,
    });
    setEditingId(p.id);
    setShowForm(true);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, form);
      } else {
        await adminApi.createProduct(form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Энэ барааг устгах уу?")) return;
    await adminApi.deleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Бараа</h1>
        <button className="btn btn--solid" onClick={openCreate}>+ Шинэ бараа</button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <label>
              Нэр
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Ангилал
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">-- сонгох --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <label>
              Үнэ (₮)
              <input type="number" name="price" value={form.price} onChange={handleChange} required />
            </label>
            <label>
              Хуучин үнэ (заавал биш)
              <input type="number" name="oldPrice" value={form.oldPrice} onChange={handleChange} />
            </label>
            <label>
              Нөөц
              <input type="number" name="stock" value={form.stock} onChange={handleChange} />
            </label>
            <label>
              Зургийн URL
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            </label>
          </div>
          <label>
            Тайлбар
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>
          <label className="admin-form__checkbox">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Онцлох бүтээгдэхүүн
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="admin-form__actions">
            <button type="button" className="btn btn--outline-dark" onClick={() => setShowForm(false)}>
              Цуцлах
            </button>
            <button className="btn btn--solid">
              {editingId ? "Хадгалах" : "Нэмэх"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="empty-state">Ачааллаж байна...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Зураг</th>
              <th>Нэр</th>
              <th>Ангилал</th>
              <th>Үнэ</th>
              <th>Нөөц</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><img className="admin-table__thumb" src={p.image} alt={p.name} /></td>
                <td>{p.name}</td>
                <td>{p.categoryLabel}</td>
                <td>{formatMNT(p.price)}</td>
                <td className={p.stock <= 5 ? "admin-table__warning" : ""}>{p.stock}</td>
                <td className="admin-table__actions">
                  <button onClick={() => openEdit(p)}>Засах</button>
                  <button className="admin-table__delete" onClick={() => handleDelete(p.id)}>Устгах</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
