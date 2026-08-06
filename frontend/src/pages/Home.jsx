import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Composer from "../components/Composer";
import CtaBand from "../components/CtaBand";
import { api } from "../api";

function formatMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(n) + "₮";
}

const DOT_COLORS = ["#D63A61", "#F2A6B4", "#F7C9A8", "#FBE0C9", "#FDF3E8"];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const location = useLocation();

  useEffect(() => {
    api.getProducts({ featured: "true" }).then((d) => setFeatured(d.products.slice(0, 3)));
  }, []);

  // Support arriving at /#composer or /#steps from the header nav on other pages
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.hash]);

  return (
    <>
      <Hero />
      <Services />

      <section className="news" id="gallery">
        <div className="wrap">
          <h2 className="news__title">Онцлох баглаанууд</h2>
          <div className="newsgrid">
            {featured.map((p) => (
              <Link to={`/product/${p.id}`} className="ncard" key={p.id}>
                <div className="ncard__thumb">
                  <img src={p.image} alt={p.name} />
                </div>
                <div className="ncard__body">
                  <span className="ncard__tag">{p.categoryLabel}</span>
                  <h3>{p.name}</h3>
                  <div className="ncard__row">
                    <span className="ncard__price">{formatMNT(p.price)}</span>
                    <span className="ncard__more">Дэлгэрэнгүй →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Composer />
      <CtaBand />

      <section className="steps" id="steps">
        <div className="steps__inner">
          <span className="hero__eyebrow steps__eyebrow">Хэрхэн ажилладаг</span>
          <h2 className="steps__title">Гурван алхамд хүргэнэ</h2>
          <div className="steprow">
            <div className="step">
              <span className="step__num">01</span>
              <h3>Цэцгээ сонго</h3>
              <p>Букет, өнгө, төсвөө сонго. Захиалга бүрт мэндчилгээний карт хамт явна.</p>
            </div>
            <div className="step">
              <span className="step__num">02</span>
              <h3>Мэндчилгээгээ бич</h3>
              <p>Дээрх хэсэгт бичсэн үгээ бид гараар бичсэн шиг фонтоор хэвлэж, картанд оруулна.</p>
            </div>
            <div className="step">
              <span className="step__num">03</span>
              <h3>Хаяг өгөөд илгээ</h3>
              <p>Багануур дүүргийн хэмжээнд захиалга өгсөн өдөртөө хүргэнэ.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="dots">
        {DOT_COLORS.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
    </>
  );
}