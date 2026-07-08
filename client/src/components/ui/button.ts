import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hoverable:bg-primary/85 shadow-sm',
        gold: 'bg-gold text-pitch font-semibold hoverable:bg-gold-light shadow-sm active:shadow-glow-gold',
        'gold-outline': 'border border-gold/30 text-gold hoverable:bg-gold/10 hoverable:border-gold/50',
        destructive: 'bg-destructive text-destructive-foreground hoverable:bg-destructive/85',
        outline: 'border border-input bg-transparent hoverable:bg-accent hoverable:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hoverable:bg-secondary/85',
        ghost: 'hoverable:bg-accent hoverable:text-accent-foreground',
        link: 'text-primary underline-offset-4 hoverable:underline',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-10 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
