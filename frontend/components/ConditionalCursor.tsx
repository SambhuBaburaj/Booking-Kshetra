'use client';

import { usePathname } from 'next/navigation';
import CustomCursor from './CustomCursor';

const ConditionalCursor = () => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Don't render the custom cursor on admin routes
  if (isAdminRoute) {
    return null;
  }

  return <CustomCursor />;
};

export default ConditionalCursor;