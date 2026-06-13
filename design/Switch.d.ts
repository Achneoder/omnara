import React from "react";

const css = `
.om-check{display:inline-flex;align-items:flex-start;gap:var(--space-3);cursor:pointer;
  font-family:var(--font-sans);font-size:var(--text-base);color:var(--text-body);user-select:none}
.om-check input{position:absolute;opacity:0;width:0;height:0}
.om-check__box{flex:0 0 auto;width:20px;height:20px;border-radius:var(--radius-sm);
  border:1.5px solid var(--border-strong);background:var(--surface);display:inline-flex;
  align-items:center;justify-content:center;color:#fff;margin-top:1px;
  transition:var(--transition-colors)}
.om-check__box svg{width:13px;height:13px;opacity:0;transform:scale(.6);
  transition:opacity var(--duration-fast),transform var(--duration-fast) var(--ease-out)}
.om-check input:checked + .om-check__box{background:var(--accent);border-color:var(--accent)}
.om-check input:checked + .om-check__box svg{opacity:1;transform:scale(1)}
.om-check input:indeterminate + .om-check__box{background:var(--accent);border-color:var(--accent)}
.om-check input:focus-visible + .om-check__box{box-shadow:var(--shadow-focus)}
.om-check--disabled{opacity:.5;cursor:not-allowed}
.om-check__sub{font:var(--type-caption);color:var(--text-muted);display:block;margin-top:1px}
`;

if (typeof document !== "undefined" && !document.getElementById("om-check-css")) {
  const s = document.createElement("style");
  s.id = "om-check-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Checkbox({ label, description, disabled = false, className = "", ...rest }) {
  return (
    <label className={["om-check", disabled ? "om-check--disabled" : "", className].filter(Boolean).join(" ")}>
      <input type="checkbox" disabled={disabled} {...rest} />
      <span className="om-check__box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.5 3.5L13 4.5" /></svg>
      </span>
      {(label || description) && (
        <span>{label}{description && <span className="om-check__sub">{description}</span>}</span>
      )}
    </label>
  );
}
