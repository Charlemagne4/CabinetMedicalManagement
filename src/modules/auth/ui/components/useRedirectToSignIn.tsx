'use client';

import { useRouter, usePathname } from 'next/navigation';

function useRedirectToSignIn() {
  const router = useRouter();
  const pathname = usePathname();

  return () => {
    const origin = window.location.origin;
    const redirectUrl = new URL('/signin', origin);
    redirectUrl.searchParams.set('callbackUrl', pathname);
    router.push(redirectUrl.toString());
  };
}

export default useRedirectToSignIn;
