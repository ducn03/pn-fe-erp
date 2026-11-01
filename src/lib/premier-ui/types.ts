/**
 * Type definitions for Premier UI components
 */

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  badge?: string;
  permissions?: string[];
}

export interface NavSection {
  heading?: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  OUTLINE: 'outline',
  DANGER: 'danger',
  GHOST: 'ghost'
} as const;
export type ButtonVariant = typeof BUTTON_VARIANTS[keyof typeof BUTTON_VARIANTS];

export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const;
export type ButtonSize = typeof BUTTON_SIZES[keyof typeof BUTTON_SIZES];

export const BADGE_VARIANTS = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  NEUTRAL: 'neutral',
  OUTLINE: 'outline'
} as const;
export type BadgeVariant = typeof BADGE_VARIANTS[keyof typeof BADGE_VARIANTS];

export const CALLOUT_VARIANTS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;
export type CalloutVariant = typeof CALLOUT_VARIANTS[keyof typeof CALLOUT_VARIANTS];

export const CARD_ACCENTS = {
  ORANGE: 'orange',
  GREEN: 'green',
  ESPRESSO: 'espresso',
  NONE: 'none'
} as const;
export type CardAccent = typeof CARD_ACCENTS[keyof typeof CARD_ACCENTS];

export const STAT_TRENDS = {
  UP: 'up',
  DOWN: 'down',
  NEUTRAL: 'neutral'
} as const;
export type StatTrend = typeof STAT_TRENDS[keyof typeof STAT_TRENDS];
