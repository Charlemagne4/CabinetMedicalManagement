import { useState } from "react";
import { type ControllerRenderProps } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface MyFormItemProps<
  T extends { email: string; password: string; name?: string },
> {
  field: ControllerRenderProps<T>;
  placeholder: string;
  password: boolean;
}

function MyFormItem<
  T extends { email: string; password: string; name?: string },
>({ field, placeholder, password }: MyFormItemProps<T>) {
  const [show, setShow] = useState(false);

  return (
    <FormItem>
      <FormLabel className="text-blue-700">{placeholder}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type={password && !show ? "password" : "text"}
            placeholder={placeholder}
            {...field}
            className="border-blue-950 pr-10"
          />
          {password && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShow((prev) => !prev)}
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? (
                <EyeOff className="h-4 w-4 text-blue-900" />
              ) : (
                <Eye className="h-4 w-4 text-blue-900" />
              )}
            </Button>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export default MyFormItem;
