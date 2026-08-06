import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { adminApi } from "../../api";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

const STATUSES = ["хүлээгдэж буй", "баталгаажсан", "хүргэгдэж буй", "хүргэгдсэн", "цуцлагдсан"];
const MONTH_NAMES = [
  "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
  "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар",
];

const emptyItem = { productId: "", qty: 1 };
const emptyForm = {
  name: "",
  phone: "",
  address: "",
  note: "",
  deliveryDate: "",
  items: [{ ...emptyItem }],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getOrders(), adminApi.getProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /* ---------- Year/month filter options derived from data ---------- */
  const years = useMemo(() => {
    const set = new Set(orders.map((o) => new Date(o.createdAt).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [orders]);

  /* ---------- Filter + sort ---------- */
  const visibleOrders = useMemo(() => {
    let list = orders.slice();

    if (filterYear !== "all") {
      list = list.filter((o) => new Date(o.createdAt).getFullYear() === Number(filterYear));
    }
    if (filterMonth !== "all") {
      list = list.filter((o) => new Date(o.createdAt).getMonth() === Number(filterMonth));
    }

    list.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "id": av = a.id; bv = b.id; break;
        case "customer":
          av = (a.customer && a.customer.name) || "";
          bv = (b.customer && b.customer.name) || "";
          break;
        case "total": av = a.total; bv = b.total; break;
        case "status": av = a.status; bv = b.status; break;
        case "paymentStatus": av = a.paymentStatus; bv = b.paymentStatus; break;
        case "createdAt":
        default: av = a.createdAt; bv = b.createdAt; break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [orders, filterYear, filterMonth, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortArrow = (key) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "");

  /* ---------- Excel export ---------- */
  const handleExport = () => {
    const rows = visibleOrders.map((o) => ({
      "№": o.id,
      "Хэрэглэгч": o.customer ? o.customer.name : "",
      "Утас": o.customer ? o.customer.phone : "",
      "Хаяг": o.customer ? o.customer.address : "",
      "Барааны дүн (₮)": o.itemsTotal !== undefined ? o.itemsTotal : o.total,
      "Хүргэлтийн төрөл": o.deliveryTypeLabel || "",
      "Хүргэлтийн хураамж (₮)": o.deliveryFee || 0,
      "Нийт дүн (₮)": o.total,
      "Огноо": new Date(o.createdAt).toLocaleDateString("mn-MN"),
      "Хүргэх огноо": o.deliveryDate || "",
      "Төлбөр": o.paymentStatus || "",
      "Статус": o.status,
      "Бараа": o.items.map((i) => `${i.name} × ${i.qty}`).join(", "),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Захиалга");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `zahialga-${stamp}.xlsx`);
  };

  /* ---------- Status change ---------- */
  const handleStatusChange = async (id, status) => {
    await adminApi.updateOrderStatus(id, status);
    load();
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id) => {
    if (!confirm("Энэ захиалгыг устгах уу?")) return;
    await adminApi.deleteOrder(id);
    load();
  };

  /* ---------- Create / edit form ---------- */
  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setFormError("");
  };

  const openEdit = (o) => {
    setForm({
      name: o.customer ? o.customer.name : "",
      phone: o.customer ? o.customer.phone : "",
      address: o.customer ? o.customer.address : "",
      note: o.customer && o.customer.note ? o.customer.note : "",
      deliveryDate: o.deliveryDate || "",
      items: o.items.map((i) => ({ productId: i.productId, qty: i.qty })),
    });
    setEditingId(o.id);
    setShowForm(true);
    setFormError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleItemChange = (idx, field, value) => {
    const items = form.items.slice();
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const addItemRow = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItemRow = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const items = form.items.filter((i) => i.productId);
    if (items.length === 0) {
      setFormError("Дор хаяж нэг бараа сонгоно уу");
      return;
    }

    const payload = {
      customer: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        note: form.note,
      },
      deliveryDate: form.deliveryDate,
      items: items.map((i) => ({ productId: i.productId, qty: Number(i.qty) || 1 })),
    };

    try {
      if (editingId) {
        await adminApi.updateOrder(editingId, payload);
      } else {
        await adminApi.createOrder(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Захиалга</h1>
        <div className="admin-header-row__actions">
          <button className="btn btn--outline-dark" onClick={handleExport}>
            ⬇ Excel татах
          </button>
          <button className="btn btn--solid" onClick={openCreate}>
            + Шинэ захиалга
          </button>
        </div>
      </div>

      <div className="chip-row admin-filter-row">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="all">Бүх он</option>
          {years.map((y) => (
            <option key={y} value={y}>{y} он</option>
          ))}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="all">Бүх сар</option>
          {MONTH_NAMES.map((m, idx) => (
            <option key={idx} value={idx}>{m}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleFormSubmit}>
          <div className="admin-form__grid">
            <label>
              Хэрэглэгчийн нэр
              <input name="name" value={form.name} onChange={handleFormChange} required />
            </label>
            <label>
              Утас
              <input name="phone" value={form.phone} onChange={handleFormChange} required />
            </label>
            <label>
              Хүргэх огноо
              <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleFormChange} />
            </label>
          </div>
          <label>
            Хаяг
            <textarea name="address" value={form.address} onChange={handleFormChange} required />
          </label>
          <label>
            Захидлын бичвэр
            <textarea name="note" value={form.note} onChange={handleFormChange} />
          </label>

          <div className="admin-order-items">
            <p className="admin-order-items__label">Бараа</p>
            {form.items.map((item, idx) => (
              <div className="admin-order-items__row" key={idx}>
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                >
                  <option value="">-- бараа сонгох --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatMNT(p.price)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                />
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItemRow(idx)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="admin-order-items__add" onClick={addItemRow}>
              + Бараа нэмэх
            </button>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="admin-form__actions">
            <button type="button" className="btn btn--outline-dark" onClick={() => setShowForm(false)}>
              Цуцлах
            </button>
            <button className="btn btn--solid">
              {editingId ? "Хадгалах" : "Захиалга үүсгэх"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="empty-state">Ачааллаж байна...</p>
      ) : visibleOrders.length === 0 ? (
        <p className="empty-state">Тохирох захиалга алга байна.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__sortable" onClick={() => toggleSort("id")}>№{sortArrow("id")}</th>
              <th className="admin-table__sortable" onClick={() => toggleSort("customer")}>Хэрэглэгч{sortArrow("customer")}</th>
              <th>Утас</th>
              <th className="admin-table__sortable" onClick={() => toggleSort("total")}>Дүн{sortArrow("total")}</th>
              <th className="admin-table__sortable" onClick={() => toggleSort("createdAt")}>Огноо{sortArrow("createdAt")}</th>
              <th className="admin-table__sortable" onClick={() => toggleSort("paymentStatus")}>Төлбөр{sortArrow("paymentStatus")}</th>
              <th className="admin-table__sortable" onClick={() => toggleSort("status")}>Статус{sortArrow("status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((o) => (
              <React.Fragment key={o.id}>
                <tr>
                  <td>#{o.id}</td>
                  <td>{o.customer ? o.customer.name : ""}</td>
                  <td>{o.customer ? o.customer.phone : ""}</td>
                  <td>{formatMNT(o.total)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString("mn-MN")}</td>
                  <td>
                    <span className={`pay-badge ${o.paymentStatus === "төлөгдсөн" ? "pay-badge--paid" : ""}`}>
                      {o.paymentStatus || "—"}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`status-select status-select--${o.status.replace(/\s/g, "-")}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="admin-table__actions">
                    <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                      {expanded === o.id ? "Хаах" : "Дэлгэрэнгүй"}
                    </button>
                    <button onClick={() => openEdit(o)}>Засах</button>
                    <button className="admin-table__delete" onClick={() => handleDelete(o.id)}>Устгах</button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr>
                    <td colSpan={8}>
                      <div className="admin-order-detail">
                        <p><strong>Хаяг:</strong> {o.customer ? o.customer.address : ""}</p>
                        {o.customer && o.customer.note && <p><strong>Захидал:</strong> {o.customer.note}</p>}
                        {o.deliveryDate && <p><strong>Хүргэх огноо:</strong> {o.deliveryDate}</p>}
                        {o.deliveryTypeLabel && (
                          <p><strong>Хүргэлтийн төрөл:</strong> {o.deliveryTypeLabel} (+{formatMNT(o.deliveryFee || 0)})</p>
                        )}
                        <ul>
                          {o.items.map((i) => (
                            <li key={i.productId}>
                              {i.name} × {i.qty} — {formatMNT(i.lineTotal)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
