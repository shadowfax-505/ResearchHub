import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      type={props.type || 'button'}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-darkCanvas disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'px-3 py-1.5 text-xs min-h-8' : 'px-4 py-2 text-sm min-h-10',
        variant === 'primary' && 'bg-primary text-white shadow-stitch hover:bg-primaryDark',
        (variant === 'secondary' || variant === 'outline') && 'border border-line bg-paper text-ink shadow-stitch hover:border-primary hover:text-primary dark:border-darkLine dark:bg-darkCard dark:text-darkInk dark:hover:border-primary',
        variant === 'ghost' && 'text-muted hover:bg-primarySoft hover:text-primary dark:text-darkMuted dark:hover:bg-darkCard dark:hover:text-darkInk',
        className
      )}
      {...props}
    />
  );
}
