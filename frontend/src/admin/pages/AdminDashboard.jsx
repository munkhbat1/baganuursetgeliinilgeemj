import React, { useEffect, useState } from "react";
import { adminApi } from "../../api";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    adminApi.getSummary().then(setSummary).catch(() => {});
  }, []);

  if (!summary) return <p className="empty-state">Ачааллаж байна...</p>;

  return (
    <div>
      <h1 className="admin-title">Хянах самбар</h1>
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Нийт бараа</span>
          <strong>{summary.productCount}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Нийт захиалга</span>
          <strong>{summary.orderCount}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Хүлээгдэж буй захиалга</span>
          <strong>{summary.pendingOrders}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Нийт орлого</span>
          <strong>{formatMNT(summary.revenue)}</strong>
        </div>
      </div>

      <h2 className="admin-subtitle">Нөөц бага байгаа бараа</h2>
      {summary.lowStock.length === 0 ? (
        <p className="empty-state">Одоогоор бага нөөцтэй бараа алга.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Нэр</th><th>Ангилал</th><th>Нөөц</th></tr>
          </thead>
          <tbody>
            {summary.lowStock.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.categoryLabel}</td>
                <td className="admin-table__warning">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
