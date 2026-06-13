import * as React from "react";

export interface TooltipProps {
  /** Tooltip text. */
  label: React.ReactNode;
  /** Optional mono keyboard hint shown after the label (e.g. "⌘K"). */
  kbd?: React.ReactNode;
  /** @default "top" */
  side?: "top" | "bottom";
  /** The trigger element. */
  children: React.ReactNode;
}

/** Hover/focus tooltip on a dark chip — shows labels and keyboard hints. */
export function Tooltip(props: TooltipProps): JSX.Element;
