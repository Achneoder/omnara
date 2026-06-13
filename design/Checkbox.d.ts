import * as React from "react";

export interface ToastProps {
  /** @default "info" */
  variant?: "success" | "info" | "danger" | "ai";
  title?: React.ReactNode;
  /** Override the default leading icon. */
  icon?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
}

/** Transient notification — publish results, sync status, agent activity. */
export function Toast(props: ToastProps): JSX.Element;
