import React, { useEffect, useState } from "react";
import { contentAdminApi } from "../../api";

const ICON_OPTIONS = [
  { value: "delivery", label: "Зүрх (хүргэлт)" },
  { value: "custom", label: "Тууз (захиалгаар)" },
  { value: "card", label: "Ном (карт)" },
  { value: "urgent", label: "Цаг (яаралтай)" },
];

const emptyNavItem = { label: "", path: "" };
const emptyService = { title: "", desc: "", icon: "delivery", link: "" };
const emptyColumn = { title: "", items: [{ label: "", url: "" }] };

export default function AdminContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const load = () => {
    setLoading(true);
    contentAdminApi.getContent().then(setContent).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  /* ---------- Hero ---------- */
  const updateHeroField = (field, value) =>
    setContent({ ...content, hero: { ...content.hero, [field]: value } });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploadingImage(true);
    try {
      const updated = await contentAdminApi.uploadHeroImage(file);
      setContent(updated);
      flash("Зураг шинэчлэгдлээ");
    } catch (err) {
      setImageError(err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleImageRemove = async () => {
    setUploadingImage(true);
    try {
      const updated = await contentAdminApi.removeHeroImage();
      setContent(updated);
      flash("Анхны зурагт буцлаа");
    } finally {
      setUploadingImage(false);
    }
  };

  const [uploadingPhoneImage, setUploadingPhoneImage] = useState(false);
  const [phoneImageError, setPhoneImageError] = useState("");

  const handlePhoneImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoneImageError("");
    setUploadingPhoneImage(true);
    try {
      const updated = await contentAdminApi.uploadHeroPhoneImage(file);
      setContent(updated);
      flash("Утасны зураг шинэчлэгдлээ");
    } catch (err) {
      setPhoneImageError(err.message);
    } finally {
      setUploadingPhoneImage(false);
      e.target.value = "";
    }
  };

  const handlePhoneImageRemove = async () => {
    setUploadingPhoneImage(true);
    try {
      const updated = await contentAdminApi.removeHeroPhoneImage();
      setContent(updated);
      flash("Анхны утасны загварт буцлаа");
    } finally {
      setUploadingPhoneImage(false);
    }
  };

  const saveHero = async () => {
    setSavingSection("hero");
    try {
      await contentAdminApi.updateHero(content.hero);
      flash("Нүүр хуудасны гарчиг хадгалагдлаа");
    } finally {
      setSavingSection("");
    }
  };

  /* ---------- Nav ---------- */
  const updateNavItem = (idx, field, value) => {
    const nav = content.nav.slice();
    nav[idx] = { ...nav[idx], [field]: value };
    setContent({ ...content, nav });
  };
  const addNavItem = () => setContent({ ...content, nav: [...content.nav, { ...emptyNavItem }] });
  const removeNavItem = (idx) =>
    setContent({ ...content, nav: content.nav.filter((_, i) => i !== idx) });

  const saveNav = async () => {
    setSavingSection("nav");
    try {
      await contentAdminApi.updateNav(content.nav);
      flash("Цэс хадгалагдлаа");
    } finally {
      setSavingSection("");
    }
  };

  /* ---------- Services ---------- */
  const updateService = (idx, field, value) => {
    const services = content.services.slice();
    services[idx] = { ...services[idx], [field]: value };
    setContent({ ...content, services });
  };
  const addService = () =>
    setContent({ ...content, services: [...content.services, { ...emptyService }] });
  const removeService = (idx) =>
    setContent({ ...content, services: content.services.filter((_, i) => i !== idx) });

  const saveServices = async () => {
    setSavingSection("services");
    try {
      await contentAdminApi.updateServices(content.services);
      flash("Үйлчилгээ хадгалагдлаа");
    } finally {
      setSavingSection("");
    }
  };

  /* ---------- Footer ---------- */
  const updateFooterField = (field, value) =>
    setContent({ ...content, footer: { ...content.footer, [field]: value } });

  const updateColumn = (idx, field, value) => {
    const columns = content.footer.columns.slice();
    columns[idx] = { ...columns[idx], [field]: value };
    updateFooterField("columns", columns);
  };
  const addColumn = () =>
    updateFooterField("columns", [...content.footer.columns, { ...emptyColumn }]);
  const removeColumn = (idx) =>
    updateFooterField("columns", content.footer.columns.filter((_, i) => i !== idx));

  const updateColumnItem = (colIdx, itemIdx, field, value) => {
    const columns = content.footer.columns.slice();
    const items = columns[colIdx].items.slice();
    const current = typeof items[itemIdx] === "string"
      ? { label: items[itemIdx], url: "" }
      : items[itemIdx];
    items[itemIdx] = { ...current, [field]: value };
    columns[colIdx] = { ...columns[colIdx], items };
    updateFooterField("columns", columns);
  };
  const addColumnItem = (colIdx) => {
    const columns = content.footer.columns.slice();
    columns[colIdx] = {
      ...columns[colIdx],
      items: [...columns[colIdx].items, { label: "", url: "" }],
    };
    updateFooterField("columns", columns);
  };
  const removeColumnItem = (colIdx, itemIdx) => {
    const columns = content.footer.columns.slice();
    columns[colIdx] = {
      ...columns[colIdx],
      items: columns[colIdx].items.filter((_, i) => i !== itemIdx),
    };
    updateFooterField("columns", columns);
  };

  const saveFooter = async () => {
    setSavingSection("footer");
    try {
      await contentAdminApi.updateFooter(content.footer);
      flash("Footer хадгалагдлаа");
    } finally {
      setSavingSection("");
    }
  };

  if (loading || !content) return <p className="empty-state">Ачааллаж байна...</p>;

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Сайтын контент</h1>
        {message && <span className="content-flash">{message}</span>}
      </div>

      {/* ---------- Hero ---------- */}
      <section className="content-block">
        <h2 className="content-block__title">Нүүр хуудасны гарчиг (Hero)</h2>
        <p className="content-block__hint">
          Гарчигт мөр шинээр эхлүүлэхийг хүсвэл шинэ мөрөнд бичнэ үү.
        </p>

        <div className="hero-image-editor">
          <div className="hero-image-editor__preview">
            {content.hero.image ? (
              <img src={content.hero.image} alt="Hero зураг" />
            ) : (
              <span className="hero-image-editor__placeholder">Зураг байхгүй — өнөөгийн зурган чимэглэл ашиглагдана</span>
            )}
          </div>
          <div className="hero-image-editor__actions">
            <label className="btn btn--outline-dark hero-image-editor__upload-btn">
              {uploadingImage ? "Хуулж байна..." : "Зураг сонгох"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                hidden
              />
            </label>
            {content.hero.image && (
              <button
                type="button"
                className="btn btn--outline-dark"
                onClick={handleImageRemove}
                disabled={uploadingImage}
              >
                Зураг устгах
              </button>
            )}
          </div>
          {imageError && <p className="form-error">{imageError}</p>}
        </div>

        <div className="hero-image-editor">
          <div className="hero-image-editor__preview hero-image-editor__preview--second">
            {content.hero.phoneImage ? (
              <img src={content.hero.phoneImage} alt="Хоёр дахь зураг" />
            ) : (
              <span className="hero-image-editor__placeholder">Одоогоор нэмэлт зураггүй — зөвхөн эхний карт харагдана</span>
            )}
          </div>
          <div className="hero-image-editor__actions">
            <p className="content-block__hint" style={{ margin: 0 }}>
              Хоёр дахь зураг (эхний зурагтай ижил хэмжээгээр, түүний ард давхарлагдана)
            </p>
            <label className="btn btn--outline-dark hero-image-editor__upload-btn">
              {uploadingPhoneImage ? "Хуулж байна..." : "Зураг сонгох"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoneImageUpload}
                disabled={uploadingPhoneImage}
                hidden
              />
            </label>
            {content.hero.phoneImage && (
              <button
                type="button"
                className="btn btn--outline-dark"
                onClick={handlePhoneImageRemove}
                disabled={uploadingPhoneImage}
              >
                Зураг устгах
              </button>
            )}
          </div>
          {phoneImageError && <p className="form-error">{phoneImageError}</p>}
        </div>

        <div className="admin-form__grid">
          <label style={{ gridColumn: "1 / -1" }}>
            Гарчиг
            <textarea
              value={content.hero.title}
              onChange={(e) => updateHeroField("title", e.target.value)}
              rows={2}
            />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Тайлбар өгүүлбэр
            <textarea
              value={content.hero.subtitle}
              onChange={(e) => updateHeroField("subtitle", e.target.value)}
            />
          </label>
          <label>
            Үндсэн товчны бичвэр
            <input
              value={content.hero.primaryButtonLabel}
              onChange={(e) => updateHeroField("primaryButtonLabel", e.target.value)}
            />
          </label>
          <label>
            Хоёрдогч товчны бичвэр
            <input
              value={content.hero.secondaryButtonLabel}
              onChange={(e) => updateHeroField("secondaryButtonLabel", e.target.value)}
            />
          </label>
        </div>
        <div className="content-block__actions">
          <button className="btn btn--solid" onClick={saveHero} disabled={savingSection === "hero"}>
            {savingSection === "hero" ? "Хадгалж байна..." : "Hero хадгалах"}
          </button>
        </div>
      </section>

      {/* ---------- Menu ---------- */}
      <section className="content-block">
        <h2 className="content-block__title">Дээд цэс (menu)</h2>
        <p className="content-block__hint">
          "Цэцгүүд" цэс автоматаар ангиллын dropdown болдог тул энд тохируулах шаардлагагүй.
        </p>
        {content.nav.map((item, idx) => (
          <div className="content-row" key={idx}>
            <input
              placeholder="Нэр (жишээ: Нүүр)"
              value={item.label}
              onChange={(e) => updateNavItem(idx, "label", e.target.value)}
            />
            <input
              placeholder="Зам (жишээ: / эсвэл /#steps)"
              value={item.path}
              onChange={(e) => updateNavItem(idx, "path", e.target.value)}
            />
            <button type="button" onClick={() => removeNavItem(idx)}>✕</button>
          </div>
        ))}
        <button type="button" className="admin-order-items__add" onClick={addNavItem}>
          + Мөр нэмэх
        </button>
        <div className="content-block__actions">
          <button className="btn btn--solid" onClick={saveNav} disabled={savingSection === "nav"}>
            {savingSection === "nav" ? "Хадгалж байна..." : "Цэс хадгалах"}
          </button>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="content-block">
        <h2 className="content-block__title">"Бид юу хийдэг вэ?" хэсэг</h2>
        {content.services.map((s, idx) => (
          <div className="content-service-row" key={idx}>
            <select value={s.icon} onChange={(e) => updateService(idx, "icon", e.target.value)}>
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              placeholder="Гарчиг"
              value={s.title}
              onChange={(e) => updateService(idx, "title", e.target.value)}
            />
            <input
              placeholder="Тайлбар"
              value={s.desc}
              onChange={(e) => updateService(idx, "desc", e.target.value)}
            />
            <input
              placeholder="Холбоос (жишээ: /shop, заавал биш)"
              value={s.link || ""}
              onChange={(e) => updateService(idx, "link", e.target.value)}
            />
            <button type="button" onClick={() => removeService(idx)}>✕</button>
          </div>
        ))}
        <button type="button" className="admin-order-items__add" onClick={addService}>
          + Үйлчилгээ нэмэх
        </button>
        <div className="content-block__actions">
          <button className="btn btn--solid" onClick={saveServices} disabled={savingSection === "services"}>
            {savingSection === "services" ? "Хадгалж байна..." : "Үйлчилгээ хадгалах"}
          </button>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <section className="content-block">
        <h2 className="content-block__title">Footer</h2>
        <div className="admin-form__grid">
          <label>
            Уриа (tagline)
            <input
              value={content.footer.tagline}
              onChange={(e) => updateFooterField("tagline", e.target.value)}
            />
          </label>
          <label>
            Утас
            <input
              value={content.footer.phone}
              onChange={(e) => updateFooterField("phone", e.target.value)}
            />
          </label>
          <label>
            Имэйл
            <input
              value={content.footer.email}
              onChange={(e) => updateFooterField("email", e.target.value)}
            />
          </label>
          <label>
            Хаяг
            <input
              value={content.footer.address}
              onChange={(e) => updateFooterField("address", e.target.value)}
            />
          </label>
        </div>

        <p className="content-block__hint" style={{ marginTop: 20 }}>Footer-ийн баганууд</p>
        {content.footer.columns.map((col, colIdx) => (
          <div className="content-column" key={colIdx}>
            <div className="content-row">
              <input
                placeholder="Баганы гарчиг"
                value={col.title}
                onChange={(e) => updateColumn(colIdx, "title", e.target.value)}
              />
              <button type="button" onClick={() => removeColumn(colIdx)}>Багана устгах</button>
            </div>
            {col.items.map((item, itemIdx) => {
              const normalized = typeof item === "string" ? { label: item, url: "" } : item;
              return (
                <div className="content-row content-row--item" key={itemIdx}>
                  <input
                    placeholder="Мөрийн нэр"
                    value={normalized.label}
                    onChange={(e) => updateColumnItem(colIdx, itemIdx, "label", e.target.value)}
                  />
                  <input
                    placeholder="Холбоос (жишээ: /shop, заавал биш)"
                    value={normalized.url}
                    onChange={(e) => updateColumnItem(colIdx, itemIdx, "url", e.target.value)}
                  />
                  <button type="button" onClick={() => removeColumnItem(colIdx, itemIdx)}>✕</button>
                </div>
              );
            })}
            <button
              type="button"
              className="admin-order-items__add"
              onClick={() => addColumnItem(colIdx)}
            >
              + Мөр нэмэх
            </button>
          </div>
        ))}
        <button type="button" className="admin-order-items__add" onClick={addColumn}>
          + Багана нэмэх
        </button>

        <div className="content-block__actions">
          <button className="btn btn--solid" onClick={saveFooter} disabled={savingSection === "footer"}>
            {savingSection === "footer" ? "Хадгалж байна..." : "Footer хадгалах"}
          </button>
        </div>
      </section>
    </div>
  );
}