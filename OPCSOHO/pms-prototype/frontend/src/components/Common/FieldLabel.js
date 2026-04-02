import React from "react";

export default function FieldLabel({ children, required = false }) {
  return (
    <span className="field-label">
      {children}
      {required ? <em className="required-mark">*</em> : null}
    </span>
  );
}
