import sonderLogo from "@/assets/sonder-logo.png";
import { cn } from "@/lib/utils";

export function SonderLogo({ className, withText = false, size = 40 }: { className?: string; withText?: boolean; size?: number }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative grid place-items-center rounded-2xl bg-gradient-dark glow-ring"
        style={{ width: size, height: size }}
      >
        <img
          src={sonderLogo}
          alt="Sonder logo"
          className="h-[70%] w-[70%] object-contain"
          style={{ filter: "brightness(1.6) contrast(1.1)" }}
        />
      </div>
      {withText && (
        <div className="leading-none">
          <div className="font-display text-xl font-semibold tracking-tight text-gradient">Sonder</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wallet</div>
        </div>
      )}
    </div>
  );
}
