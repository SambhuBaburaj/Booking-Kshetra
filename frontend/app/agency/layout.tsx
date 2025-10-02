'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('agencyToken');
      const agencyStr = localStorage.getItem('agency');

      // Skip auth check for login page
      if (pathname === '/agency/login') {
        setLoading(false);
        return;
      }

      if (!token || !agencyStr) {
        router.push('/agency/login');
        return;
      }

      try {
        const agency = JSON.parse(agencyStr);
        if (!agency || !agency.name) {
          router.push('/agency/login');
          return;
        }

        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error('Agency auth error:', error);
        localStorage.removeItem('agencyToken');
        localStorage.removeItem('agency');
        router.push('/agency/login');
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authorization..." />;
  }

  // Don't show protected content on login page
  if (pathname === '/agency/login') {
    return children;
  }

  // Show children only if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}