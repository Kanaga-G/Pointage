import React from 'react';

interface LayoutFixProps {
  title?: string;
  showNavigation?: boolean;
  children?: React.ReactNode;
}

export default function LayoutFix({ children }: LayoutFixProps) {
  // Legacy compatibility wrapper: old pages can keep using <LayoutFix>,
  // while DashboardLayout provides the real shell.
  return <>{children}</>;
}
