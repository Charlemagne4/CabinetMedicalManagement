import { cn } from '@/lib/utils';
import { Avatar } from './ui/avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { USER_IMAGE_FALLBACK } from '@/constants';

const nameFallback = 'Jean Michelle Bruitage';

const avatarVariants = cva('', {
  variants: {
    size: {
      default: 'h-9 w-9',
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      lg: 'h-10 w-10',
      xl: 'h-[160px] w-[160px]',
    },
  },
  defaultVariants: { size: 'default' },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string | null | undefined;
  name: string | null | undefined;
  className?: string;
  onClick?: () => void;
}

function UserAvatar({ imageUrl, name, onClick, className, size }: UserAvatarProps) {
  return (
    <Avatar className={cn(avatarVariants({ size, className }))} onClick={onClick}>
      <Image
        src={imageUrl || USER_IMAGE_FALLBACK}
        alt={name || nameFallback}
        width={200}
        height={200}
      />
    </Avatar>
  );
}
export default UserAvatar;
