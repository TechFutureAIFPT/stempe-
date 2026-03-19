import React from 'react';
import { useDeviceDetection } from './useDeviceDetection';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileColumns?: 1 | 2;
  tabletColumns?: 1 | 2 | 3 | 4;
  desktopColumns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md'
}) => {
  const device = useDeviceDetection();
  
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  let columnClass = columnClasses[desktopColumns];
  if (device.isMobile) columnClass = columnClasses[mobileColumns];
  if (device.isTablet) columnClass = columnClasses[tabletColumns];
  
  return (
    <div className={`grid ${columnClass} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;