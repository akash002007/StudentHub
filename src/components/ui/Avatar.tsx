import React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
}

export function Avatar({
  src,
  alt = "Avatar",
  name = "User",
  size = "md",
  isOnline,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeStyles = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg font-semibold",
    xl: "w-20 h-20 text-xl font-bold",
  };

  const indicatorSizes = {
    xs: "w-1.5 h-1.5 bottom-0 right-0",
    sm: "w-2 h-2 bottom-0 right-0",
    md: "w-2.5 h-2.5 bottom-0.5 right-0.5",
    lg: "w-3.5 h-3.5 bottom-1 right-1",
    xl: "w-4 h-4 bottom-1.5 right-1.5",
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)} {...props}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-medium select-none ring-2 ring-background",
          sizeStyles[size],
          !src || imageError
            ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white"
            : "bg-muted"
        )}
      >
        {src && !imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {typeof isOnline === "boolean" && (
        <span
          className={cn(
            "absolute rounded-full border-2 border-background",
            indicatorSizes[size],
            isOnline ? "bg-emerald-500" : "bg-zinc-400"
          )}
        />
      )}
    </div>
  );
}
