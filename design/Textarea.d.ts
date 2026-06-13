import React from "react";

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
export function Input({
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
  const boxCls = [
    "om-input",
    `om-input--${size}`,
    error ? "om-input--error" : "",
    disabled ? "om-input--disabled" : "",
  ].filter(Boolean).join(" ");
  return (
    <div className={["om-field", className].filter(Boolean).join(" ")}>
      {label && (
        <label className="om-field__label" htmlFor={fieldId}>
          {label}{required && <span className="om-field__req">*</span>}
        </label>
      )}
      <div className={boxCls}>
        {iconLeft && <span className="om-input__affix">{iconLeft}</span>}
        {prefix && <span className="om-input__prefix">{prefix}</span>}
        <input id={fieldId} disabled={disabled} aria-invalid={!!error} {...rest} />
        {iconRight && <span className="om-input__affix">{iconRight}</span>}
      </div>
      {(hint || error) && (
        <span className={["om-field__hint", error ? "om-field__hint--error" : ""].filter(Boolean).join(" ")}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
