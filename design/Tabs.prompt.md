import React from "react";

const css = `
.om-switch{display:inline-flex;align-items:center;gap:var(--space-3);cursor:pointer;
  font-family:var(--font-sans);font-size:var(--text-base);color:var(--text-body);user-select:none}
.om-switch input{position:absolute;opacity:0;width:0;height:0}
.om-switch__track{position:relative;flex:0 0 auto;width:38px;height:22px;border-radius:var(--radius-full);
  background:var(--stone-300);transition:background var(--duration-fast) var(--ease-standard)}
.om-switch__thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;
  background:#fff;box-shadow:var(--shadow-xs);transition:transform var(--duration-fast) var(--ease-out)}
.om-switch input:checked + .om-switch__track{background:var(--accent)}
.om-switch input:checked + .om-switch__track .om-switch__thumb{transform:translateX(16px)}
.om-switch input:focus-visible + .om-switch__track{box-shadow:var(--shadow-focus)}
.om-switch--disabled{opacity:.5;cursor:not-allowed}
.om-switch__label-text{display:flex;flex-direction:column;gap:1px}
.om-switch__sub{font:var(--type-caption);color:var(--text-muted)}
`;

if (typeof document !== "undefined" && !document.getElementById("om-switch-css")) {
  const s = document.createElement("style");
  s.id = "om-switch-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Switch({ label, description, checked, defaultChecked, disabled = false, className = "", ...rest }) {
  return (
    <label className={["om-switch", disabled ? "om-switch--disabled" : "", className].filter(Boolean).join(" ")}>
      <input type="checkbox" role="switch" checked={checked} defaultChecked={defaultChecked}
        disabled={disabled} {...rest} />
      <span className="om-switch__track"><span className="om-switch__thumb" /></span>
      {(label || description) && (
        <span className="om-switch__label-text">
          {label}
          {description && <span className="om-switch__sub">{description}</span>}
        </span>
      )}
    </label>
  );
}
