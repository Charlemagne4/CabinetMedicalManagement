import { ControllerRenderProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
 // Import FieldValues

interface MyFormItemProps<T extends { email: string; password: string; name?: string }> {
  field: ControllerRenderProps<T>;
  placeholder: string;
}

function MyFormItem<T extends { email: string; password: string; name?: string }>({
  field,
  placeholder
}: MyFormItemProps<T>) {
  return (
    <FormItem>
      <FormLabel className="text-blue-700">{placeholder}</FormLabel>
      <FormControl>
        <Input placeholder={placeholder} {...field} className="border-blue-950" />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export default MyFormItem;
