import React from "react";

const css = `
.om-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);
  font-family:var(--font-sans);font-weight:var(--weight-medium);line-height:1;
  border-radius:var(--radius-md);border:1px solid transparent;cursor:pointer;
  transition:var(--transition-colors),box-shadow var(--duration-fast) var(--ease-standard);
  white-space:nowrap;user-select:none;text-decoration:none;position:relative}
.om-btn:focus-visible{outline:none;box-shadow:var(--shadow-focus)}
.om-btn[disabled],.om-btn[aria-disabled="true"]{opacity:.45;pointer-events:none}
.om-btn svg{width:1.15em;height:1.15em;flex:0 0 auto}
.om-btn--sm{font-size:var(--text-sm);padding:0 12px;height:32px}
.om-btn--md{font-size:var(--text-base);padding:0 16px;height:40px}
.om-btn--lg{font-size:var(--text-md);padding:0 22px;height:48px}
.om-btn--primary{background:var(--accent);color:var(--text-on-accent)}
.om-btn--primary:hover{background:var(--accent-hover)}
.om-btn--primary:active{background:var(--accent-press)}
.om-btn--secondary{background:var(--surface);color:var(--text-strong);border-color:var(--border-default)}
.om-btn--secondary:hover{background:var(--bg-subtle);border-color:var(--border-strong)}
.om-btn--ghost{background:transparent;color:var(--text-body)}
.om-btn--ghost:hover{background:var(--bg-subtle)}
.om-btn--danger{background:var(--danger);color:#fff}
.om-btn--danger:hover{background:var(--danger-hover)}
.om-btn--block{width:100%}
.om-btn--loading .om-btn__label,.om-btn--loading svg{visibility:hidden}
.om-btn__spin{position:absolute;width:1.1em;height:1.1em;border:2px solid currentColor;
  border-right-color:transparent;border-radius:50%;animation:om-spin .6s linear infinite}
@keyframes om-spin{to{transform:rotate(360deg)}}
`;

if (typeof document !== "undefined" && !document.getElementById("om-button-css")) {
  const s = document.createElement("style");
  s.id = "om-button-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  as = "button",
  className = "",
  children,
  ...rest
}) {
  const Tag = as;
  const cls = [
    "om-btn",
    `om-btn--${variant}`,
    `om-btn--${size}`,
    fullWidth ? "om-btn--block" : "",
    loading ? "om-btn--loading" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <Tag
      className={cls}
      disabled={Tag === "button" ? disabled || loading : undefined}
      aria-disabled={disabled || loading || undefined}
      {...rest}
    >
      {loading && <span className="om-btn__spin" aria-hidden="true" />}
      {iconLeft}
      <span className="om-btn__label">{children}</span>
      {iconRight}
    </Tag>
  );
}
