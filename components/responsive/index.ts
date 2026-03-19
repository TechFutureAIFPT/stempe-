// Main responsive layout
export { default as ResponsiveLayout } from './ResponsiveLayout';

// All-in-one layout (workaround for module resolution issues)
export { default as AllInOneLayout } from './AllInOneLayout';

// Responsive components
export { default as ResponsiveImage } from './ResponsiveImage';
export { default as ResponsiveGrid } from './ResponsiveGrid';
export { default as ResponsiveButton } from './ResponsiveButton';
export { default as ResponsiveCard } from './ResponsiveCard';

// Hooks and utilities
export { useDeviceDetection, useBreakpoint, breakpoints } from './useDeviceDetection';
export type { DeviceType } from './useDeviceDetection';