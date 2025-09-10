'use client';

import { logger } from '@/utils/pino';
import { BuiltInProviderType } from 'next-auth/providers/index';
import { LiteralUnion, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
interface useSignInProps {
  provider: LiteralUnion<BuiltInProviderType> | undefined;
}

function useSignIn({ provider }: useSignInProps) {
  const pathname = usePathname();
  if (process.env.NODE_ENV === 'development') {
    logger.info(`Signing in to ${provider}, redirecting to ${pathname}`);
  }
  return () => signIn(provider, { callbackUrl: pathname ?? '/' });
}
export default useSignIn;
