import * as React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Field label rendered above the control. */
  label?: React.ReactNode;
  /** Helper text below the field. */
  hint?: React.ReactNode;
  /** Error message — overrides hint and turns the field red. */
  error?: React.ReactNode;
  /** @default false */
  required?: boolean;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Leading icon node. */
  iconLeft?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  /** Static mono prefix (e.g. a URL scheme or path). */
  prefix?: React.ReactNode;
}

/**
 * Single-line text field with label, hint, error and icon/affix slots.
 */
export function Input(props: InputProps): JSX.Element;
