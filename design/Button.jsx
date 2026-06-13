import React from "react";

const css = `
.om-avatar{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;
  border-radius:var(--radius-full);overflow:hidden;font-family:var(--font-display);
  font-weight:var(--weight-medium);color:var(--text-strong);background:var(--bg-sunken);
  border:1px solid var(--border-subtle);position:relative;user-select:none}
.om-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.om-avatar--xs{width:24px;height:24px;font-size:10px}
.om-avatar--sm{width:30px;height:30px;font-size:12px}
.om-avatar--md{width:38px;height:38px;font-size:14px}
.om-avatar--lg{width:48px;height:48px;font-size:17px}
.om-avatar--agent{background:var(--stone-900);border-color:var(--signal-600);
  box-shadow:0 0 0 2px color-mix(in oklch,var(--signal-500) 35%,transparent)}
.om-avatar__status{position:absolute;right:-1px;bottom:-1px;width:30%;height:30%;
  min-width:8px;min-height:8px;border-radius:50%;border:2px solid var(--surface);background:var(--success)}
`;

if (typeof document !== "undefined" && !document.getElementById("om-avatar-css")) {
  const s = document.createElement("style");
  s.id = "om-avatar-css";
  s.textContent = css;
  document.head.appendChild(s);
}

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] || "").join("").toUpperCase();
}

export function Avatar({ name = "", src, size = "md", agent = false, status = false, className = "", ...rest }) {
  const cls = ["om-avatar", `om-avatar--${size}`, agent ? "om-avatar--agent" : "", className]
    .filter(Boolean).join(" ");
  return (
    <span className={cls} title={agent ? "omnara" : name} {...rest}>
      {agent ? (
        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='10.4' stroke='%23FAF8F3' stroke-width='3.2'/><circle cx='16' cy='16' r='2.6' fill='%23FAF8F3'/><circle cx='23.5' cy='8.5' r='3.6' fill='%232FC97A'/></svg>" alt="omnara" />
      ) : src ? (
        <img src={src} alt={name} />
      ) : (
        <span>{initials(name)}</span>
      )}
      {status && <span className="om-avatar__status" aria-hidden="true" />}
    </span>
  );
}
