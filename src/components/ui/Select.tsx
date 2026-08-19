import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  options?: (string | SelectOption)[];
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      options,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground dark:text-slate-400 z-10">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full h-10 rounded-xl bg-card dark:bg-[#161924] border border-border dark:border-[#2a3042] px-3.5 pr-9 text-xs text-foreground dark:text-slate-100 transition-all duration-200 appearance-none cursor-pointer",
              "hover:border-purple-500/40 dark:hover:border-[#3d465e] focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30",
              "disabled:opacity-50 disabled:bg-muted dark:disabled:bg-muted/40 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              error && "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          >
            {children
              ? children
              : options?.map((opt) => {
                  const val = typeof opt === "string" ? opt : opt.value;
                  const lbl = typeof opt === "string" ? opt : opt.label;
                  return (
                    <option
                      key={val}
                      value={val}
                      className="bg-card text-foreground dark:bg-[#161924] dark:text-slate-100 py-1.5"
                    >
                      {lbl}
                    </option>
                  );
                })}
          </select>
          <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground dark:text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
