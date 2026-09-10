import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ShinyCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    isLoading?: boolean;
}

export const ShinyCTA = React.forwardRef<HTMLButtonElement, ShinyCTAProps>(
  ({ children, className, isLoading = false, disabled, ...props }, ref) => {
    return (
        <>
            <style>
                {`
                .shiny-cta-wrapper {
                  --shiny-cta-bg: #1D4ED8; /* Blue 700 */
                  --shiny-cta-bg-subtle: #1E3A8A; /* Blue 900 for depth */
                  --shiny-cta-fg: #ffffff;
                  --shiny-cta-highlight: #60A5FA; /* Blue 400 */
                  --shiny-cta-highlight-subtle: #93C5FD; /* Blue 300 */
                }

                @property --gradient-angle {
                  syntax: "<angle>";
                  initial-value: 0deg;
                  inherits: false;
                }

                @property --gradient-angle-offset {
                  syntax: "<angle>";
                  initial-value: 0deg;
                  inherits: false;
                }

                @property --gradient-percent {
                  syntax: "<percentage>";
                  initial-value: 5%;
                  inherits: false;
                }

                @property --gradient-shine {
                  syntax: "<color>";
                  initial-value: white;
                  inherits: false;
                }

                .shiny-cta {
                  --animation: gradient-angle linear infinite;
                  --duration: 3s;
                  --shadow-size: 2px;
                  isolation: isolate;
                  position: relative;
                  overflow: hidden;
                  cursor: pointer;
                  outline-offset: 4px;
                  padding: 0.75rem 1.5rem; /* Adjusted for standard UI sizing */
                  font-family: inherit;
                  font-weight: 600;
                  font-size: 0.875rem;
                  line-height: 1.2;
                  border: 1px solid transparent;
                  border-radius: 360px;
                  color: var(--shiny-cta-fg);
                  background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
                    conic-gradient(
                        from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
                        transparent,
                        var(--shiny-cta-highlight) var(--gradient-percent),
                        var(--gradient-shine) calc(var(--gradient-percent) * 2),
                        var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
                        transparent calc(var(--gradient-percent) * 4)
                      )
                      border-box;
                  box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle), 0 1px 2px rgba(0,0,0,0.05);
                }

                .shiny-cta:disabled {
                  opacity: 0.65;
                  cursor: not-allowed;
                  pointer-events: none;
                }

                .shiny-cta::before,
                .shiny-cta::after,
                .shiny-cta span::before {
                  content: "";
                  pointer-events: none;
                  position: absolute;
                  inset-inline-start: 50%;
                  inset-block-start: 50%;
                  translate: -50% -50%;
                  z-index: -1;
                }

                .shiny-cta:active:not(:disabled) {
                  translate: 0 1px;
                }

                /* Dots pattern */
                .shiny-cta::before {
                  --size: calc(100% - var(--shadow-size) * 3);
                  --position: 2px;
                  --space: calc(var(--position) * 2);
                  width: var(--size);
                  height: var(--size);
                  background: radial-gradient(
                      circle at var(--position) var(--position),
                      white calc(var(--position) / 4),
                      transparent 0
                    )
                    padding-box;
                  background-size: var(--space) var(--space);
                  background-repeat: space;
                  mask-image: conic-gradient(
                    from calc(var(--gradient-angle) + 45deg),
                    black,
                    transparent 10% 90%,
                    black
                  );
                  border-radius: inherit;
                  opacity: 0.2; /* Reduced opacity for cleaner look */
                  z-index: -1;
                }

                /* Inner shimmer */
                .shiny-cta::after {
                  --animation: shimmer linear infinite;
                  width: 100%;
                  aspect-ratio: 1;
                  background: linear-gradient(
                    -50deg,
                    transparent,
                    var(--shiny-cta-highlight),
                    transparent
                  );
                  mask-image: radial-gradient(circle at bottom, transparent 40%, black);
                  opacity: 0.6;
                }

                .shiny-cta span {
                  z-index: 1;
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.5rem;
                  width: 100%;
                }

                .shiny-cta span::before {
                  --size: calc(100% + 1rem);
                  width: var(--size);
                  height: var(--size);
                  box-shadow: inset 0 -1ex 2rem 4px var(--shiny-cta-highlight);
                  opacity: 0;
                  border-radius: 360px;
                }

                /* Animate */
                .shiny-cta {
                  --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
                  transition: var(--transition);
                  transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine;
                }

                .shiny-cta:not(:disabled),
                .shiny-cta:not(:disabled)::before,
                .shiny-cta:not(:disabled)::after {
                  animation: var(--animation) var(--duration),
                    var(--animation) calc(var(--duration) / 0.4) reverse paused;
                  animation-composition: add;
                }

                .shiny-cta:not(:disabled) span::before {
                  transition: opacity var(--transition);
                  animation: calc(var(--duration) * 1.5) breathe linear infinite;
                }

                .shiny-cta:not(:disabled):is(:hover, :focus-visible) {
                  --gradient-percent: 20%;
                  --gradient-angle-offset: 95deg;
                  --gradient-shine: var(--shiny-cta-highlight-subtle);
                }

                .shiny-cta:not(:disabled):is(:hover, :focus-visible),
                .shiny-cta:not(:disabled):is(:hover, :focus-visible)::before,
                .shiny-cta:not(:disabled):is(:hover, :focus-visible)::after {
                  animation-play-state: running;
                }

                .shiny-cta:not(:disabled):is(:hover, :focus-visible) span::before {
                  opacity: 1;
                }

                @keyframes gradient-angle {
                  to {
                    --gradient-angle: 360deg;
                  }
                }

                @keyframes shimmer {
                  to {
                    rotate: 360deg;
                  }
                }

                @keyframes breathe {
                  from,
                  to {
                    scale: 1;
                  }
                  50% {
                    scale: 1.2;
                  }
                }
                `}
            </style>
            <button
              ref={ref}
              disabled={disabled || isLoading}
              className={cn("shiny-cta shiny-cta-wrapper", className)}
              {...props}
            >
                <span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  {children}
                </span>
            </button>
        </>
    );
  }
);

ShinyCTA.displayName = "ShinyCTA";
