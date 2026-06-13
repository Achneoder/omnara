import React from "react";

const css = `
.om-toast{display:flex;align-items:flex-start;gap:var(--space-3);width:360px;max-width:90vw;
  background:var(--surface);border:1px solid var(--border-subtle);border-left:3px solid var(--border-strong);
  border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);padding:var(--space-4);
  font-family:var(--font-sans);animation:om-toast-in var(--duration-base) var(--ease-out)}
.om-toast__icon{flex:0 0 auto;width:20px;height:20px;display:flex;align-items:center;justify-content:center;margin-top:1px}
.om-toast__icon svg{width:20px;height:20px}
.om-toast__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.om-toast__title{font:var(--type-title);color:var(--text-strong)}
.om-toast__msg{font:var(--type-body-sm);color:var(--text-muted)}
.om-toast__x{flex:0 0 auto;border:none;background:transparent;color:var(--text-faint);cursor:pointer;
  width:24px;height:24px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center}
.om-toast__x:hover{background:var(--bg-subtle);color:var(--text-body)}
.om-toast__x svg{width:15px;height:15px}
.om-toast--success{border-left-color:var(--success)}.om-toast--success .om-toast__icon{color:var(--success)}
.om-toast--ai{border-left-color:var(--ai)}.om-toast--ai .om-toast__icon{color:var(--ai-text)}
.om-toast--danger{border-left-color:var(--danger)}.om-toast--danger .om-toast__icon{color:var(--danger)}
.om-toast--info{border-left-color:var(--info)}.om-toast--info .om-toast__icon{color:var(--info)}
@keyframes om-toast-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("om-toast-css")) {
  const s = document.createElement("style");
  s.id = "om-toast-css";
  s.textContent = css;
  document.head.appendChild(s);
}

const ICONS = {
  success: "M3 8.5l3.5 3.5L13 4.5",
  info: null,
  danger: null,
  ai: null,
};

export function Toast({ variant = "info", title, children, icon, onClose }) {
  const cls = ["om-toast", `om-toast--${variant}`].join(" ");
  const fallback =
    variant === "success" ? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"><path d={ICONS.success} /></svg>
    ) : null;
  return (
    <div className={cls} role="status">
      {(icon || fallback) && <span className="om-toast__icon">{icon || fallback}</span>}
      <div className="om-toast__body">
        {title && <span className="om-toast__title">{title}</span>}
        {children && <span className="om-toast__msg">{children}</span>}
      </div>
      {onClose && (
        <button className="om-toast__x" aria-label="Dismiss" onClick={onClose}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      )}
    </div>
  );
}
