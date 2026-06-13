/* @ds-bundle: {"format":3,"namespace":"OmnaraDesignSystem_c73439","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"7e575f7aa385","components/core/Badge.jsx":"f0255eb983f5","components/core/Button.jsx":"65eda9aabd24","components/core/Card.jsx":"36d28c098587","components/core/IconButton.jsx":"0ccc7e920808","components/core/Tag.jsx":"ade590751be6","components/feedback/Dialog.jsx":"568ef504258e","components/feedback/Toast.jsx":"e2005adaa29a","components/feedback/Tooltip.jsx":"e4cdddebf4b1","components/forms/Checkbox.jsx":"9ac7466cab81","components/forms/Input.jsx":"1f0cba4ce905","components/forms/Select.jsx":"ba16ed7f11e8","components/forms/Switch.jsx":"66db39ad2e75","components/forms/Textarea.jsx":"f96b567c06ef","components/navigation/Tabs.jsx":"456a38a2a771","ui_kits/dashboard/screens.jsx":"3ea722d9b04a","ui_kits/dashboard/shell.jsx":"2df4a08e277d","ui_kits/mcp-client/parts.jsx":"45fe46817344"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OmnaraDesignSystem_c73439 = window.OmnaraDesignSystem_c73439 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase();
}
function Avatar({
  name = "",
  src,
  size = "md",
  agent = false,
  status = false,
  className = "",
  ...rest
}) {
  const cls = ["om-avatar", `om-avatar--${size}`, agent ? "om-avatar--agent" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    title: agent ? "omnara" : name
  }, rest), agent ? /*#__PURE__*/React.createElement("img", {
    src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'><circle cx='16' cy='16' r='10.4' stroke='%23FAF8F3' stroke-width='3.2'/><circle cx='16' cy='16' r='2.6' fill='%23FAF8F3'/><circle cx='23.5' cy='8.5' r='3.6' fill='%232FC97A'/></svg>",
    alt: "omnara"
  }) : src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : /*#__PURE__*/React.createElement("span", null, initials(name)), status && /*#__PURE__*/React.createElement("span", {
    className: "om-avatar__status",
    "aria-hidden": "true"
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Badge({
  variant = "neutral",
  dot = false,
  className = "",
  children,
  ...rest
}) {
  const cls = ["om-badge", `om-badge--${variant}`, className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "om-badge__dot",
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Button({
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
  const cls = ["om-btn", `om-btn--${variant}`, `om-btn--${size}`, fullWidth ? "om-btn--block" : "", loading ? "om-btn--loading" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    disabled: Tag === "button" ? disabled || loading : undefined,
    "aria-disabled": disabled || loading || undefined
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "om-btn__spin",
    "aria-hidden": "true"
  }), iconLeft, /*#__PURE__*/React.createElement("span", {
    className: "om-btn__label"
  }, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.om-card{background:var(--surface);border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);color:var(--text-body);
  transition:border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),transform var(--duration-fast) var(--ease-out)}
.om-card--flat{box-shadow:none}
.om-card--raised{box-shadow:var(--shadow-sm)}
.om-card--pad-sm{padding:var(--space-4)}
.om-card--pad-md{padding:var(--space-6)}
.om-card--pad-lg{padding:var(--space-7)}
.om-card--interactive{cursor:pointer}
.om-card--interactive:hover{border-color:var(--border-strong);box-shadow:var(--shadow-md)}
.om-card--interactive:active{transform:translateY(1px)}
.om-card--selected{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.om-card__header{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)}
.om-card__title{font:var(--type-title);color:var(--text-strong);margin:0}
.om-card__body{font:var(--type-body-sm);color:var(--text-muted)}
`;
if (typeof document !== "undefined" && !document.getElementById("om-card-css")) {
  const s = document.createElement("style");
  s.id = "om-card-css";
  s.textContent = css;
  document.head.appendChild(s);
}
function Card({
  elevation = "flat",
  padding = "md",
  interactive = false,
  selected = false,
  className = "",
  children,
  ...rest
}) {
  const cls = ["om-card", `om-card--${elevation}`, `om-card--pad-${padding}`, interactive ? "om-card--interactive" : "", selected ? "om-card--selected" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
function CardHeader({
  title,
  action,
  icon,
  className = "",
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["om-card__header", className].filter(Boolean).join(" ")
  }, rest), icon, title && /*#__PURE__*/React.createElement("h3", {
    className: "om-card__title"
  }, title), children, action && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, action));
}
Object.assign(__ds_scope, { Card, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function IconButton({
  variant = "ghost",
  size = "md",
  label,
  className = "",
  children,
  ...rest
}) {
  const cls = ["om-iconbtn", `om-iconbtn--${variant}`, `om-iconbtn--${size}`, className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Tag({
  variant = "default",
  icon,
  onRemove,
  className = "",
  children,
  ...rest
}) {
  const cls = ["om-tag", `om-tag--${variant}`, onRemove ? "om-tag--removable" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon, children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "om-tag__x",
    "aria-label": "Remove",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
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
function Dialog({
  open = true,
  title,
  description,
  icon,
  size = "md",
  footer,
  onClose,
  children
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "om-dialog__scrim",
    onClick: onClose,
    role: "presentation"
  }, /*#__PURE__*/React.createElement("div", {
    className: ["om-dialog", size === "lg" ? "om-dialog--lg" : ""].filter(Boolean).join(" "),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": typeof title === "string" ? title : undefined,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "om-dialog__head"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "om-dialog__icon"
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "om-dialog__titles"
  }, title && /*#__PURE__*/React.createElement("h2", {
    className: "om-dialog__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "om-dialog__desc"
  }, description)), onClose && /*#__PURE__*/React.createElement("button", {
    className: "om-dialog__x",
    "aria-label": "Close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 5l10 10M15 5L5 15"
  })))), children && /*#__PURE__*/React.createElement("div", {
    className: "om-dialog__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "om-dialog__foot"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
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
  ai: null
};
function Toast({
  variant = "info",
  title,
  children,
  icon,
  onClose
}) {
  const cls = ["om-toast", `om-toast--${variant}`].join(" ");
  const fallback = variant === "success" ? /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: ICONS.success
  })) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    role: "status"
  }, (icon || fallback) && /*#__PURE__*/React.createElement("span", {
    className: "om-toast__icon"
  }, icon || fallback), /*#__PURE__*/React.createElement("div", {
    className: "om-toast__body"
  }, title && /*#__PURE__*/React.createElement("span", {
    className: "om-toast__title"
  }, title), children && /*#__PURE__*/React.createElement("span", {
    className: "om-toast__msg"
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    className: "om-toast__x",
    "aria-label": "Dismiss",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
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
function Tooltip({
  label,
  kbd,
  side = "top",
  children
}) {
  const [shown, setShown] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    className: "om-tooltip-wrap",
    onMouseEnter: () => setShown(true),
    onMouseLeave: () => setShown(false),
    onFocus: () => setShown(true),
    onBlur: () => setShown(false)
  }, children, /*#__PURE__*/React.createElement("span", {
    className: ["om-tooltip", `om-tooltip--${side}`, shown ? "om-tooltip--shown" : ""].join(" "),
    role: "tooltip"
  }, label, kbd && /*#__PURE__*/React.createElement("span", {
    className: "om-tooltip__kbd"
  }, kbd)));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Checkbox({
  label,
  description,
  disabled = false,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ["om-check", disabled ? "om-check--disabled" : "", className].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "om-check__box",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8.5l3.5 3.5L13 4.5"
  }))), (label || description) && /*#__PURE__*/React.createElement("span", null, label, description && /*#__PURE__*/React.createElement("span", {
    className: "om-check__sub"
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.om-field{display:flex;flex-direction:column;gap:6px;font-family:var(--font-sans)}
.om-field__label{font:var(--type-label);color:var(--text-strong);display:flex;gap:6px;align-items:center}
.om-field__req{color:var(--danger)}
.om-field__hint{font:var(--type-caption);color:var(--text-muted)}
.om-field__hint--error{color:var(--danger)}
.om-input{display:flex;align-items:center;gap:var(--space-2);background:var(--surface);
  border:1px solid var(--border-default);border-radius:var(--radius-md);
  transition:var(--transition-colors),box-shadow var(--duration-fast) var(--ease-standard);
  color:var(--text-strong)}
.om-input:hover{border-color:var(--border-strong)}
.om-input:focus-within{border-color:var(--border-focus);box-shadow:var(--shadow-focus)}
.om-input--sm{padding:0 10px;height:32px;font-size:var(--text-sm)}
.om-input--md{padding:0 12px;height:40px;font-size:var(--text-base)}
.om-input--lg{padding:0 14px;height:48px;font-size:var(--text-md)}
.om-input--error{border-color:var(--danger)}
.om-input--error:focus-within{box-shadow:0 0 0 3px var(--danger-soft)}
.om-input--disabled{opacity:.55;pointer-events:none;background:var(--bg-subtle)}
.om-input input{flex:1;min-width:0;border:none;outline:none;background:transparent;
  font:inherit;color:inherit;padding:0}
.om-input input::placeholder{color:var(--text-faint)}
.om-input__affix{color:var(--text-muted);display:inline-flex;align-items:center;font-size:.95em}
.om-input__affix svg{width:1.05em;height:1.05em}
.om-input__prefix{font-family:var(--font-mono);font-size:.92em;color:var(--text-muted)}
`;
if (typeof document !== "undefined" && !document.getElementById("om-input-css")) {
  const s = document.createElement("style");
  s.id = "om-input-css";
  s.textContent = css;
  document.head.appendChild(s);
}
let _id = 0;
function Input({
  label,
  hint,
  error,
  required = false,
  size = "md",
  iconLeft,
  iconRight,
  prefix,
  disabled = false,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || `om-in-${++_id}`;
  const boxCls = ["om-input", `om-input--${size}`, error ? "om-input--error" : "", disabled ? "om-input--disabled" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: ["om-field", className].filter(Boolean).join(" ")
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "om-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "om-field__req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: boxCls
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "om-input__affix"
  }, iconLeft), prefix && /*#__PURE__*/React.createElement("span", {
    className: "om-input__prefix"
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    disabled: disabled,
    "aria-invalid": !!error
  }, rest)), iconRight && /*#__PURE__*/React.createElement("span", {
    className: "om-input__affix"
  }, iconRight)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    className: ["om-field__hint", error ? "om-field__hint--error" : ""].filter(Boolean).join(" ")
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.om-select-field{display:flex;flex-direction:column;gap:6px;font-family:var(--font-sans)}
.om-select-field .om-field__label{font:var(--type-label);color:var(--text-strong)}
.om-select-field .om-field__hint{font:var(--type-caption);color:var(--text-muted)}
.om-select-wrap{position:relative;display:flex;align-items:center}
.om-select{appearance:none;width:100%;background:var(--surface);
  border:1px solid var(--border-default);border-radius:var(--radius-md);
  font:var(--type-body);color:var(--text-strong);cursor:pointer;
  transition:var(--transition-colors),box-shadow var(--duration-fast) var(--ease-standard)}
.om-select--sm{height:32px;padding:0 34px 0 10px;font-size:var(--text-sm)}
.om-select--md{height:40px;padding:0 38px 0 12px;font-size:var(--text-base)}
.om-select:hover{border-color:var(--border-strong)}
.om-select:focus{outline:none;border-color:var(--border-focus);box-shadow:var(--shadow-focus)}
.om-select[disabled]{opacity:.55;background:var(--bg-subtle);cursor:not-allowed}
.om-select-chevron{position:absolute;right:12px;pointer-events:none;color:var(--text-muted);
  display:inline-flex}
.om-select-chevron svg{width:16px;height:16px}
`;
if (typeof document !== "undefined" && !document.getElementById("om-select-css")) {
  const s = document.createElement("style");
  s.id = "om-select-css";
  s.textContent = css;
  document.head.appendChild(s);
}
let _id = 0;
function Select({
  label,
  hint,
  size = "md",
  options,
  id,
  className = "",
  children,
  ...rest
}) {
  const fieldId = id || `om-sel-${++_id}`;
  return /*#__PURE__*/React.createElement("div", {
    className: ["om-select-field", className].filter(Boolean).join(" ")
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "om-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "om-select-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    className: `om-select om-select--${size}`
  }, rest), options ? options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  }) : children), /*#__PURE__*/React.createElement("span", {
    className: "om-select-chevron",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4"
  })))), hint && /*#__PURE__*/React.createElement("span", {
    className: "om-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Switch({
  label,
  description,
  checked,
  defaultChecked,
  disabled = false,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ["om-switch", disabled ? "om-switch--disabled" : "", className].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    defaultChecked: defaultChecked,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "om-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "om-switch__thumb"
  })), (label || description) && /*#__PURE__*/React.createElement("span", {
    className: "om-switch__label-text"
  }, label, description && /*#__PURE__*/React.createElement("span", {
    className: "om-switch__sub"
  }, description)));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `
.om-textarea-field{display:flex;flex-direction:column;gap:6px;font-family:var(--font-sans)}
.om-textarea-field .om-field__label{font:var(--type-label);color:var(--text-strong);display:flex;gap:6px;align-items:center}
.om-textarea-field .om-field__hint{font:var(--type-caption);color:var(--text-muted)}
.om-textarea-field .om-field__hint--error{color:var(--danger)}
.om-textarea{width:100%;background:var(--surface);border:1px solid var(--border-default);
  border-radius:var(--radius-md);padding:10px 12px;font:var(--type-body);color:var(--text-strong);
  resize:vertical;min-height:88px;
  transition:var(--transition-colors),box-shadow var(--duration-fast) var(--ease-standard)}
.om-textarea:hover{border-color:var(--border-strong)}
.om-textarea:focus{outline:none;border-color:var(--border-focus);box-shadow:var(--shadow-focus)}
.om-textarea::placeholder{color:var(--text-faint)}
.om-textarea--mono{font-family:var(--font-mono);font-size:var(--text-sm)}
.om-textarea--error{border-color:var(--danger)}
.om-textarea[disabled]{opacity:.55;background:var(--bg-subtle)}
`;
if (typeof document !== "undefined" && !document.getElementById("om-textarea-css")) {
  const s = document.createElement("style");
  s.id = "om-textarea-css";
  s.textContent = css;
  document.head.appendChild(s);
}
let _id = 0;
function Textarea({
  label,
  hint,
  error,
  mono = false,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || `om-ta-${++_id}`;
  const taCls = ["om-textarea", mono ? "om-textarea--mono" : "", error ? "om-textarea--error" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: ["om-textarea-field", className].filter(Boolean).join(" ")
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "om-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    className: taCls,
    "aria-invalid": !!error
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    className: ["om-field__hint", error ? "om-field__hint--error" : ""].filter(Boolean).join(" ")
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
const css = `
.om-tabs{display:flex;align-items:center;gap:2px;border-bottom:1px solid var(--border-subtle);
  font-family:var(--font-sans)}
.om-tabs--pill{border-bottom:none;background:var(--bg-subtle);padding:3px;border-radius:var(--radius-md);
  gap:2px;display:inline-flex}
.om-tab{appearance:none;border:none;background:transparent;cursor:pointer;
  font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);
  padding:10px 12px;display:inline-flex;align-items:center;gap:7px;position:relative;
  transition:var(--transition-colors)}
.om-tab svg{width:16px;height:16px}
.om-tab:hover{color:var(--text-strong)}
.om-tab--active{color:var(--text-strong)}
.om-tabs:not(.om-tabs--pill) .om-tab--active::after{content:"";position:absolute;left:8px;right:8px;
  bottom:-1px;height:2px;border-radius:2px;background:var(--accent)}
.om-tabs--pill .om-tab{border-radius:var(--radius-sm);padding:7px 14px}
.om-tabs--pill .om-tab--active{background:var(--surface);color:var(--text-strong);box-shadow:var(--shadow-xs)}
.om-tab__count{font-family:var(--font-mono);font-size:var(--text-2xs);color:var(--text-faint);
  background:var(--bg-sunken);border-radius:var(--radius-full);padding:1px 6px}
`;
if (typeof document !== "undefined" && !document.getElementById("om-tabs-css")) {
  const s = document.createElement("style");
  s.id = "om-tabs-css";
  s.textContent = css;
  document.head.appendChild(s);
}
function Tabs({
  items = [],
  value,
  onChange,
  variant = "underline",
  className = ""
}) {
  const cls = ["om-tabs", variant === "pill" ? "om-tabs--pill" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: cls,
    role: "tablist"
  }, items.map(it => {
    const active = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": active,
      className: ["om-tab", active ? "om-tab--active" : ""].filter(Boolean).join(" "),
      onClick: () => onChange && onChange(it.value)
    }, it.icon, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      className: "om-tab__count"
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/screens.jsx
try { (() => {
/* omnara Management Dashboard — screens */
const DSx = window.OmnaraDesignSystem_c73439;
const {
  Card,
  CardHeader,
  Badge,
  Tag,
  Button,
  IconButton,
  Avatar,
  Tabs,
  Select,
  Switch
} = DSx;
const Ic = n => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n
});

/* ---------- Overview ---------- */
const STATS = [{
  k: "Live pages",
  v: "1,204",
  icon: "check-check",
  tone: "live"
}, {
  k: "Needs review",
  v: "4",
  icon: "eye",
  tone: "warning"
}, {
  k: "Sites connected",
  v: "3",
  icon: "globe",
  tone: "neutral"
}, {
  k: "Drafted today",
  v: "18",
  icon: "sparkles",
  tone: "ai"
}];
const ACTIVITY = [{
  who: "agent",
  t: "Published 3 pages to shop.example.com",
  time: "2s ago",
  icon: "check-check"
}, {
  who: "agent",
  t: "Drafted “Summer collection” landing page",
  time: "11m ago",
  icon: "sparkles"
}, {
  who: "Dana",
  t: "Approved “Returns policy” update",
  time: "1h ago",
  icon: "circle-check"
}, {
  who: "agent",
  t: "Synced 42 media assets to the CDN",
  time: "2h ago",
  icon: "refresh-cw"
}];
const REVIEW = [{
  t: "Summer collection — landing page",
  site: "shopify",
  type: "page",
  when: "11m ago"
}, {
  t: "How we source our linen",
  site: "wordpress",
  type: "post",
  when: "26m ago"
}, {
  t: "Updated FAQ — shipping & returns",
  site: "wordpress",
  type: "page",
  when: "1h ago"
}, {
  t: "Product copy — Aram lounge chair",
  site: "shopify",
  type: "product",
  when: "3h ago"
}];
function Overview() {
  return /*#__PURE__*/React.createElement("div", {
    className: "dash__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash__stats"
  }, STATS.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.k,
    elevation: "flat",
    padding: "md",
    className: "stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat__ic stat__ic--" + s.tone
  }, Ic(s.icon)), /*#__PURE__*/React.createElement("div", {
    className: "stat__v"
  }, s.v), /*#__PURE__*/React.createElement("div", {
    className: "stat__k"
  }, s.k)))), /*#__PURE__*/React.createElement("div", {
    className: "dash__cols"
  }, /*#__PURE__*/React.createElement(Card, {
    elevation: "flat",
    padding: "lg",
    className: "grow"
  }, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Needs your review",
    action: /*#__PURE__*/React.createElement(Badge, {
      variant: "ai"
    }, Ic("sparkles"), "drafted by omnara")
  }), /*#__PURE__*/React.createElement("div", {
    className: "rev"
  }, REVIEW.map(r => /*#__PURE__*/React.createElement("div", {
    className: "rev__row",
    key: r.t
  }, /*#__PURE__*/React.createElement("span", {
    className: "rev__ic"
  }, Ic("file-text")), /*#__PURE__*/React.createElement("div", {
    className: "rev__meta"
  }, /*#__PURE__*/React.createElement("b", null, r.t), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Tag, null, r.site), " \xB7 ", r.type, " \xB7 ", r.when)), /*#__PURE__*/React.createElement("div", {
    className: "rev__act"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost"
  }, "View"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary"
  }, "Approve")))))), /*#__PURE__*/React.createElement(Card, {
    elevation: "flat",
    padding: "lg",
    style: {
      width: 320,
      flex: "0 0 320px"
    }
  }, /*#__PURE__*/React.createElement(CardHeader, {
    title: "Activity"
  }), /*#__PURE__*/React.createElement("div", {
    className: "feed"
  }, ACTIVITY.map((a, i) => /*#__PURE__*/React.createElement("div", {
    className: "feed__row",
    key: i
  }, a.who === "agent" ? /*#__PURE__*/React.createElement(Avatar, {
    agent: true,
    size: "xs"
  }) : /*#__PURE__*/React.createElement(Avatar, {
    name: a.who,
    size: "xs"
  }), /*#__PURE__*/React.createElement("div", {
    className: "feed__meta"
  }, /*#__PURE__*/React.createElement("span", null, a.t), /*#__PURE__*/React.createElement("time", null, a.time))))))));
}

/* ---------- Content library ---------- */
const ITEMS = [{
  t: "Homepage",
  type: "page",
  plat: "shopify",
  status: "live",
  by: "agent",
  when: "2s ago"
}, {
  t: "Summer collection",
  type: "page",
  plat: "shopify",
  status: "review",
  by: "agent",
  when: "11m ago"
}, {
  t: "How we source our linen",
  type: "post",
  plat: "wordpress",
  status: "review",
  by: "agent",
  when: "26m ago"
}, {
  t: "Returns policy",
  type: "page",
  plat: "wordpress",
  status: "live",
  by: "Dana",
  when: "1h ago"
}, {
  t: "Aram lounge chair",
  type: "product",
  plat: "shopify",
  status: "draft",
  by: "agent",
  when: "3h ago"
}, {
  t: "About the studio",
  type: "page",
  plat: "custom",
  status: "live",
  by: "agent",
  when: "1d ago"
}];
const STATUS = {
  live: {
    variant: "live",
    dot: true,
    label: "Live"
  },
  review: {
    variant: "warning",
    label: "Needs review"
  },
  draft: {
    variant: "neutral",
    label: "Draft"
  }
};
function ContentLibrary() {
  const [tab, setTab] = React.useState("all");
  const rows = ITEMS.filter(r => tab === "all" ? true : tab === "ai" ? r.by === "agent" : tab === "review" ? r.status === "review" : r.status === "live");
  return /*#__PURE__*/React.createElement("div", {
    className: "dash__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lib__bar"
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      value: "all",
      label: "All",
      count: ITEMS.length
    }, {
      value: "ai",
      label: "AI-drafted"
    }, {
      value: "review",
      label: "Needs review",
      count: 2
    }, {
      value: "live",
      label: "Live"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    className: "lib__tools"
  }, /*#__PURE__*/React.createElement(Select, {
    size: "sm",
    options: ["All platforms", "Shopify", "WordPress", "Custom"]
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    iconLeft: Ic("plus")
  }, "New content"))), /*#__PURE__*/React.createElement(Card, {
    elevation: "flat",
    padding: "sm"
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Title"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Platform"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Author"), /*#__PURE__*/React.createElement("th", null, "Updated"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => {
    const st = STATUS[r.status];
    return /*#__PURE__*/React.createElement("tr", {
      key: r.t
    }, /*#__PURE__*/React.createElement("td", {
      className: "tbl__t"
    }, Ic("file-text"), /*#__PURE__*/React.createElement("b", null, r.t)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, null, r.type)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      icon: Ic("globe")
    }, r.plat)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
      variant: st.variant,
      dot: st.dot
    }, st.label)), /*#__PURE__*/React.createElement("td", {
      className: "tbl__by"
    }, r.by === "agent" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Avatar, {
      agent: true,
      size: "xs"
    }), " omnara") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Avatar, {
      name: r.by,
      size: "xs"
    }), " ", r.by)), /*#__PURE__*/React.createElement("td", {
      className: "tbl__when"
    }, r.when), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(IconButton, {
      label: "More",
      variant: "ghost",
      size: "sm"
    }, Ic("more-horizontal"))));
  })))));
}

/* ---------- Review detail ---------- */
function ReviewQueue({
  onPublish
}) {
  const [sel, setSel] = React.useState(0);
  const r = REVIEW[sel];
  return /*#__PURE__*/React.createElement("div", {
    className: "dash__body rev2"
  }, /*#__PURE__*/React.createElement(Card, {
    elevation: "flat",
    padding: "sm",
    className: "rev2__list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "om-eyebrow",
    style: {
      padding: "8px 10px 4px"
    }
  }, "Queue \xB7 4"), REVIEW.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: it.t,
    className: "rev2__item" + (i === sel ? " is-active" : ""),
    onClick: () => setSel(i)
  }, /*#__PURE__*/React.createElement("b", null, it.t), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Tag, null, it.site), " \xB7 ", it.when)))), /*#__PURE__*/React.createElement(Card, {
    elevation: "flat",
    padding: "lg",
    className: "rev2__detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rev2__head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    variant: "ai"
  }, Ic("sparkles"), "drafted by omnara"), /*#__PURE__*/React.createElement("h2", null, r.t), /*#__PURE__*/React.createElement("p", {
    className: "rev2__sub"
  }, /*#__PURE__*/React.createElement(Tag, {
    icon: Ic("globe")
  }, r.site), " \xB7 ", r.type, " \xB7 ", r.when)), /*#__PURE__*/React.createElement("div", {
    className: "rev2__actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconLeft: Ic("message-square")
  }, "Request changes"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: Ic("check-check"),
    onClick: onPublish
  }, "Approve & publish"))), /*#__PURE__*/React.createElement("div", {
    className: "rev2__preview"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prose"
  }, /*#__PURE__*/React.createElement("h3", null, "Summer, in linen."), /*#__PURE__*/React.createElement("p", null, "A capsule of breathable, naturally dyed pieces \u2014 cut for long days and warm evenings. Each item is woven from European flax and finished in small batches."), /*#__PURE__*/React.createElement("p", null, "Free shipping over $120 \xB7 30-day returns \xB7 carbon-neutral delivery."), /*#__PURE__*/React.createElement("span", {
    className: "diff diff--add"
  }, "+ Added 2 product highlights and an SEO description"), /*#__PURE__*/React.createElement("span", {
    className: "diff diff--add"
  }, "+ Linked 6 products from the Summer collection")))));
}
Object.assign(window, {
  Overview,
  ContentLibrary,
  ReviewQueue
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/shell.jsx
try { (() => {
/* omnara Management Dashboard — shell (sidebar + topbar) */
const DS = window.OmnaraDesignSystem_c73439;
const {
  Avatar,
  IconButton,
  Badge,
  Input,
  Button,
  Tooltip
} = DS;
const NAV = [{
  id: "overview",
  label: "Overview",
  icon: "layout-dashboard"
}, {
  id: "content",
  label: "Content",
  icon: "file-text"
}, {
  id: "review",
  label: "Review queue",
  icon: "eye",
  count: 4
}, {
  id: "sites",
  label: "Sites",
  icon: "globe"
}, {
  id: "settings",
  label: "Settings",
  icon: "shield"
}];
function Sidebar({
  active,
  onNav
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "dash__side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/omnara-mark.svg",
    width: "26",
    height: "26",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "dash__wm"
  }, "omnara"), /*#__PURE__*/React.createElement(Badge, {
    variant: "neutral",
    style: {
      marginLeft: "auto",
      fontSize: 10
    }
  }, "v0.42")), /*#__PURE__*/React.createElement("nav", {
    className: "dash__nav"
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: "dash__navitem" + (active === n.id ? " is-active" : ""),
    onClick: () => onNav(n.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": n.icon
  }), /*#__PURE__*/React.createElement("span", null, n.label), n.count != null && /*#__PURE__*/React.createElement("span", {
    className: "dash__navcount"
  }, n.count)))), /*#__PURE__*/React.createElement("div", {
    className: "dash__sitebox"
  }, /*#__PURE__*/React.createElement("div", {
    className: "om-eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Connected sites"), /*#__PURE__*/React.createElement("div", {
    className: "dash__siterow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--success)"
    }
  }), "shop.example.com", /*#__PURE__*/React.createElement("span", {
    className: "plat"
  }, "shopify")), /*#__PURE__*/React.createElement("div", {
    className: "dash__siterow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--success)"
    }
  }), "journal.example.com", /*#__PURE__*/React.createElement("span", {
    className: "plat"
  }, "wordpress")), /*#__PURE__*/React.createElement("div", {
    className: "dash__siterow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--warning)"
    }
  }), "studio.example.io", /*#__PURE__*/React.createElement("span", {
    className: "plat"
  }, "custom"))), /*#__PURE__*/React.createElement("div", {
    className: "dash__agent"
  }, /*#__PURE__*/React.createElement(Avatar, {
    agent: true,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    className: "dash__agentmeta"
  }, /*#__PURE__*/React.createElement("b", null, "omnara agent"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--success)"
    }
  }), " running \xB7 MCP connected"))));
}
function Topbar({
  title,
  sub,
  action
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "dash__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash__topttl"
  }, /*#__PURE__*/React.createElement("h1", null, title), sub && /*#__PURE__*/React.createElement("span", null, sub)), /*#__PURE__*/React.createElement("div", {
    className: "dash__topsearch"
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "Search content, sites, settings\u2026",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "search"
    })
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Notifications"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    variant: "ghost"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell"
  }))), action, /*#__PURE__*/React.createElement(Avatar, {
    name: "Dana Reyes",
    status: true
  }));
}
Object.assign(window, {
  Sidebar,
  Topbar,
  NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mcp-client/parts.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* omnara MCP Client — parts (dark theme) */
const C = window.OmnaraDesignSystem_c73439;
const {
  Avatar,
  Badge,
  Tag,
  Button,
  IconButton,
  Tooltip
} = C;
const ic = n => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n
});
const SESSIONS = [{
  id: "s1",
  t: "Summer collection launch",
  when: "now",
  active: true
}, {
  id: "s2",
  t: "Migrate blog to WordPress",
  when: "2h"
}, {
  id: "s3",
  t: "Fix product SEO",
  when: "yesterday"
}];
const CONNS = [{
  host: "shop.example.com",
  plat: "shopify",
  ok: true
}, {
  host: "journal.example.com",
  plat: "wordpress",
  ok: true
}, {
  host: "studio.example.io",
  plat: "custom",
  ok: false
}];
function ClientSidebar() {
  return /*#__PURE__*/React.createElement("aside", {
    className: "mcp__side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mcp__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/omnara-mark-inverse.svg",
    width: "24",
    height: "24",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "mcp__wm"
  }, "omnara"), /*#__PURE__*/React.createElement("span", {
    className: "mcp__tagchip"
  }, "MCP client")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    fullWidth: true,
    iconLeft: ic("plus")
  }, "New session"), /*#__PURE__*/React.createElement("div", {
    className: "mcp__eyebrow"
  }, "Sessions"), /*#__PURE__*/React.createElement("div", {
    className: "mcp__sessions"
  }, SESSIONS.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: "mcp__session" + (s.active ? " is-active" : "")
  }, ic("message-square"), /*#__PURE__*/React.createElement("span", {
    className: "mcp__session-t"
  }, s.t), /*#__PURE__*/React.createElement("span", {
    className: "mcp__session-w"
  }, s.when)))), /*#__PURE__*/React.createElement("div", {
    className: "mcp__eyebrow"
  }, "Connections"), /*#__PURE__*/React.createElement("div", {
    className: "mcp__conns"
  }, CONNS.map(c => /*#__PURE__*/React.createElement("div", {
    className: "mcp__conn",
    key: c.host
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: c.ok ? "var(--success)" : "var(--text-faint)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "mcp__conn-h"
  }, c.host), /*#__PURE__*/React.createElement("span", {
    className: "mcp__conn-p"
  }, c.plat)))), /*#__PURE__*/React.createElement("div", {
    className: "mcp__server"
  }, /*#__PURE__*/React.createElement(Avatar, {
    agent: true,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mcp__server-m"
  }, /*#__PURE__*/React.createElement("b", null, "MCP server"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    style: {
      background: "var(--success)"
    }
  }), " connected \xB7 stdio"))));
}
function ToolCall({
  call,
  result
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tool"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tool__call"
  }, /*#__PURE__*/React.createElement("span", {
    className: "arrow"
  }, "\u2192"), " ", call), result && /*#__PURE__*/React.createElement("div", {
    className: "tool__res"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, "\u2190 ok"), " ", result));
}
function DraftCard({
  title,
  meta,
  body,
  onReview,
  onPublish
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "draft"
  }, /*#__PURE__*/React.createElement("div", {
    className: "draft__head"
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "ai"
  }, ic("sparkles"), "draft"), /*#__PURE__*/React.createElement("span", {
    className: "draft__title"
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "draft__meta"
  }, meta)), /*#__PURE__*/React.createElement("p", {
    className: "draft__body"
  }, body), /*#__PURE__*/React.createElement("div", {
    className: "draft__act"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    iconLeft: ic("git-compare")
  }, "View diff"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    onClick: onReview
  }, "Send to review"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    iconLeft: ic("check-check"),
    onClick: onPublish
  }, "Publish")));
}
function Message({
  m,
  onReview,
  onPublish
}) {
  if (m.role === "user") {
    return /*#__PURE__*/React.createElement("div", {
      className: "msg msg--user"
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Dana Reyes",
      size: "sm"
    }), /*#__PURE__*/React.createElement("div", {
      className: "msg__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "msg__name"
    }, "you"), /*#__PURE__*/React.createElement("div", {
      className: "msg__text"
    }, m.text)));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "msg msg--agent"
  }, /*#__PURE__*/React.createElement(Avatar, {
    agent: true,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    className: "msg__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "msg__name"
  }, "omnara"), m.blocks.map((b, i) => {
    if (b.type === "text") return /*#__PURE__*/React.createElement("div", {
      className: "msg__text",
      key: i
    }, b.text);
    if (b.type === "tool") return /*#__PURE__*/React.createElement(ToolCall, {
      key: i,
      call: b.call,
      result: b.result
    });
    if (b.type === "draft") return /*#__PURE__*/React.createElement(DraftCard, _extends({
      key: i
    }, b, {
      onReview: onReview,
      onPublish: onPublish
    }));
    return null;
  })));
}
Object.assign(window, {
  ClientSidebar,
  Message,
  ToolCall,
  DraftCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mcp-client/parts.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
