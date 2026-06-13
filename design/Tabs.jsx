import * as React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Inline label text. */
  label?: React.ReactNode;
  /** Secondary descriptive line under the label. */
  description?: React.ReactNode;
}

/** Binary toggle for settings — "Let omnara auto-publish", feature flags, etc. */
export function Switch(props: SwitchProps): JSX.Element;
