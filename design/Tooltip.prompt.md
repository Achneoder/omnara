import React from "react";

const css = `
.om-dialog__scrim{position:fixed;inset:0;z-index:var(--z-modal);
  background:color-mix(in oklch,var(--stone-950) 45%,transparent);
  backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:var(--space-6);
  animation:om-fade var(--duration-base) var(--ease-out)}
.om-dialog{background:var(--surface);border:1px solid var(--border-subtle);
  border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);width:100%;max-width:480px;
  max-height:88vh;display:flex;flex-direction:column;overflow:hidden;
  animation:om-pop var(--duration-base) var(--ease-out)}
.om-dialog--lg{max-width:680px}
.om-dialog__head{display:flex;align-items:flex-start;gap:var(--space-3);
  padding:var(--space-6) var(--space-6) var(--space-4)}
.om-dialog__icon{flex:0 0 auto;width:38px;height:38px;border-radius:var(--radius-md);
  display:flex;align-items:center;justify-content:center;background:var(--accent-soft);color:var(--accent-soft-text)}
.om-dialog__icon svg{width:20px;height:20px}
.om-dialog__titles{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.om-dialog__title{font:var(--type-h3);color:var(--text-strong)}
.om-dialog__desc{font:var(--type-body-sm);color:var(--text-muted)}
.om-dialog__x{flex:0 0 auto;border:none;background:transparent;color:var(--text-muted);
  cursor:pointer;width:30px;height:30px;border-radius:var(--radius-sm);display:flex;
  align-items:center;justify-content:center}
.om-dialog__x:hover{background:var(--bg-subtle);color:var(--text-strong)}
.om-dialog__x svg{width:18px;height:18px}
.om-dialog__body{padding:0 var(--space-6) var(--space-5);overflow:auto;font:var(--type-body);color:var(--text-body)}
.om-dialog__foot{display:flex;justify-content:flex-end;gap:var(--space-3);
  padding:var(--space-4) var(--space-6);border-top:1px solid var(--border-subtle);background:var(--bg-subtle)}
@keyframes om-fade{from{opacity:0}to{opacity:1}}
@keyframes om-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
`;

if (typeof document !== "undefined" && !document.getElementById("om-dialog-css")) {
  const s = document.createElement("style");
  s.id = "om-dialog-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Dialog({ open = true, title, description, icon, size = "md", footer, onClose, children }) {
  if (!open) return null;
  return (
    <div className="om-dialog__scrim" onClick={onClose} role="presentation">
      <div className={["om-dialog", size === "lg" ? "om-dialog--lg" : ""].filter(Boolean).join(" ")}
        role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}>
        <div className="om-dialog__head">
          {icon && <span className="om-dialog__icon">{icon}</span>}
          <div className="om-dialog__titles">
            {title && <h2 className="om-dialog__title">{title}</h2>}
            {description && <p className="om-dialog__desc">{description}</p>}
          </div>
          {onClose && (
            <button className="om-dialog__x" aria-label="Close" onClick={onClose}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            </button>
          )}
        </div>
        {children && <div className="om-dialog__body">{children}</div>}
        {footer && <div className="om-dialog__foot">{footer}</div>}
      </div>
    </div>
  );
}
