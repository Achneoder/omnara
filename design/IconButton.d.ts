import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. @default "primary" */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Icon node rendered before the label (e.g. a Lucide <i> or SVG). */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  /** Show a spinner and block interaction. @default false */
  loading?: boolean;
  /** Render as a different element/component (e.g. "a"). @default "button" */
  as?: React.ElementType;
  children?: React.ReactNode;
}

/**
 * Primary action control for omnara surfaces.
 */
export function Button(props: ButtonProps): JSX.Element;
