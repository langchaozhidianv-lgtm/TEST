import React from "react";

export default function ActionButton({ children, variant = "secondary", ...rest }) {
  return <button className={`btn btn-${variant}`} {...rest}>{children}</button>;
}
