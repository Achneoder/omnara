import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Person's name — used for initials fallback and tooltip. */
  name?: string;
  /** Image URL; falls back to initials if absent. */
  src?: string;
  /** @default "md" */
  size?: "xs" | "sm" | "md" | "lg";
  /** Render the omnara agent avatar (mark on dark, green ring). @default false */
  agent?: boolean;
  /** Show an online status dot. @default false */
  status?: boolean;
}

/** User or agent identity chip — initials, image, or the omnara agent mark. */
export function Avatar(props: AvatarProps): JSX.Element;
