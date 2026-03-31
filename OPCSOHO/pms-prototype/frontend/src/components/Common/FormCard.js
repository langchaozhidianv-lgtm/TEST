import React from "react";

export default function FormCard({ title, subtitle, children }) {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}
