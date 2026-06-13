import React from "react";

const css = `
.om-card{background:var(--surface);border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);color:var(--text-body);
  transition:border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),transform var(--duration-fast) var(--ease-out)}
.om-card--flat{box-shadow:none}
.om-card--raised{box-shadow:var(--shadow-sm)}
.om-card--pad-sm{padding:var(--space-4)}
.om-card--pad-md{padding:var(--space-6)}
.om-card--pad-lg{padding:var(--space-7)}
.om-card--interactive{cursor:pointer}
.om-card--interactive:hover{border-color:var(--border-strong);box-shadow:var(--shadow-md)}
.om-card--interactive:active{transform:translateY(1px)}
.om-card--selected{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.om-card__header{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)}
.om-card__title{font:var(--type-title);color:var(--text-strong);margin:0}
.om-card__body{font:var(--type-body-sm);color:var(--text-muted)}
`;

if (typeof document !== "undefined" && !document.getElementById("om-card-css")) {
  const s = document.createElement("style");
  s.id = "om-card-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Card({
  elevation = "flat",
  padding = "md",
  interactive = false,
  selected = false,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "om-card",
    `om-card--${elevation}`,
    `om-card--pad-${padding}`,
    interactive ? "om-card--interactive" : "",
    selected ? "om-card--selected" : "",
    className,
  ].filter(Boolean).join(" ");
  return <div className={cls} {...rest}>{children}</div>;
}

export function CardHeader({ title, action, icon, className = "", children, ...rest }) {
  return (
    <div className={["om-card__header", className].filter(Boolean).join(" ")} {...rest}>
      {icon}
      {title && <h3 className="om-card__title">{title}</h3>}
      {children}
      {action && <span style={{ marginLeft: "auto" }}>{action}</span>}
    </div>
  );
}
