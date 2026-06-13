import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic color. @default "neutral" */
  variant?: "neutral" | "live" | "ai" | "warning" | "danger" | "info" | "solid";
  /** Show a leading status dot (pulses on "live"). @default false */
  dot?: boolean;
  children?: React.ReactNode;
}

/** Pill status indicator — content state, AI-authorship, and counts. */
export function Badge(props: BadgeProps): JSX.Element;
