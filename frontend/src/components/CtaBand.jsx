import React from "react";
import { Link } from "react-router-dom";

export default function CtaBand() {
  return (
    <div className="ctaband-wrap">
      <div className="ctaband">
        <span className="ctaband__msg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--coral-deep)">
            <path d="M12 21s-7-4.6-9.6-9C.6 8.5 2 4.5 6 4c2.2-.3 3.7 1 4.8 2.6C11.9 5 13.4 3.7 15.6 4c4 .5 5.4 4.5 3.6 8-2.6 4.4-9.6 9-9.6 9z" />
          </svg>
          Хамтдаа сайхан мэдрэмж бэлэглэе
        </span>
        <Link to="/shop" className="btn btn--solid">Захиалах</Link>
      </div>
    </div>
  );
}