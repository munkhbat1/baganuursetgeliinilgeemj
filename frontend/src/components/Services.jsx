import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { settingsApi } from "../api";

const ICONS = {
  delivery: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 8.5c0 4.5-8 10.5-8 10.5s-8-6-8-10.5a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8z" />
    </svg>
  ),
  custom: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 14l1.5-1.5a2 2 0 1 1 3 2.7L11 20l-7-7 4-4" />
      <path d="M4 13l-2-2 5-5 3 2" />
    </svg>
  ),
  card: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5c3 0 6 1 8 3 2-2 5-3 8-3v13c-3 0-6 1-8 3-2-2-5-3-8-3z" />
    </svg>
  ),
  urgent: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.3" r="0.6" fill="currentColor" />
    </svg>
  ),
};

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    settingsApi.getContent().then((c) => setServices(c.services || [])).catch(() => {});
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="services" id="services">
      <div className="services__inner">
        <h2 className="services__title">Бид юу хийдэг вэ?</h2>
        <div className="servgrid">
          {services.map((s, idx) => (
            <div className="scard" key={`${s.title}-${idx}`}>
              <div className="scard__icon">{ICONS[s.icon] || ICONS.delivery}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {s.link && (
                <Link to={s.link} className="scard__link">Дэлгэрэнгүй →</Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}