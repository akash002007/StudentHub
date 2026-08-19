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
      <SearchIcon className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-10 pr-9 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200",
          "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
