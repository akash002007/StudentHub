import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl";

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700 shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60 shadow-2xs hover:-translate-y-0.5 transition-all",
      outline:
        "border border-border/80 bg-card/80 hover:bg-muted text-foreground hover:border-blue-500/40 shadow-2xs hover:-translate-y-0.5 transition-all",
      ghost:
        "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-900/20 hover:-translate-y-0.5 transition-all",
      gradient:
        "bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
