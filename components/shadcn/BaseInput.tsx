import * as React from 'react'

import { cn } from '@/lib/shadcn'
import { type VariantProps, cva } from 'class-variance-authority'

const inputVariants = cva(
    'flex w-full rounded-lg border border-input hover:border-gray-700 bg-background pl-3 pr-2 py-1 text-md file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'h-14 pl-3 pr-2 py-1 text-lg',
                sm: 'h-10 px-3 py-2 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ variant, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = 'Input'

const BaseInput = Input

export { BaseInput }
