import * as React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "default" */
  variant?: "default" | "accent";
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** When provided, renders a remove (×) button and calls this on click. */
  onRemove?: () => void;
  children?: React.ReactNode;
}

/** Monospace metadata token — taxonomies, platforms, keys, content types. */
export function Tag(props: TagProps): JSX.Element;
