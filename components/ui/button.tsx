import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cursor-pointer inline-flex font-bold rounded-tl-xl rounded-br-xl shadow-lg',
  {
    variants: {
      variant: {
        default:
          'bg-primary disabled:bg-[#C3C1D7] disabled:text-white text-primary-foreground shadow-xs hover:bg-[#3FE3D2]',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        secondary:
          'border-2 bg-secondary text-secondary-foreground shadow-xs border-gray-200 hover:border-cyan hover:text-cyan',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-w-60 h-15',
        sm: 'px-3 has-[>svg]:px-2.5',
        // sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        // lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        // icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
