"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: (string | MultiSelectOption)[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  maxDisplayedChips?: number;
  emptyMessage?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  options,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  className,
  id,
  maxDisplayedChips = 3,
  emptyMessage = "No matching options found.",
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: MultiSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Keyboard navigation on dropdown container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      if (!isOpen && document.activeElement === containerRef.current) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const toggleOption = (optionVal: string) => {
    if (value.includes(optionVal)) {
      onChange(value.filter((v) => v !== optionVal));
    } else {
      onChange([...value, optionVal]);
    }
  };

  const removeValue = (valToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(value.filter((v) => v !== valToRemove));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const displayedChips = value.slice(0, maxDisplayedChips);
  const extraCount = value.length - maxDisplayedChips;

  return (
    <div className={cn("w-full space-y-1.5", className)} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button / Box */}
        <div
          id={selectId}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-disabled={disabled}
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={cn(
            "min-h-10 w-full rounded-xl bg-card dark:bg-[#161924] border border-border dark:border-[#2a3042] px-3 py-1.5 text-xs text-foreground dark:text-slate-100 transition-all duration-200 cursor-pointer flex items-center justify-between gap-2",
            "hover:border-purple-500/50 dark:hover:border-[#3d465e] focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30",
            disabled && "opacity-50 bg-muted dark:disabled:bg-muted/40 cursor-not-allowed",
            error && "border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            isOpen && "border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20 dark:ring-purple-500/30"
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 flex-1 max-w-[calc(100%-48px)]">
            {value.length === 0 ? (
              <span className="text-muted-foreground/70 dark:text-slate-400/80 select-none py-1">
                {placeholder}
              </span>
            ) : (
              <>
                {displayedChips.map((val) => {
                  const opt = normalizedOptions.find((o) => o.value === val);
                  const labelText = opt ? opt.label : val;
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300 font-medium text-[11px] border border-purple-500/25 max-w-[200px] truncate"
                    >
                      <span className="truncate">{labelText}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${labelText}`}
                        onClick={(e) => removeValue(val, e)}
                        className="hover:text-rose-500 focus:outline-none p-0.5 shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
                {extraCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted dark:bg-muted/70 text-muted-foreground dark:text-slate-300 font-semibold text-[10px] border border-border/60 dark:border-border/80">
                    +{extraCount} more
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 text-muted-foreground dark:text-slate-400">
            {value.length > 0 && !disabled && (
              <button
                type="button"
                aria-label="Clear all selections"
                onClick={clearAll}
                className="p-1 hover:text-foreground dark:hover:text-slate-100 rounded transition-colors text-muted-foreground dark:text-slate-400"
                title="Clear all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-muted-foreground dark:text-slate-400",
                isOpen && "rotate-180 text-purple-500 dark:text-purple-400"
              )}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-50 mt-1.5 w-full rounded-2xl bg-card dark:bg-[#161924] border border-border dark:border-[#2a3042] shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {/* Search Box */}
            <div className="p-2 border-b border-border/60 dark:border-[#2a3042] bg-muted/30 dark:bg-[#12141c]/50 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground dark:text-slate-400 shrink-0 ml-1.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent border-none text-xs text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400/75 focus:outline-none py-1"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 text-xs">
              {filteredOptions.length === 0 ? (
                <div className="py-6 px-3 text-center text-xs text-muted-foreground dark:text-slate-400">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors",
                        isSelected
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 font-semibold"
                          : "text-foreground dark:text-slate-200 hover:bg-muted/60 dark:hover:bg-muted/40"
                      )}
                    >
                      <span className="truncate pr-2">{option.label}</span>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                          isSelected
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "border-border/80 dark:border-[#384157] bg-card dark:bg-[#12141c]"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary / Quick Select Bar */}
            <div className="p-2 border-t border-border/60 dark:border-[#2a3042] bg-muted/20 dark:bg-[#12141c]/50 flex items-center justify-between text-[11px] text-muted-foreground dark:text-slate-400">
              <span>{value.length} selected</span>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
