import React from "react";

const css = `
.om-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-sans);
  font-weight:var(--weight-medium);font-size:var(--text-xs);line-height:1;
  padding:4px 9px;border-radius:var(--radius-full);border:1px solid transparent;white-space:nowrap}
.om-badge svg{width:13px;height:13px}
.om-badge__dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:0 0 auto}
.om-badge--neutral{background:var(--bg-subtle);color:var(--text-muted);border-color:var(--border-subtle)}
.om-badge--live{background:var(--success-soft);color:var(--success)}
.om-badge--ai{background:var(--ai-soft);color:var(--ai-text)}
.om-badge--warning{background:var(--warning-soft);color:var(--warning)}
.om-badge--danger{background:var(--danger-soft);color:var(--danger)}
.om-badge--info{background:var(--info-soft);color:var(--info)}
.om-badge--solid{background:var(--accent);color:var(--text-on-accent)}
.om-badge--live .om-badge__dot{animation:om-pulse 1.8s var(--ease-in-out) infinite}
@keyframes om-pulse{0%,100%{opacity:1}50%{opacity:.4}}
`;

if (typeof document !== "undefined" && !document.getElementById("om-badge-css")) {
  const s = document.createElement("style");
  s.id = "om-badge-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Badge({ variant = "neutral", dot = false, className = "", children, ...rest }) {
  const cls = ["om-badge", `om-badge--${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {dot && <span className="om-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
