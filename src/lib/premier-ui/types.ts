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

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
export type CalloutVariant = 'info' | 'success' | 'warning' | 'error';
export type CardAccent = 'orange' | 'green' | 'espresso' | 'none';
export type StatTrend = 'up' | 'down' | 'neutral';
