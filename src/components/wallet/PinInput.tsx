import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  autoFocus?: boolean;
  error?: boolean;
}

export function PinInput({ length = 6, value, onChange, onComplete, autoFocus, error }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  useEffect(() => { if (value.length === length) onComplete?.(value); }, [value, length, onComplete]);

  return (
    <div className="relative">
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        className="absolute inset-0 h-full w-full opacity-0"
        aria-label="PIN code"
      />
      <div className="flex justify-center gap-3" onClick={() => ref.current?.focus()}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          return (
            <div
              key={i}
              className={cn(
                "grid h-14 w-12 place-items-center rounded-xl border transition-all duration-300",
                filled ? "border-foreground/40 bg-surface-elevated" : "border-border bg-surface",
                error && "border-destructive/60 animate-pulse"
              )}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full transition-all duration-300",
                  filled ? "bg-foreground scale-100" : "bg-muted-foreground/20 scale-75"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
