import React from "react";

const css = `
.om-tooltip-wrap{position:relative;display:inline-flex}
.om-tooltip{position:absolute;z-index:var(--z-tooltip);pointer-events:none;
  background:var(--surface-inverse);color:var(--text-on-inverse);
  font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-medium);
  line-height:1.35;padding:6px 9px;border-radius:var(--radius-sm);box-shadow:var(--shadow-md);
  white-space:nowrap;opacity:0;transform:translateY(2px);
  transition:opacity var(--duration-fast),transform var(--duration-fast) var(--ease-out)}
.om-tooltip--shown{opacity:1;transform:none}
.om-tooltip--top{bottom:calc(100% + 7px);left:50%;translate:-50% 0}
.om-tooltip--bottom{top:calc(100% + 7px);left:50%;translate:-50% 0}
.om-tooltip__kbd{font-family:var(--font-mono);opacity:.7;margin-left:6px}
`;

if (typeof document !== "undefined" && !document.getElementById("om-tooltip-css")) {
  const s = document.createElement("style");
  s.id = "om-tooltip-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function Tooltip({ label, kbd, side = "top", children }) {
  const [shown, setShown] = React.useState(false);
  return (
    <span className="om-tooltip-wrap"
      onMouseEnter={() => setShown(true)} onMouseLeave={() => setShown(false)}
      onFocus={() => setShown(true)} onBlur={() => setShown(false)}>
      {children}
      <span className={["om-tooltip", `om-tooltip--${side}`, shown ? "om-tooltip--shown" : ""].join(" ")}
        role="tooltip">
        {label}{kbd && <span className="om-tooltip__kbd">{kbd}</span>}
      </span>
    </span>
  );
}
