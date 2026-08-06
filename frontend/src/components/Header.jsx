import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api, settingsApi } from "../api";

export default function Header() {
  const [query, setQuery] = useState("");
  const [navLinks, setNavLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopOpen, setShopOpen] = useState(false);
  const { cart } = useCart();
  const navigate = useNavigate();
  const shopMenuRef = useRef(null);

  useEffect(() => {
    settingsApi.getContent().then((c) => setNavLinks(c.nav || [])).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const scrollToSection = (e, id) => {
    if (window.location.pathname !== "/") return; // let the Link navigate normally
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <div className="site-header__row">
        <Link to="/" className="brand">
          <img src="/logo.jpeg" alt="Багануур Сэтгэлийн Илгээмж" className="brand__logo" />
          <span className="brand__tag">БАГАНУУР · ЦЭЦЭГ &amp; БЭЛЭГ ХҮРГЭЛТ</span>
        </Link>

        <nav className="main-nav">
          {navLinks.slice(0, 1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="main-nav__link"
              onClick={(e) => item.path.startsWith("/#") && scrollToSection(e, item.path.slice(2))}
            >
              {item.label}
            </Link>
          ))}

          <div className="shop-menu" ref={shopMenuRef}>
            <button
              type="button"
              className="main-nav__link main-nav__link--btn"
              onClick={() => setShopOpen((v) => !v)}
            >
              Цэцгүүд
            </button>
            {shopOpen && (
              <div className="shop-menu__panel">
                <Link to="/shop" className="shop-menu__item shop-menu__item--all" onClick={() => setShopOpen(false)}>
                  Бүх цэцэг үзэх
                </Link>
                {categories
                  .filter((c) => c.id !== "all")
                  .map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${c.id}`}
                      className="shop-menu__item"
                      onClick={() => setShopOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="main-nav__link"
              onClick={(e) => item.path.startsWith("/#") && scrollToSection(e, item.path.slice(2))}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Цэцэг хайх..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Хайх">⌕</button>
          </form>
          <Link to="/cart" className="cart-pill">
            <span className="cart-pill__icon">🧺</span>
            <span className="cart-pill__count">{cart.count || 0}</span>
          </Link>
          <Link to="/shop" className="btn btn--solid">Захиалах</Link>
        </div>
      </div>
    </header>
  );
}