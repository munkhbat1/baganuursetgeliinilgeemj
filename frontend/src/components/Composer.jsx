import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FLOWERS = [
  { name: "Наран цэцэг", color: "var(--gold)" },
  { name: "Улаан сарнай", color: "var(--coral)" },
  { name: "Цасан дэлбээ", color: "var(--blush)" },
  { name: "Ногоон навч", color: "var(--sage)" },
];

export default function Composer() {
  const [flower, setFlower] = useState(FLOWERS[0]);
  const [message, setMessage] = useState(
    "Төрсөн өдрийн мэнд хүргэе! Чам шиг найзтай байгаадаа баяртай байдаг."
  );
  const [from, setFrom] = useState("Сараа");
  const [to, setTo] = useState("Болд");
  const navigate = useNavigate();

  const handleContinue = () => {
    const note = `${message}\n\n— ${from || "Танаас"}, ${to || "найздаа"}-д`;
    try {
      localStorage.setItem("astra_composed_note", note);
    } catch {
      // localStorage may be unavailable in some environments — composer still works visually
    }
    navigate("/shop");
  };

  return (
    <section className="composer" id="composer">
      <div className="composer__head">
        <span className="hero__eyebrow">Өөрөө туршиж үз</span>
        <h2 className="section__title">Мэндчилгээгээ энд бичээрэй</h2>
        <p>Цэцгээ сонгоод, дэд талд бодит цаг дээр хэрхэн харагдахыг шууд харна.</p>
      </div>

      <div className="composer__grid">
        <div>
          <label className="field-label">Цэцэг сонгох</label>
          <div className="flower-picker">
            {FLOWERS.map((f) => (
              <button
                type="button"
                key={f.name}
                className={`fchip ${flower.name === f.name ? "is-active" : ""}`}
                onClick={() => setFlower(f)}
              >
                <span className="fchip__dot" style={{ background: f.color }} />
                {f.name}
              </button>
            ))}
          </div>

          <label className="field-label composer__label-spaced">Мэндчилгээний бичвэр</label>
          <textarea
            maxLength={140}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Жишээ нь: Төрсөн өдрийн мэнд хүргэе!"
          />

          <div className="composer__name-row">
            <input placeholder="Хэнээс" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input placeholder="Хэнд" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <button className="btn btn--solid composer__cta" onClick={handleContinue}>
            Энэ мэндчилгээгээр захиалга эхлүүлэх
          </button>
        </div>

        <div className="composer__preview-stage">
          <div className="preview-card">
            <div className="preview-card__flower">
              <svg viewBox="0 0 200 200" width="150" height="150">
                <ellipse cx="100" cy="46" rx="20" ry="30" fill={flower.color} />
                <ellipse cx="100" cy="154" rx="20" ry="30" fill={flower.color} />
                <ellipse cx="46" cy="100" rx="30" ry="20" fill={flower.color} />
                <ellipse cx="154" cy="100" rx="30" ry="20" fill={flower.color} />
                <ellipse cx="65" cy="65" rx="22" ry="30" fill={flower.color} transform="rotate(45 65 65)" />
                <ellipse cx="135" cy="65" rx="22" ry="30" fill={flower.color} transform="rotate(-45 135 65)" />
                <ellipse cx="65" cy="135" rx="22" ry="30" fill={flower.color} transform="rotate(-45 65 135)" />
                <ellipse cx="135" cy="135" rx="22" ry="30" fill={flower.color} transform="rotate(45 135 135)" />
                <circle cx="100" cy="100" r="20" fill="var(--ink)" />
              </svg>
            </div>
            <p className="preview-card__text">{message}</p>
            <p className="preview-card__sign">— {from || "Танаас"}, {to || "найздаа"}-д</p>
          </div>
        </div>
      </div>
    </section>
  );
}