import React from "react";

const css = `
.om-iconbtn{display:inline-flex;align-items:center;justify-content:center;
  border-radius:var(--radius-md);border:1px solid transparent;cursor:pointer;color:var(--text-body);
  background:transparent;transition:var(--transition-colors),box-shadow var(--duration-fast) var(--ease-standard)}
.om-iconbtn:focus-visible{outline:none;box-shadow:var(--shadow-focus)}
.om-iconbtn[disabled],.om-iconbtn[aria-disabled="true"]{opacity:.45;pointer-events:none}
.om-iconbtn svg{width:1.15em;height:1.15em}
.om-iconbtn--sm{width:30px;height:30px;font-size:16px}
.om-iconbtn--md{width:38px;height:38px;font-size:18px}
.om-iconbtn--lg{width:44px;height:44px;font-size:20px}
.om-iconbtn--ghost:hover{background:var(--bg-subtle);color:var(--text-strong)}
.om-iconbtn--outline{border-color:var(--border-default);background:var(--surface)}
.om-iconbtn--outline:hover{background:var(--bg-subtle);border-color:var(--border-strong)}
.om-iconbtn--solid{background:var(--accent);color:var(--text-on-accent)}
.om-iconbtn--solid:hover{background:var(--accent-hover)}
`;

if (typeof document !== "undefined" && !document.getElementById("om-iconbtn-css")) {
  const s = document.createElement("style");
  s.id = "om-iconbtn-css";
  s.textContent = css;
  document.head.appendChild(s);
}

export function IconButton({
  variant = "ghost",
  size = "md",
  label,
  className = "",
  children,
  ...rest
}) {
  const cls = ["om-iconbtn", `om-iconbtn--${variant}`, `om-iconbtn--${size}`, className]
    .filter(Boolean).join(" ");
  return (
    <button className={cls} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
