import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { settingsApi } from "../api";

const FALLBACK_HERO = {
  title: "Хэлж чадахгүй үгээ,\nцэцэг дуулгадаг",
  subtitle:
    "Багануур Сэтгэлийн Илгээмж бол цэцэг сонгож, өөрийн мэндчилгээгээ бичээд, ойрын хүндээ шууд хүргүүлдэг үйлчилгээ. Гараар бичсэн шиг карт, амьд цэцэг — нэг захиалгад.",
  primaryButtonLabel: "Захиалах",
  secondaryButtonLabel: "Мэндчилгээгээ эхлүүл",
};

export default function Hero() {
  const [hero, setHero] = useState(FALLBACK_HERO);

  useEffect(() => {
    settingsApi.getContent().then((c) => {
      if (c.hero) setHero(c.hero);
    }).catch(() => {});
  }, []);

  const titleLines = (hero.title || "").split("\n");

  return (
    <section className="hero">
      <div className="hero__grid">
        <div className="hero__content">
          <h1 className="hero__title">
            {titleLines.map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="hero__subtitle">{hero.subtitle}</p>
          <div className="hero-ctas">
            <Link to="/shop" className="btn btn--solid">
              {hero.primaryButtonLabel || "Захиалах"}
            </Link>
            <a
              href="#composer"
              className="btn btn--outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("composer")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {hero.secondaryButtonLabel || "Мэндчилгээгээ эхлүүл"}
            </a>
          </div>
        </div>

        <div className="hero__art">
          <div className="hero__portrait">
            {hero.image ? (
              <img src={hero.image} alt="" className="hero__portrait-image" />
            ) : (
              <svg viewBox="0 0 200 200" width="72%" height="72%">
                <ellipse cx="100" cy="46" rx="20" ry="30" fill="var(--coral)" />
                <ellipse cx="100" cy="154" rx="20" ry="30" fill="var(--coral)" />
                <ellipse cx="46" cy="100" rx="30" ry="20" fill="var(--blush)" />
                <ellipse cx="154" cy="100" rx="30" ry="20" fill="var(--blush)" />
                <ellipse cx="65" cy="65" rx="22" ry="30" fill="var(--coral)" transform="rotate(45 65 65)" />
                <ellipse cx="135" cy="65" rx="22" ry="30" fill="var(--blush)" transform="rotate(-45 135 65)" />
                <ellipse cx="65" cy="135" rx="22" ry="30" fill="var(--blush)" transform="rotate(-45 65 135)" />
                <ellipse cx="135" cy="135" rx="22" ry="30" fill="var(--coral)" transform="rotate(45 135 135)" />
                <circle cx="100" cy="100" r="22" fill="var(--coral-deep)" />
              </svg>
            )}
            <svg className="hero__heart-deco" style={{ top: 16, left: 20 }} width="26" height="26" viewBox="0 0 24 24" fill="var(--coral)">
              <path d="M12 21s-7-4.6-9.6-9C.6 8.5 2 4.5 6 4c2.2-.3 3.7 1 4.8 2.6C11.9 5 13.4 3.7 15.6 4c4 .5 5.4 4.5 3.6 8-2.6 4.4-9.6 9-9.6 9z" />
            </svg>
            <svg className="hero__heart-deco" style={{ bottom: 24, right: 20 }} width="34" height="34" viewBox="0 0 24 24" fill="var(--blush)">
              <path d="M12 21s-7-4.6-9.6-9C.6 8.5 2 4.5 6 4c2.2-.3 3.7 1 4.8 2.6C11.9 5 13.4 3.7 15.6 4c4 .5 5.4 4.5 3.6 8-2.6 4.4-9.6 9-9.6 9z" />
            </svg>
          </div>

          {hero.phoneImage && (
            <div className="hero__second-card">
              <img src={hero.phoneImage} alt="" className="hero__second-card-image" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}