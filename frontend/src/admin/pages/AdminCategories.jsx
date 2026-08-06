import React, { useEffect, useState } from "react";
import { adminApi } from "../../api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.getCategories().then(setCategories).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!newLabel.trim()) return;
    setCreating(true);
    try {
      await adminApi.createCategory({ label: newLabel.trim() });
      setNewLabel("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditLabel(c.label);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
  };

  const handleUpdate = async (id) => {
    if (!editLabel.trim()) return;
    setError("");
    try {
      await adminApi.updateCategory(id, { label: editLabel.trim() });
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Энэ ангиллыг устгах уу?")) return;
    setError("");
    try {
      await adminApi.deleteCategory(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="admin-title">Ангилал</h1>

      <form className="admin-form admin-form--inline" onSubmit={handleCreate}>
        <label>
          Шинэ ангиллын нэр
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Жишээ: Хуриманд зориулсан"
          />
        </label>
        <button className="btn btn--solid" disabled={creating}>
          {creating ? "Нэмж байна..." : "+ Ангилал нэмэх"}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="empty-state">Ачааллаж байна...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Нэр</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="admin-table__id">{c.id}</td>
                <td>
                  {editingId === c.id ? (
                    <input
                      className="admin-table__edit-input"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    c.label
                  )}
                </td>
                <td className="admin-table__actions">
                  {editingId === c.id ? (
                    <>
                      <button onClick={() => handleUpdate(c.id)}>Хадгалах</button>
                      <button onClick={cancelEdit}>Цуцлах</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(c)}>Засах</button>
                      {c.id !== "all" && (
                        <button
                          className="admin-table__delete"
                          onClick={() => handleDelete(c.id)}
                        >
                          Устгах
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
