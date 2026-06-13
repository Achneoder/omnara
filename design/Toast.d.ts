import React from "react";

const css = `
.om-tag{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);
  font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1;
  padding:4px 8px;border-radius:var(--radius-xs);
  background:var(--surface-inset);color:var(--text-body);border:1px solid var(--border-subtle)}
.om-tag svg{width:13px;height:13px}
.om-tag--accent{background:var(--accent-soft);color:var(--accent-soft-text);border-color:transparent}
.om-tag--removable{padding-right:5px}
.om-tag__x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;
  border:none;background:transparent;color:inherit;cursor:pointer;border-radius:var(--radius-xs);opacity:.6}
.om-tag__x:hover{opacity:1;background:color-mix(in oklch,currentColor 14%,transparent)}
`;

if (typeof document !== "undefined" && !document.getElementById("om-tag-css")) {
  const s = document.createElement("style");
  s.id = "om-tag-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Tag({ variant = "default", icon, onRemove, className = "", children, ...rest }) {
  const cls = ["om-tag", `om-tag--${variant}`, onRemove ? "om-tag--removable" : "", className]
    .filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {icon}
      {children}
      {onRemove && (
        <button type="button" className="om-tag__x" aria-label="Remove" onClick={onRemove}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      )}
    </span>
  );
}
