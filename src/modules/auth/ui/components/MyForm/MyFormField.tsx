import { FieldPath, UseFormReturn } from 'react-hook-form';
import MyFormItem from './MyFormItem';
import { FormField } from '@/components/ui/form';

interface FormFieldProps<T extends { email: string; password: string; name?: string }> {
  form: UseFormReturn<T>;
  name: keyof T;
  placeholder: string;
}

function MyFormField<T extends { email: string; password: string; name?: string }>({
  form,
  name,
  placeholder
}: FormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name as FieldPath<T>}
      render={({ field }) => <MyFormItem field={field} placeholder={placeholder} />}
    />
  );
}

export default MyFormField;
