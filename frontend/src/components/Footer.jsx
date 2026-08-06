import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { settingsApi } from "../api";

function isExternal(url) {
  return /^https?:\/\//.test(url || "");
}

function FooterLink({ item }) {
  const label = typeof item === "string" ? item : item.label;
  const url = typeof item === "string" ? "" : item.url;

  if (!url) return <span className="site-footer__plain">{label}</span>;
  if (isExternal(url)) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }
  return <Link to={url}>{label}</Link>;
}

export default function Footer() {
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    settingsApi.getContent().then((c) => setFooter(c.footer || null)).catch(() => {});
  }, []);

  if (!footer) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <img src="/logo.jpeg" alt="Багануур Сэтгэлийн Илгээмж" className="site-footer__logo" />
        </div>
        <p>{footer.tagline}</p>
      </div>
      <div className="site-footer__grid">
        {(footer.columns || []).map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.items.map((item, idx) => (
                <li key={idx}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4>Холбоо барих</h4>
          <ul>
            <li>{footer.phone}</li>
            <li>{footer.email}</li>
            <li>{footer.address}</li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Багануур Сэтгэлийн Илгээмж</span>
      </div>
    </footer>
  );
}