import * as React from "react";

export interface SelectOption { value: string; label: string; }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** @default "md" */
  size?: "sm" | "md";
  /** Options as strings or {value,label}; or pass <option> children instead. */
  options?: (string | SelectOption)[];
  children?: React.ReactNode;
}

/** Native select with omnara chevron and field chrome. */
export function Select(props: SelectProps): JSX.Element;
