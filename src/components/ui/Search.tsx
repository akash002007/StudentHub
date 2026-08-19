import React from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export function Search({
  className,
  value,
  onChange,
  onClear,
  placeholder = "Search internships, skills, companies...",
  ...props
}: SearchProps) {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <SearchIcon className="absolute left-3.5 w-4 h-4 text-muted-foreground dark:text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-10 pr-9 bg-card dark:bg-[#161924] border border-border dark:border-[#2a3042] rounded-xl text-sm text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400/75 transition-all duration-200",
          "hover:border-purple-500/40 dark:hover:border-[#3d465e] focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30"
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 rounded-md text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
