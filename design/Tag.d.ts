import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Elevation treatment. @default "flat" */
  elevation?: "flat" | "raised";
  /** Inner padding. @default "md" */
  padding?: "sm" | "md" | "lg";
  /** Hover/press affordance for clickable cards. @default false */
  interactive?: boolean;
  /** Signal-green selected ring. @default false */
  selected?: boolean;
  children?: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Right-aligned action node. */
  action?: React.ReactNode;
  children?: React.ReactNode;
}

/** Surface container — the default frame for content. Borders over shadows. */
export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: CardHeaderProps): JSX.Element;
