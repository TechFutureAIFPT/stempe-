import React from 'react';
import { useDeviceDetection } from './useDeviceDetection';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  mobileSize?: 'sm' | 'md' | 'lg' | 'xl';
  tabletSize?: 'sm' | 'md' | 'lg' | 'xl';
  desktopSize?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: 'lazy' | 'eager';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  mobileSize = 'md',
  tabletSize = 'lg', 
  desktopSize = 'xl',
  loading = 'lazy'
}) => {
  const device = useDeviceDetection();
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };
  
  let sizeClass = sizeClasses[desktopSize];
  if (device.isMobile) sizeClass = sizeClasses[mobileSize];
  if (device.isTablet) sizeClass = sizeClasses[tabletSize];
  
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={`${sizeClass} object-cover rounded-lg ${className}`}
    />
  );
};

export default ResponsiveImage;