import * as React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/** Checkbox with optional label/description — bulk selection, multi-option settings. */
export function Checkbox(props: CheckboxProps): JSX.Element;
