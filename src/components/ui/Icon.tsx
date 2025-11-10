'use client';

import React from 'react';

/**
 * Base SVG icon component props
 */
interface BaseIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Arrow Back Icon (Left Arrow)
 */
function ArrowBackIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Chevron Left Icon
 */
function ChevronLeftIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Chevron Right Icon
 */
function ChevronRightIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Close Icon (X)
 */
function CloseIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Search Icon (Magnifying Glass)
 */
function SearchIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Sort Icon (Three Horizontal Lines / Menu)
 */
function SortIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Straighten Icon (Ruler)
 */
function StraightenIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M21.5 5.5L18.5 2.5L2.5 18.5L5.5 21.5L21.5 5.5ZM3.5 19L2 17.5L17.5 2L19 3.5L3.5 19Z"
        fill={color}
      />
      <path
        d="M7 4L4 7L5.5 8.5L8.5 5.5L7 4ZM11 8L8 11L9.5 12.5L12.5 9.5L11 8ZM15 12L12 15L13.5 16.5L16.5 13.5L15 12ZM19 16L16 19L17.5 20.5L20.5 17.5L19 16Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Tag Icon (Hashtag/Pound Sign)
 */
function TagIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 10V8H17.09L16.5 4H14.5L15.09 8H11.09L10.5 4H8.5L9.09 8H6V10H8.91L9.5 14H6V16H8.91L9.5 20H11.5L10.91 16H14.91L15.5 20H17.5L16.91 16H20V14H17.09L16.5 10H20ZM14.91 14H10.91L10.32 10H14.32L14.91 14Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Text Format Icon (Uppercase A with Underline)
 */
function TextFormatIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 17V19H19V17H5ZM9.5 15L10.5 12H13.5L14.5 15H16.5L12 4H11L6.5 15H9.5ZM11.5 8.5H12.5L12 7L11.5 8.5Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Weight Icon (Scale)
 */
function WeightIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3C10.34 3 9 4.34 9 6C9 7.66 10.34 9 12 9C13.66 9 15 7.66 15 6C15 4.34 13.66 3 12 3ZM12 7C11.45 7 11 6.55 11 6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6C13 6.55 12.55 7 12 7Z"
        fill={color}
      />
      <path
        d="M20 8H18L16.5 20H7.5L6 8H4L5.5 22H18.5L20 8Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Pokeball Icon
 */
function PokeballIcon({ size = 48, color = '#1D1D1D', className = '' }: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill={color}
        opacity="0.1"
      />
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill={color} />
      <circle cx="12" cy="12" r="1.5" fill="white" />
    </svg>
  );
}

/**
 * Map of icon names to their corresponding icon components
 * This ensures type safety and provides a centralized registry of available icons
 */
export const icons = {
  arrow_back: ArrowBackIcon,
  chevron_left: ChevronLeftIcon,
  chevron_right: ChevronRightIcon,
  close: CloseIcon,
  search: SearchIcon,
  sort: SortIcon,
  straighten: StraightenIcon,
  tag: TagIcon,
  text_format: TextFormatIcon,
  weight: WeightIcon,
  pokeball: PokeballIcon,
} as const;

/**
 * Props interface for the Icon component
 */
export interface IconProps {
  /**
   * The name of the icon to render. Must be a key from the icons map.
   */
  name: keyof typeof icons;
  /**
   * Optional size in pixels. Defaults to 48px.
   */
  size?: number;
  /**
   * Optional color string. Defaults to #1D1D1D (Grayscale Dark).
   */
  color?: string;
  /**
   * Optional additional Tailwind CSS classes.
   */
  className?: string;
}

/**
 * Icon Component
 * 
 * A reusable client-side component that provides standardized SVG icons
 * with consistent sizing and coloring across the application.
 * 
 * Icons are based on Material Design principles and match the design system
 * specifications (48px default size, #1D1D1D default color).
 * 
 * @example
 * ```tsx
 * <Icon name="search" />
 * <Icon name="close" size={24} color="red" />
 * <Icon name="chevron_left" className="hover:opacity-80" />
 * ```
 */
export function Icon({ 
  name, 
  size = 48, 
  color = '#1D1D1D',
  className = '',
}: IconProps) {
  const IconComponent = icons[name];

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
    />
  );
}
