import * as React from "react";

export interface DialogProps {
  /** @default true */
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Leading icon node in the header. */
  icon?: React.ReactNode;
  /** @default "md" */
  size?: "md" | "lg";
  /** Footer node — typically action buttons. */
  footer?: React.ReactNode;
  /** Called on scrim click or close button. */
  onClose?: () => void;
  children?: React.ReactNode;
}

/** Modal dialog with scrim, header, scrollable body and action footer. */
export function Dialog(props: DialogProps): JSX.Element | null;
