import { Button } from '@/components/ui/button';
import MyFormField from './MyFormField';
import type { UseFormReturn } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface MyFormProps<T extends { email: string; password: string; name?: string }> {
  form: UseFormReturn<T, unknown, T>;
  onSubmit: (values: T) => void;
}
function MyForm<T extends { email: string; password: string; name?: string }>({
  form,
  onSubmit,
}: MyFormProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSignupPage = pathname === '/signup';
  const targetPath = isSignupPage ? '/signin' : '/signup';
  const buttonLabel = isSignupPage ? 'Signin' : 'Register';

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {'name' in form.getValues() && <MyFormField form={form} name="name" placeholder="Name" />}
      <MyFormField form={form} name="email" placeholder="Email" />
      <MyFormField form={form} name="password" placeholder="Password" />
      <div className="flex items-center justify-around">
        <Button type="submit">Submit</Button>
        <Button
          type="button"
          onClick={() => {
            const redirectUrl = new URL(targetPath, window.location.origin);
            redirectUrl.searchParams.set('callbackUrl', searchParams.get('callbackUrl') || '/');
            router.refresh();
            router.push(redirectUrl.toString());
          }}
        >
          {buttonLabel}
        </Button>
      </div>
    </form>
  );
}
export default MyForm;
